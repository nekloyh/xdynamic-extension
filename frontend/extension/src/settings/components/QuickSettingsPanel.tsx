import React, { useState, useEffect } from 'react';
import RippleButton from './RippleButton';

interface QuickSetting {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  color?: string;
}

interface QuickSettingsPanelProps {
  settings: QuickSetting[];
  isOpen: boolean;
  onClose: () => void;
  position?: 'right' | 'left';
}

/**
 * QuickSettingsPanel - Sliding panel for quick access to common settings
 * 
 * Features:
 * - Smooth slide-in/out animation
 * - Toggle switches with visual feedback
 * - Backdrop overlay
 * - Keyboard navigation (Esc to close)
 * - Responsive design
 * 
 * @example
 * <QuickSettingsPanel
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   settings={quickSettings}
 * />
 */
const QuickSettingsPanel: React.FC<QuickSettingsPanelProps> = ({
  settings,
  isOpen,
  onClose,
  position = 'right',
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`
          fixed top-0 ${position === 'right' ? 'right-0' : 'left-0'}
          h-full w-80 bg-white/95 dark:bg-slate-900/90 border-l border-slate-200/60 dark:border-slate-800/70
          shadow-2xl z-50
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : position === 'right' ? 'translate-x-full' : '-translate-x-full'}
        `}
        role="dialog"
        aria-label="Quick Settings"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/70 dark:border-slate-800/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Cài đặt nhanh
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Truy cập nhanh các tính năng
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
            aria-label="Đóng"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Settings List */}
        <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-140px)]">
          {settings.map((setting, index) => (
            <div
              key={setting.id}
              className="animate-slide-in-right"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ToggleCard
                icon={setting.icon}
                label={setting.label}
                value={setting.value}
                onChange={setting.onChange}
                color={setting.color}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200/70 dark:border-slate-800/70 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur">
          <RippleButton
            variant="ghost"
            fullWidth
            onClick={onClose}
            className="justify-center"
          >
            Đóng
          </RippleButton>
        </div>
      </div>
    </>
  );
};

// Toggle Card Component
interface ToggleCardProps {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  color?: string;
}

const ToggleCard: React.FC<ToggleCardProps> = ({
  icon,
  label,
  value,
  onChange,
  color = 'blue',
}) => {
  const handleToggle = () => onChange(!value);

  return (
    <button
      onClick={handleToggle}
      className="w-full p-4 rounded-xl bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 flex items-center justify-between group backdrop-blur"
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${value ? `bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400` : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
            transition-all duration-200
          `}
        >
          {icon}
        </div>

        {/* Label */}
        <span className="font-medium text-gray-800 dark:text-white">
          {label}
        </span>
      </div>

      {/* Toggle Switch */}
      <div
        className={`
          relative w-12 h-6 rounded-full transition-colors duration-200
          ${value ? `bg-${color}-600` : 'bg-gray-300 dark:bg-gray-600'}
        `}
      >
        <div
          className={`
            absolute top-1 left-1 w-4 h-4 rounded-full bg-white
            shadow-md transition-transform duration-200
            ${value ? 'translate-x-6' : 'translate-x-0'}
          `}
        />
      </div>
    </button>
  );
};

export default QuickSettingsPanel;
