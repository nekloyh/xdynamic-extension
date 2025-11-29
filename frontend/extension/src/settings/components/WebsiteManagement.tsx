import React, { useEffect, useRef, useState } from "react";

import { readFromStorage, writeToStorage } from "../../core/storage";
import { filterService, URLItem } from "../../services/filter.service";
import { logger, STORAGE_KEYS } from "../../utils";

type ListType = "whitelist" | "blacklist";

interface WebsiteManagementProps {
  onSave?: () => void;
}

interface URLCardProps {
  items: URLItem[];
  search: string;
  onSearchChange: (value: string) => void;
  isAdding: boolean;
  setIsAdding: (value: boolean) => void;
  input: string;
  setInput: (value: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onBulkAdd: (file: File) => void;
  isUploading: boolean;
  type: ListType;
}

const normalizeUrlInput = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const withProtocol = trimmed.includes("://") ? trimmed : `https://${trimmed}`;
  let hostname = trimmed;

  try {
    const parsed = new URL(withProtocol);
    hostname = parsed.hostname;
  } catch {
    const withoutProtocol = trimmed.replace(/^https?:\/\//, "");
    hostname = withoutProtocol.split("/")[0];
  }

  hostname = hostname.replace(/^www\./, "").toLowerCase();

  if (hostname.startsWith("*") && !hostname.startsWith("*.")) {
    hostname = `*.${hostname.replace(/^\*/, "").replace(/^\./, "")}`;
  }

  const domainRegex = /^(\*\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  const localhostRegex = /^localhost(:\d+)?$/;
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;

  if (domainRegex.test(hostname) || localhostRegex.test(hostname) || ipRegex.test(hostname)) {
    return hostname;
  }

  return null;
};

const createLocalItem = (url: string): URLItem => ({
  id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  url,
  addedAt: new Date(),
  visits: 0,
});

const formatTimeAgo = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ thời gian";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Vừa xong";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  return `${Math.floor(seconds / 86400)} ngày trước`;
};

const toUrlItem = (item: URLItem | any): URLItem => ({
  id: item?.id || item?.url || `url-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  url: item?.url || "",
  addedAt: item?.addedAt instanceof Date ? item.addedAt : new Date(item?.addedAt || item?.created_at || Date.now()),
  visits: typeof item?.visits === "number" ? item.visits : item?.count || 0,
});

const URLCard: React.FC<URLCardProps> = React.memo(({
  items,
  search,
  onSearchChange,
  isAdding,
  setIsAdding,
  input,
  setInput,
  onAdd,
  onDelete,
  onBulkAdd,
  isUploading,
  type
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onBulkAdd(file);
      event.target.value = "";
    }
  };

  const title = type === "whitelist" ? "White List" : "Blacklist";
  const icon = type === "whitelist" ? "✅" : "🚫";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <span className="text-2xl mr-2" aria-hidden="true">{icon}</span>
          {title} ({items.length})
        </h3>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm trong danh sách..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* URL List */}
      <div className="space-y-2 max-h-80 overflow-y-auto mb-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
          >
            <div className="flex items-start flex-1 min-w-0">
              <div className="flex-shrink-0 mt-1">
                {type === "whitelist" ? (
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <svg className="w-3 h-3 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                  {item.url}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimeAgo(item.addedAt)} • {item.visits} lần truy cập
                </p>
              </div>
            </div>
            <button
              onClick={() => onDelete(item.id)}
              className="ml-2 p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              aria-label={`Xóa ${item.url}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Add URL */}
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors font-medium"
        >
          + Thêm URL mới
        </button>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAdd()}
            placeholder="https://example.com hoặc *.example.com"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setIsAdding(false);
                setInput("");
              }}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              onClick={onAdd}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              Thêm
            </button>
          </div>
        </div>
      )}

      {/* Bulk upload */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" />
          </svg>
          <span>Nhập nhanh từ file (.txt, .csv, .json)</span>
        </div>
        <div className="flex items-center space-x-2">
          {isUploading && (
            <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tải file
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv,.json"
          className="hidden"
          onChange={handleFileChange}
          aria-label={`Tải file URL cho ${title}`}
        />
      </div>
    </div>
  );
});

const WebsiteManagement: React.FC<WebsiteManagementProps> = ({ onSave }) => {
  const [whitelist, setWhitelist] = useState<URLItem[]>([]);
  const [blacklist, setBlacklist] = useState<URLItem[]>([]);

  const [whitelistInput, setWhitelistInput] = useState("");
  const [blacklistInput, setBlacklistInput] = useState("");
  const [whitelistSearch, setWhitelistSearch] = useState("");
  const [blacklistSearch, setBlacklistSearch] = useState("");
  const [isWhitelistAdding, setIsWhitelistAdding] = useState(false);
  const [isBlacklistAdding, setIsBlacklistAdding] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadingType, setUploadingType] = useState<ListType | null>(null);

  useEffect(() => {
    const loadCachedLists = async () => {
      try {
        const [cachedWhitelist, cachedBlacklist] = await Promise.all([
          readFromStorage<string[]>(STORAGE_KEYS.WHITELIST, "sync"),
          readFromStorage<string[]>(STORAGE_KEYS.BLACKLIST, "sync"),
        ]);

        if (cachedWhitelist?.length) {
          setWhitelist(cachedWhitelist.map((url) => toUrlItem({ url })));
        }
        if (cachedBlacklist?.length) {
          setBlacklist(cachedBlacklist.map((url) => toUrlItem({ url })));
        }
      } catch (error) {
        logger.warn("Không thể tải danh sách cache từ storage", error);
      }
    };

    loadCachedLists();
    fetchLists();
  }, []);

  const persistLists = async (nextWhitelist: URLItem[], nextBlacklist: URLItem[]) => {
    try {
      await Promise.all([
        writeToStorage(STORAGE_KEYS.WHITELIST, nextWhitelist.map((item) => item.url), "sync"),
        writeToStorage(STORAGE_KEYS.BLACKLIST, nextBlacklist.map((item) => item.url), "sync"),
      ]);
    } catch (error) {
      logger.warn("Không thể lưu cache whitelist/blacklist", error);
    }
  };

  const fetchLists = async () => {
    try {
      const [white, black] = await Promise.all([
        filterService.getWhitelist(),
        filterService.getBlacklist(),
      ]);
      setWhitelist(white);
      setBlacklist(black);
      await persistLists(white, black);
    } catch (error) {
      logger.error("Failed to fetch filter lists:", error);
      setValidationError("Không thể tải danh sách. Đang hiển thị dữ liệu lưu tạm.");
    }
  };

  const isDuplicate = (type: ListType, url: string): boolean => {
    const list = type === "whitelist" ? whitelist : blacklist;
    return list.some((item) => item.url.toLowerCase() === url.toLowerCase());
  };

  const addUrl = async (
    type: ListType,
    rawInput: string,
    options?: { silent?: boolean }
  ): Promise<URLItem | null> => {
    const normalized = normalizeUrlInput(rawInput);
    if (!normalized) {
      if (!options?.silent) {
        setValidationError("URL không hợp lệ. Vui lòng nhập domain hoặc pattern (vd: *.example.com).");
      }
      return null;
    }

    if (isDuplicate(type, normalized)) {
      if (!options?.silent) {
        setValidationError("URL đã tồn tại trong danh sách.");
      }
      return null;
    }

    let newItem: URLItem;

    try {
      newItem = type === "whitelist"
        ? await filterService.addToWhitelist(normalized)
        : await filterService.addToBlacklist(normalized);
    } catch (error) {
      logger.warn(`API ${type} thêm URL thất bại, fallback lưu cục bộ`, error);
      newItem = createLocalItem(normalized);
    }

    const item = toUrlItem(newItem);

    if (type === "whitelist") {
      const nextWhitelist = [...whitelist, item];
      setWhitelist(nextWhitelist);
      await persistLists(nextWhitelist, blacklist);
    } else {
      const nextBlacklist = [...blacklist, item];
      setBlacklist(nextBlacklist);
      await persistLists(whitelist, nextBlacklist);
    }

    if (!options?.silent) {
      setValidationError(null);
    }
    onSave?.();
    return item;
  };

  const handleAddURL = async (type: ListType) => {
    const input = type === "whitelist" ? whitelistInput : blacklistInput;
    const added = await addUrl(type, input);
    if (added) {
      if (type === "whitelist") {
        setWhitelistInput("");
        setIsWhitelistAdding(false);
      } else {
        setBlacklistInput("");
        setIsBlacklistAdding(false);
      }
    }
  };

  const handleDeleteURL = async (id: string, type: ListType) => {
    const isLocalItem = id.startsWith("local-");
    try {
      if (type === "whitelist") {
        if (!isLocalItem) {
          await filterService.removeFromWhitelist(id);
        }
        const nextWhitelist = whitelist.filter((item) => item.id !== id);
        setWhitelist(nextWhitelist);
        await persistLists(nextWhitelist, blacklist);
      } else {
        if (!isLocalItem) {
          await filterService.removeFromBlacklist(id);
        }
        const nextBlacklist = blacklist.filter((item) => item.id !== id);
        setBlacklist(nextBlacklist);
        await persistLists(whitelist, nextBlacklist);
      }
      onSave?.();
    } catch (error) {
      logger.error(`Failed to remove from ${type}:`, error);
      setValidationError("Không thể xóa URL. Vui lòng thử lại.");
    }
  };

  const parseUrlsFromFile = async (file: File): Promise<string[]> => {
    const text = await file.text();

    if (file.name.endsWith(".json")) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return parsed.map(String);
        if (Array.isArray(parsed.urls)) return parsed.urls.map(String);
      } catch {
        // fall through to text parsing
      }
    }

    return text
      .split(/[\n,;]+/)
      .map((line) => line.trim())
      .filter(Boolean);
  };

  const handleBulkUpload = async (type: ListType, file: File) => {
    setUploadingType(type);
    try {
      const urls = await parseUrlsFromFile(file);
      if (!urls.length) {
        setValidationError("File không chứa URL hợp lệ.");
        return;
      }

      let added = 0;
      let skipped = 0;

      for (const url of urls) {
        const result = await addUrl(type, url, { silent: true });
        if (result) {
          added += 1;
        } else {
          skipped += 1;
        }
      }

      if (added > 0) {
        setValidationError(skipped ? `Đã thêm ${added} URL, bỏ qua ${skipped} URL không hợp lệ/trùng.` : null);
        if (type === "whitelist") {
          setWhitelistInput("");
          setIsWhitelistAdding(false);
        } else {
          setBlacklistInput("");
          setIsBlacklistAdding(false);
        }
      } else {
        setValidationError("Không URL nào được thêm từ file.");
      }
      onSave?.();
    } catch (error) {
      logger.error("Failed to import URLs from file:", error);
      setValidationError("Không thể đọc file URL. Vui lòng thử lại.");
    } finally {
      setUploadingType(null);
    }
  };

  const filteredWhitelist = whitelist.filter((item) =>
    item.url.toLowerCase().includes(whitelistSearch.toLowerCase())
  );

  const filteredBlacklist = blacklist.filter((item) =>
    item.url.toLowerCase().includes(blacklistSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <span className="text-3xl mr-3" aria-hidden="true">🌐</span>
          Quản Lý Website
        </h2>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-center">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-red-800 dark:text-red-200">{validationError}</span>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <URLCard
          items={filteredWhitelist}
          search={whitelistSearch}
          onSearchChange={setWhitelistSearch}
          isAdding={isWhitelistAdding}
          setIsAdding={setIsWhitelistAdding}
          input={whitelistInput}
          setInput={setWhitelistInput}
          onAdd={() => handleAddURL("whitelist")}
          onDelete={(id) => handleDeleteURL(id, "whitelist")}
          onBulkAdd={(file) => handleBulkUpload("whitelist", file)}
          isUploading={uploadingType === "whitelist"}
          type="whitelist"
        />

        <URLCard
          items={filteredBlacklist}
          search={blacklistSearch}
          onSearchChange={setBlacklistSearch}
          isAdding={isBlacklistAdding}
          setIsAdding={setIsBlacklistAdding}
          input={blacklistInput}
          setInput={setBlacklistInput}
          onAdd={() => handleAddURL("blacklist")}
          onDelete={(id) => handleDeleteURL(id, "blacklist")}
          onBulkAdd={(file) => handleBulkUpload("blacklist", file)}
          isUploading={uploadingType === "blacklist"}
          type="blacklist"
        />
      </div>

      {/* Hint Card */}
      <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3" aria-hidden="true">💡</span>
          <div>
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">Mẹo hữu ích</h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Thêm <code className="px-1 py-0.5 bg-yellow-200 dark:bg-yellow-800 rounded">*.facebook.com</code> để chặn tất cả subdomain của Facebook. Bạn cũng có thể nhập hàng loạt từ file .txt/.csv/.json.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(WebsiteManagement);
