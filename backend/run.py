#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script chạy server FastAPI
Sử dụng: python run.py [options]
"""
import sys
import os
import argparse
import uvicorn
from pathlib import Path
from typing import Optional
from app.config import get_settings

# Fix encoding cho Windows terminal
if sys.platform == "win32":
    import locale
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
    if sys.stderr.encoding != 'utf-8':
        sys.stderr.reconfigure(encoding='utf-8')


BACKEND_ROOT = Path(__file__).resolve().parent


def _get_sqlite_path(db_url: str) -> Optional[Path]:
    """Return absolute sqlite path if configured, otherwise None."""
    if not db_url.startswith("sqlite://"):
        return None

    path_part = db_url.replace("sqlite:///", "", 1)
    if path_part == ":memory:":
        return None

    db_path = Path(path_part)
    if not db_path.is_absolute():
        db_path = BACKEND_ROOT / db_path
    return db_path


def check_environment():
    """Validate runtime requirements before starting the API."""
    settings = get_settings()
    print("=" * 60)
    print("DANGEROUS OBJECTS AI API")
    print("=" * 60)

    # Check Python version
    if sys.version_info < (3, 8):
        print("[ERROR] Python 3.8+ required!")
        sys.exit(1)
    print(f"[OK] Python version: {sys.version.split()[0]}")

    # Check .env file
    env_file = BACKEND_ROOT / ".env"
    env_test_file = BACKEND_ROOT / ".env.test"
    env_production_file = BACKEND_ROOT / ".env.production"
    
    # Determine which .env file is being used
    loaded_env = "UNKNOWN"
    if "APP_NAME" in settings.__dict__:
        app_name = settings.APP_NAME
        if "(TEST)" in app_name:
            loaded_env = ".env.test"
        elif "production" in app_name.lower() or settings.DEBUG is False:
            loaded_env = ".env.production"
        else:
            loaded_env = ".env"
    
    print(f"[OK] Loaded config from: {loaded_env}")
    
    if not env_file.exists():
        print("[WARNING] .env is missing!")
        print("   Copy .env.example to .env and fill in your values:")
        print(f"   cp {env_file.name}.example {env_file.name}")

        response = input("\\n[?] Create a template .env now? (y/n): ").lower()
        if response == "y":
            env_example = BACKEND_ROOT / ".env.example"
            if env_example.exists():
                import shutil

                shutil.copy(env_example, env_file)
                print("[OK] Created .env from .env.example")
                print("[WARNING] Update the values in .env before running!")
                sys.exit(0)
            else:
                print("[ERROR] .env.example not found")
                sys.exit(1)
    else:
        print("[OK] .env found")

    # Check model file
    model_file = BACKEND_ROOT / settings.MODEL_PATH
    if not model_file.exists():
        print(f"[ERROR] Model file not found: {model_file}")
        print("   Place the model weights inside the backend directory!")
        sys.exit(1)
    else:
        size_mb = model_file.stat().st_size / (1024 * 1024)
        print(f"[OK] Model file: {model_file} ({size_mb:.1f} MB)")

    # Check database
    db_file = _get_sqlite_path(settings.DATABASE_URL)
    if db_file:
        if db_file.exists():
            print(f"[OK] Database: {db_file}")
        else:
            print(f"[INFO] Database will be created at: {db_file}")
    else:
        print(f"[INFO] Database URL (non-sqlite): {settings.DATABASE_URL}")

    print("=" * 60)
    print()


def init_database():
    """Khởi tạo database nếu chưa có"""
    from app.database import init_db
    print("[SETUP] Khởi tạo database...")
    try:
        init_db()
        print("[OK] Database đã sẵn sàng")
    except Exception as e:
        print(f"[ERROR] Lỗi khởi tạo database: {e}")
        sys.exit(1)


def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description="Chạy Dangerous Objects AI API Server",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ví dụ:
  python run.py                           # Chạy LOCAL dev (.env)
  python run.py --env test                # Chạy TEST environment (.env.test)
  python run.py --env production          # Chạy PRODUCTION (.env.production)
  python run.py --env test --reload       # Chạy TEST với auto-reload
  python run.py --port 3000               # Chạy trên port 3000
  python run.py --reload                  # Chạy với auto-reload (dev mode)
  python run.py --host 0.0.0.0            # Cho phép truy cập từ bên ngoài
  python run.py --workers 4               # Chạy với 4 workers (production)
        """
    )
    
    parser.add_argument(
        "--env",
        type=str,
        default="development",
        choices=["development", "test", "production"],
        help="Môi trường chạy: development (dùng .env), test (dùng .env.test), production (dùng .env.production) - mặc định: development"
    )
    
    parser.add_argument(
        "--host",
        type=str,
        default="127.0.0.1",
        help="Host để bind server (mặc định: 127.0.0.1)"
    )
    
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port để chạy server (mặc định: 8000)"
    )
    
    parser.add_argument(
        "--reload",
        action="store_true",
        help="Bật auto-reload khi code thay đổi (dev mode)"
    )
    
    parser.add_argument(
        "--workers",
        type=int,
        default=1,
        help="Số lượng worker processes (production mode)"
    )
    
    parser.add_argument(
        "--log-level",
        type=str,
        default="info",
        choices=["critical", "error", "warning", "info", "debug"],
        help="Log level (mặc định: info)"
    )
    
    parser.add_argument(
        "--skip-checks",
        action="store_true",
        help="Bỏ qua kiểm tra môi trường"
    )
    
    parser.add_argument(
        "--init-db",
        action="store_true",
        help="Chỉ khởi tạo database rồi thoát"
    )
    
    args = parser.parse_args()
    
    # Load đúng .env file dựa theo --env flag
    env_map = {
        "development": ".env",
        "test": ".env.test",
        "production": ".env.production"
    }
    env_file = env_map[args.env]
    
    # Set biến môi trường để Pydantic settings load đúng file
    os.environ["ENV_FILE"] = str(BACKEND_ROOT / env_file)
    
    print(f"\n{'='*60}")
    print(f"⚡ ENVIRONMENT: {args.env.upper()}")
    print(f"📄 Config file: {env_file}")
    print(f"{'='*60}\n")
    
    # Kiểm tra môi trường
    if not args.skip_checks:
        check_environment()
    
    # Khởi tạo database nếu cần
    if args.init_db:
        init_database()
        print("\n[OK] Xong! Database đã được khởi tạo.")
        return
    
    # Cấu hình uvicorn
    config = {
        "app": "app.main:app",
        "host": args.host,
        "port": args.port,
        "log_level": args.log_level,
    }
    
    # Dev mode (single worker với reload)
    if args.reload:
        print(f"[SETUP] Chạy ở chế độ DEVELOPMENT (auto-reload)")
        print(f"[SERVER] Server: http://{args.host}:{args.port}")
        print(f"[DOCS] Docs: http://{args.host}:{args.port}/docs")
        print("\n[TIP] Nhấn Ctrl+C để dừng server\n")
        config["reload"] = True
        config["reload_dirs"] = ["app"]
    
    # Production mode (multiple workers, no reload)
    elif args.workers > 1:
        print(f"[START] Chạy ở chế độ PRODUCTION ({args.workers} workers)")
        print(f"[SERVER] Server: http://{args.host}:{args.port}")
        print(f"[DOCS] Docs: http://{args.host}:{args.port}/docs")
        print("\n[TIP] Nhấn Ctrl+C để dừng server\n")
        config["workers"] = args.workers
    
    # Single worker mode
    else:
        print("[START] Chạy server...")
        print(f"[SERVER] Server: http://{args.host}:{args.port}")
        print(f"[DOCS] Docs: http://{args.host}:{args.port}/docs")
        print("\n[TIP] Nhấn Ctrl+C để dừng server\n")
    
    # Chạy server
    try:
        uvicorn.run(**config)
    except KeyboardInterrupt:
        print("\n\n👋 Server đã dừng. Tạm biệt!")
    except Exception as e:
        print(f"\n[ERROR] Lỗi khi chạy server: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
