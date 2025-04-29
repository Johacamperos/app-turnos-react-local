
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";

interface LanguageSelectorProps {
  variant?: "icon" | "full";
  align?: "start" | "center" | "end";
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = "full",
  align = "end"
}) => {
  const { languages, currentLanguage, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  
  // Filter only active languages
  const activeLanguages = languages.filter(lang => lang.active);
  
  // Find current language name
  const currentLangName = languages.find(lang => lang.code === currentLanguage)?.name || "English";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-2"
        >
          <Globe className="h-4 w-4" />
          {variant === "full" && (
            <span>{currentLangName}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {activeLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={language.code === currentLanguage ? "bg-accent" : ""}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
