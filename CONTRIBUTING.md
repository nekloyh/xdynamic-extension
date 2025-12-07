# 🤝 Contributing to XDynamic Extension

Cảm ơn bạn đã muốn contribute! Hướng dẫn này sẽ giúp bạn bắt đầu.

## 📋 Trước khi bắt đầu

1. **Setup local environment**
   ```bash
   # Clone repository
   git clone https://github.com/nekloyh/xdynamic-extension.git
   cd xdynamic-extension
   
   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   cp .env.example .env
   
   # Frontend
   cd ../frontend/extension
   npm install
   cp .env.example .env
   ```

2. **Read documentation**
   - [QUICK_START.md](docs/QUICK_START.md) - Setup & run locally
   - [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Project structure
   - [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) - Build & distribution

## 🔧 Making Changes

### 1. Create a Feature Branch

```bash
# Always branch from main or develop
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
# or bugfix/your-bug-fix
# or docs/documentation-update
```

### 2. Make Your Changes

**Backend (Python)**
```bash
cd backend

# Run with auto-reload
python run.py --reload

# Make changes in app/ folder
# Check: http://localhost:8000/docs
```

**Frontend (React/TypeScript)**
```bash
cd frontend/extension
npm run dev

# Make changes in src/ folder
# Check: http://localhost:5173
```

**Admin Dashboard**
```bash
cd frontend/admin-dashboard
npm run dev

# Make changes in src/ folder
```

### 3. Test Your Changes

**Backend Testing**
```bash
cd backend

# API should respond
curl http://localhost:8000/health

# Check API docs
open http://localhost:8000/docs
```

**Frontend Testing**
```bash
cd frontend/extension

# Check browser console for errors
# Test in actual Chrome extension environment
```

## 📝 Commit Guidelines

### Commit Message Format

```
type(scope): brief description

Longer explanation if needed. Explain WHAT and WHY, not HOW.

- Bullet point 1
- Bullet point 2

Closes #issue-number (if applicable)
```

### Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style (formatting, missing semicolons, etc)
- **refactor**: Code refactoring without feature/fix
- **perf**: Performance improvement
- **test**: Adding tests
- **chore**: Build, dependencies, etc

### Examples

```bash
# Good
git commit -m "feat(extension): add image upload feature"
git commit -m "fix(api): handle null database values in prediction endpoint"
git commit -m "docs: update deployment guide for Docker"

# Bad
git commit -m "Update"
git commit -m "fixed stuff"
git commit -m "WIP"
```

## 🧪 Code Quality

### Backend (Python)

```bash
cd backend

# Format code
pip install black
black app/

# Lint
pip install pylint
pylint app/

# Type check (optional)
pip install mypy
mypy app/ --ignore-missing-imports
```

### Frontend (TypeScript/React)

```bash
cd frontend/extension

# Format code
npm run format

# Lint
npm run lint

# Build check
npm run build
```

## ✅ Testing Checklist

Before submitting a pull request:

- [ ] Code follows project style
- [ ] Changes tested locally
- [ ] API docs updated (if adding endpoints)
- [ ] No console errors
- [ ] No breaking changes to existing features
- [ ] Commit messages follow guidelines
- [ ] Branch is up to date with main

## 📤 Submitting a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to GitHub repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in description:
     ```markdown
     ## Description
     What does this PR do?
     
     ## Changes
     - Change 1
     - Change 2
     
     ## Related Issues
     Closes #issue-number
     
     ## Testing
     How to test this change?
     ```

3. **Wait for review**
   - Address any comments
   - Push new commits if needed
   - Rebase with main if conflicts

## 🎯 Areas to Contribute

### Backend (Python/FastAPI)
- [ ] New API endpoints
- [ ] Database improvements
- [ ] Authentication features
- [ ] Performance optimization
- [ ] Bug fixes

### Extension (React/TypeScript)
- [ ] UI/UX improvements
- [ ] New detection features
- [ ] Better error handling
- [ ] Accessibility improvements
- [ ] Performance optimization

### Admin Dashboard
- [ ] New admin features
- [ ] Analytics improvements
- [ ] User management
- [ ] Reports & dashboards
- [ ] Data visualization

### Documentation
- [ ] Improve guides
- [ ] Add examples
- [ ] Fix typos
- [ ] Architecture documentation
- [ ] API documentation

## 📚 Project Structure Reference

```
backend/
├── app/
│   ├── main.py              # FastAPI app setup
│   ├── api.py               # API routes
│   ├── database.py          # Database setup
│   ├── config/              # Settings
│   ├── models/              # Database models
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Business logic
│   ├── controllers/         # Route handlers
│   └── middleware/          # Custom middleware

frontend/extension/
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── styles/             # CSS/Tailwind
│   ├── utils/              # Helper functions
│   └── App.tsx             # Main component
```

## 🔐 Security Guidelines

- **Don't commit secrets:** Never commit API keys, tokens, passwords
- **Use environment variables:** Store sensitive data in `.env` files
- **Validate input:** Always validate user input on backend
- **HTTPS only:** Production should always use HTTPS
- **CORS:** Keep CORS config minimal in production

## 📊 Performance Guidelines

- **Backend:** Minimize database queries, use indexes
- **Frontend:** Lazy load components, optimize images
- **API:** Use pagination for large datasets
- **Caching:** Cache static content when appropriate

## 🐛 Reporting Bugs

If you find a bug:

1. **Search existing issues** first
2. **Create a new issue** with:
   - Clear title
   - Description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, browser, versions)
   - Screenshots if applicable

## 📞 Questions?

- Check [documentation](docs/README.md)
- Ask in GitHub discussions
- Open an issue with your question

---

## 🎓 Learning Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS](https://tailwindcss.com/)

---

**Thank you for contributing! 🎉**

Your efforts help make XDynamic better for everyone.

---

**Last Updated:** December 7, 2024
