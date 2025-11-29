import React, { useState, useEffect } from "react";

interface WebsiteManagementProps {
  onSave?: () => void;
}

import { filterService, URLItem } from "../../services/filter.service";
import { logger } from "../../utils";

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

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const [white, black] = await Promise.all([
        filterService.getWhitelist(),
        filterService.getBlacklist()
      ]);
      setWhitelist(white);
      setBlacklist(black);
    } catch (error) {
      logger.error("Failed to fetch filter lists:", error);
    }
  };

  const validateURL = (url: string): boolean => {
    try {
      // Remove protocol if present for validation
      const cleanUrl = url.replace(/^https?:\/\//, "");
      // Basic domain validation
      const domainRegex = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
      return domainRegex.test(cleanUrl);
    } catch {
      return false;
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return "Vừa xong";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    return `${Math.floor(seconds / 86400)} ngày trước`;
  };

  const handleAddURL = async (type: "whitelist" | "blacklist") => {
    const input = type === "whitelist" ? whitelistInput : blacklistInput;
    const cleanUrl = input.replace(/^https?:\/\//, "").trim();

    if (!validateURL(cleanUrl)) {
      setValidationError("URL không hợp lệ. Vui lòng thử lại.");
      return;
    }

    try {
      if (type === "whitelist") {
        const newItem = await filterService.addToWhitelist(cleanUrl);
        setWhitelist([...whitelist, newItem]);
        setWhitelistInput("");
        setIsWhitelistAdding(false);
      } else {
        const newItem = await filterService.addToBlacklist(cleanUrl);
        setBlacklist([...blacklist, newItem]);
        setBlacklistInput("");
        setIsBlacklistAdding(false);
      }
      setValidationError(null);
      onSave?.();
    } catch (error) {
      logger.error(`Failed to add to ${type}:`, error);
      setValidationError("Có lỗi xảy ra khi thêm URL.");
    }
  };

  const handleDeleteURL = async (id: string, type: "whitelist" | "blacklist") => {
    try {
      if (type === "whitelist") {
        await filterService.removeFromWhitelist(id);
        setWhitelist(whitelist.filter(item => item.id !== id));
      } else {
        await filterService.removeFromBlacklist(id);
        setBlacklist(blacklist.filter(item => item.id !== id));
      }
      onSave?.();
    } catch (error) {
      logger.error(`Failed to remove from ${type}:`, error);
    }
  };

  const filteredWhitelist = whitelist.filter(item =>
    item.url.toLowerCase().includes(whitelistSearch.toLowerCase())
  );

  const filteredBlacklist = blacklist.filter(item =>
    item.url.toLowerCase().includes(blacklistSearch.toLowerCase())
  );

  const URLCard = ({ 
    items, 
    search, 
    onSearchChange, 
    isAdding, 
    setIsAdding, 
    input, 
    setInput, 
    onAdd, 
    onDelete, 
    type 
  }: {
    items: URLItem[];
    search: string;
    onSearchChange: (value: string) => void;
    isAdding: boolean;
    setIsAdding: (value: boolean) => void;
    input: string;
    setInput: (value: string) => void;
    onAdd: () => void;
    onDelete: (id: string) => void;
    type: "whitelist" | "blacklist";
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          {type === "whitelist" ? (
            <>
              <span className="text-2xl mr-2">✅</span>
              White List ({items.length})
            </>
          ) : (
            <>
              <span className="text-2xl mr-2">🚫</span>
              Blacklist ({items.length})
            </>
          )}
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
                    <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <svg className="w-3 h-3 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            placeholder="https://example.com"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            onKeyPress={(e) => e.key === 'Enter' && onAdd()}
          />
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setIsAdding(false);
                setInput("");
                setValidationError(null);
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
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <span className="text-3xl mr-3">🌐</span>
          Quản Lý Website
        </h2>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-center">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
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
          type="blacklist"
        />
      </div>

      {/* Hint Card */}
      <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">💡</span>
          <div>
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">Mẹo hữu ích</h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Thêm <code className="px-1 py-0.5 bg-yellow-200 dark:bg-yellow-800 rounded">*.facebook.com</code> để chặn tất cả subdomain của Facebook
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(WebsiteManagement);
