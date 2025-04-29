import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, RefreshCw, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { defaultTheme } from "../../slices/themeDefaults";

const ThemeSettings = () => {

  const { t } = useTranslation();

  const { theme,updateTheme, resetTheme, defaultThemeColors, colorPresets } = useTheme();
  const { toast } = useToast();

  

  const formSchema = z.object({
    companyName: z.string().min(1, t("validation.companyNameRequired")),
    appTitle: z.string().min(1, t("validation.appTitleRequired")),
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t("themes.validation.hexColorInvalid")),
    secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t("themes.validation.hexColorInvalid")),
    accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t("themes.validation.hexColorInvalid")),
    logoUrl: z.string().url().optional().or(z.literal('')),
  });
  

  // Convert CSS variables to hex colors for the form
  const cssVarToHex = (cssVar: string) => {
    if (cssVar.startsWith('#')) return cssVar;
    return defaultThemeColors.primary; // Default color if not a hex
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: theme.companyName,
      appTitle: theme.appTitle,
      primaryColor: cssVarToHex(theme.colors.primary),
      secondaryColor: cssVarToHex(theme.colors.secondary),
      accentColor: cssVarToHex(theme.colors.accent),
      logoUrl: theme.logoUrl || '',
    },
  });
  
  

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Update the theme context

    console.log(values);
    
    updateTheme({
      companyName: values.companyName,
      appTitle: values.appTitle,
      logoUrl: values.logoUrl,
      colors: {
        primary: values.primaryColor,
        secondary: values.secondaryColor,
        accent: values.accentColor,
      },
    });
        

    // Apply the theme colors immediately to CSS custom properties
    document.documentElement.style.setProperty('--custom-primary', values.primaryColor);
    document.documentElement.style.setProperty('--custom-secondary', values.secondaryColor);
    document.documentElement.style.setProperty('--custom-accent', values.accentColor);

    toast({
      title: t("settings.changesSaved"),
      description: t("common.success"),
    });
  };

  const handleReset = () => {
    resetTheme();
    form.reset({
      companyName: defaultTheme.companyName,
      appTitle: defaultTheme.appTitle,
      primaryColor: defaultThemeColors.primary,
      secondaryColor: defaultThemeColors.secondary,
      accentColor: defaultThemeColors.accent,
      logoUrl: defaultTheme.logoUrl || '',
    });

    toast({
      title: "Configuración restablecida",
      description: "Se ha vuelto a la configuración por defecto.",
    });
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    form.setValue("primaryColor", preset.primary);
    form.setValue("secondaryColor", preset.secondary);
    form.setValue("accentColor", preset.accent);
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("themes.title")}</CardTitle>
                  <CardDescription>{t("themes.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("settings.companyName")}</FormLabel>
                              <FormControl>
                                <Input placeholder="Turnopolis" {...field} />
                              </FormControl>
                              <FormDescription>
                                Este nombre aparecerá en el encabezado y pie de página.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="appTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("settings.appTitle")}</FormLabel>
                              <FormControl>
                                <Input placeholder="Sistema de Gestión de Turnos" {...field} />
                              </FormControl>
                              <FormDescription>
                                Este título se mostrará en diversas partes de la aplicación.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="logoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Logo URL</FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <Input 
                                    placeholder="https://example.com/logo.png" 
                                    {...field} 
                                  />
                                  <Link className="h-5 w-5 text-muted-foreground" />
                                </div>
                              </FormControl>
                              <FormDescription>
                                URL de la imagen del logo de su empresa
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-4">Colores</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="primaryColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("settings.primaryColor")}</FormLabel>
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Input type="text" {...field} />
                                  </FormControl>
                                  <Input
                                    type="color"
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    className="w-10 p-1 h-10"
                                  />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="secondaryColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("settings.secondaryColor")}</FormLabel>
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Input type="text" {...field} />
                                  </FormControl>
                                  <Input
                                    type="color"
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    className="w-10 p-1 h-10"
                                  />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="accentColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("settings.accentColor")}</FormLabel>
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Input type="text" {...field} />
                                  </FormControl>
                                  <Input
                                    type="color"
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    className="w-10 p-1 h-10"
                                  />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleReset}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Restablecer
                        </Button>
                        <Button type="submit" className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          {t("common.save")}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Paletas Predefinidas</CardTitle>
                  <CardDescription>Selecciona una combinación de colores predefinida.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {colorPresets.map((preset) => (
                      <div
                        key={preset.name}
                        className="flex items-center p-2 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => applyColorPreset(preset)}
                      >
                        <div className="flex space-x-2 mr-4">
                          <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: preset.primary }} />
                          <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: preset.secondary }} />
                          <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: preset.accent }} />
                        </div>
                        <span>{preset.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  Haz clic en una paleta para aplicarla, luego guarda los cambios.
                </CardFooter>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Vista Previa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Elemento Primario</div>
                      <div className="h-10 rounded-md" style={{ backgroundColor: form.watch('primaryColor') }}></div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Elemento Secundario</div>
                      <div className="h-10 rounded-md" style={{ backgroundColor: form.watch('secondaryColor') }}></div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Elemento de Acento</div>
                      <div className="h-10 rounded-md" style={{ backgroundColor: form.watch('accentColor') }}></div>
                    </div>
                    {form.watch('logoUrl') && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Logo</div>
                        <div className="h-20 rounded-md bg-background flex items-center justify-center p-2">
                          <img 
                            src={form.watch('logoUrl')} 
                            alt="Logo" 
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error+Loading+Image';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
  );
};

export default ThemeSettings;
