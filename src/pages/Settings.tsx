import LanguageSettings from "@/components/settings/LanguageSettings";
import SystemSettings from "@/components/settings/SystemSettings";
import ThemeSettings from "@/components/settings/ThemeSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Palette, User, Webhook } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";


const Settings = () => {
  const [activeTab, setActiveTab] = useState("language");
  const { t } = useTranslation();

  const { toast } = useToast();
  
  
  const formSchema = z.object({
    companyName: z.string().min(1, t("validation.companyNameRequired")),
    appTitle: z.string().min(1, t("validation.appTitleRequired")),
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t("themes.validation.hexColorInvalid")),
    secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t("themes.validation.hexColorInvalid")),
    accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t("themes.validation.hexColorInvalid")),
    logoUrl: z.string().url().optional().or(z.literal('')),
  });
  



  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',

    },
  });
    const formSettings = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        companyName: "",
      },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
      toast({
        title: t("settings.changesSaved"),
        description: t("common.success"),
      });
    };


    const [languageSettings, setLanguageSettings] = useState({});
    const [themeSettings, setThemeSettings] = useState({});
    const [systemSettings, setSystemSettings] = useState({});
    const [accountSettings, setAccountSettings] = useState({});


  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">{t("settings.title")}</h1>

      <Tabs defaultValue="language" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t("settings.language")}
          </TabsTrigger>
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {t("settings.themes")}
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            {t("settings.general")}
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("settings.account")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="language" className="space-y-6">
          <LanguageSettings />
        </TabsContent>

        <TabsContent value="themes">
         <ThemeSettings />
        </TabsContent>

        <TabsContent value="system">
          <SystemSettings />
        </TabsContent>

        <TabsContent value="account">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-2xl font-bold mb-4">{t("account.title")}</h2>
            <p className="text-muted-foreground">{t("account.description")}</p>
          </div>
        </TabsContent>
      </Tabs>


    </div>
  );
};

export default Settings;
