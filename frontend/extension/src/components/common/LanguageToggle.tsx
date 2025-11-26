import React from "react";
import { Globe } from "lucide-react";
import { GlassButton } from "../ui/GlassButton";
import { useLanguageContext } from "../../providers/LanguageProvider";
import { cn } from "../../lib/utils";
import { Language } from "../../types";

interface LanguageToggleProps {
  className?: string;
  variant?: "button" | "dropdown";
  size?: "sm" | "default" | "lg";
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className,
  variant = "button",
  size = "default",
}) => {
  const { language, toggleLanguage, availableLanguages, t, changeLanguage } =
    useLanguageContext();

  if (variant === "dropdown") {
    return (
      <div className={cn("relative", className)}>
        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value as Language)}
          className="glass-medium rounded-glass px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={t("settings.language", "Language")}
        >
          {availableLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.code === "vi"
                ? t("language.vietnamese", "Tiếng Việt")
                : t("language.english", "English")}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <GlassButton
      variant="ghost"
      size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
      onClick={toggleLanguage}
      className={cn("gap-2", className)}
      title={t("settings.language", "Language")}
      aria-label={t("settings.language", "Language")}
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs font-medium uppercase">{language}</span>
    </GlassButton>
  );
};
