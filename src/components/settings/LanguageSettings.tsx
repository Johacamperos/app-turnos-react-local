
import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const LanguageSettings: React.FC = () => {
  const { languages, addLanguage, updateLanguage, toggleLanguageStatus, currentLanguage, changeLanguage } = useLanguage();
  const [newLanguage, setNewLanguage] = useState({ name: "", code: "" });
  const [editLanguage, setEditLanguage] = useState<{ code: string, name: string } | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleAddLanguage = () => {
    if (!newLanguage.name || !newLanguage.code) {
      toast({
        title: t("common.error"),
        description: "Both language name and code are required",
        variant: "destructive"
      });
      return;
    }

    addLanguage({
      name: newLanguage.name,
      code: newLanguage.code.toLowerCase(),
    });

    toast({
      title: t("common.success"),
      description: `Language ${newLanguage.name} has been added`,
    });

    setNewLanguage({ name: "", code: "" });
    setAddDialogOpen(false);
  };

  const handleEditLanguage = () => {
    if (!editLanguage) return;
    
    updateLanguage(editLanguage.code, {
      name: editLanguage.name
    });

    toast({
      title: t("common.success"),
      description: `Language ${editLanguage.name} has been updated`,
    });

    setEditLanguage(null);
    setEditSheetOpen(false);
  };

  const handleToggleStatus = (code: string) => {
    toggleLanguageStatus(code);
    
    const language = languages.find(lang => lang.code === code);
    if (language) {
      toast({
        title: t("common.success"),
        description: `Language ${language.name} has been ${language.active ? 'deactivated' : 'activated'}`,
      });
    }
  };

  const handleUseLanguage = (code: string) => {
    changeLanguage(code);
    
    toast({
      title: t("common.success"),
      description: t("language.saved"),
    });
  };

  const openEditSheet = (language: { code: string, name: string }) => {
    setEditLanguage(language);
    setEditSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("language.title")}</h2>
          <p className="text-muted-foreground">{t("language.description")}</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("language.addNew")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("language.addNew")}</DialogTitle>
              <DialogDescription>
                Add a new language to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t("language.languageName")}
                </Label>
                <Input
                  id="name"
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                  className="col-span-3"
                  placeholder={t("language.enterLanguageName")}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                  {t("language.languageCode")}
                </Label>
                <Input
                  id="code"
                  value={newLanguage.code}
                  onChange={(e) => setNewLanguage({ ...newLanguage, code: e.target.value })}
                  className="col-span-3"
                  placeholder={t("language.enterLanguageCode")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleAddLanguage}>
                {t("common.add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("language.current")}</CardTitle>
          <CardDescription>
            Your active language preference
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {languages.find(lang => lang.code === currentLanguage)?.name || "English"}
              </p>
              <p className="text-sm text-muted-foreground">
                Code: {currentLanguage}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("language.available")}</CardTitle>
          <CardDescription>
            Manage the languages available in your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Language</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>{t("language.status")}</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {languages.map((language) => (
                <TableRow key={language.code}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      {language.code === currentLanguage && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                      <span>{language.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{language.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={language.active} 
                        onCheckedChange={() => handleToggleStatus(language.code)} 
                        disabled={language.code === currentLanguage}
                      />
                      <span>
                        {language.active ? t("language.active") : t("language.inactive")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditSheet(language)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {language.active && language.code !== currentLanguage && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUseLanguage(language.code)}
                        >
                          {t("common.use")}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t("common.edit")} {editLanguage?.name}</SheetTitle>
            <SheetDescription>
              Edit language details
            </SheetDescription>
          </SheetHeader>
          {editLanguage && (
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name">{t("language.languageName")}</Label>
                <Input
                  id="edit-name"
                  value={editLanguage.name}
                  onChange={(e) => setEditLanguage({ ...editLanguage, name: e.target.value })}
                  placeholder={t("language.enterLanguageName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">{t("language.languageCode")}</Label>
                <Input
                  id="edit-code"
                  value={editLanguage.code}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Language code cannot be changed
                </p>
              </div>
              <div className="pt-4 space-x-2 flex justify-end">
                <Button variant="outline" onClick={() => setEditSheetOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleEditLanguage}>
                  {t("common.save")}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default LanguageSettings;
