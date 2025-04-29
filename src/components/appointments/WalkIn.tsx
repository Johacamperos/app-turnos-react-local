
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Search, ArrowLeft, UserRound, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface WalkInProps {
  onBack: () => void;
}

const WalkIn: React.FC<WalkInProps> = ({ onBack }) => {
  const [documentNumber, setDocumentNumber] = useState("");
  const [qrScanning, setQrScanning] = useState(false);
  const [qrSuccess, setQrSuccess] = useState(false);
  const [turnCode, setTurnCode] = useState("");
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const handleManualSearch = () => {
    if (!documentNumber) {
      toast({
        title: "Error",
        description: t("walkIn.enterDocumentNumber"),
        variant: "destructive"
      });
      return;
    }
    
    // Simulate finding an appointment
    const generatedTurnCode = "T-" + Math.floor(Math.random() * 900 + 100);
    setTurnCode(generatedTurnCode);
    
    toast({
      title: t("walkIn.appointmentFound"),
      description: t("walkIn.turnActivated") + generatedTurnCode,
    });
    
    // In a real implementation, this would check against the database
    // and register the user's arrival
  };
  
  const startQrScanner = async () => {
    setQrScanning(true);
    setQrSuccess(false);
    
    // In a real implementation, this would use a QR code scanning library
    // For demonstration purposes, we'll just simulate a successful scan after a delay
    setTimeout(() => {
      setQrScanning(false);
      setQrSuccess(true);
      
      const generatedTurnCode = "T-" + Math.floor(Math.random() * 900 + 100);
      setTurnCode(generatedTurnCode);
      
      toast({
        title: t("walkIn.appointmentFound"),
        description: t("walkIn.turnActivated") + generatedTurnCode,
      });
    }, 3000);
    
    // For a real implementation, you would need to use a library like:
    // https://github.com/zxing-js/library
  };
  
  const stopQrScanner = () => {
    setQrScanning(false);
    // In a real implementation, this would stop the camera stream
  };
  
  return (
    <div className="flex flex-col items-center py-10 max-w-md mx-auto">
      <Button variant="ghost" size="sm" onClick={onBack} className="self-start mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("common.back")}
      </Button>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">{t("walkIn.title")}</CardTitle>
          <CardDescription className="text-center">
            {t("walkIn.description")}
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="manual">
              <UserRound className="mr-2 h-4 w-4" />
              {t("walkIn.manual")}
            </TabsTrigger>
            <TabsTrigger value="qr">
              <QrCode className="mr-2 h-4 w-4" />
              {t("walkIn.qr")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="documentNumber" className="block text-sm font-medium mb-1">
                    {t("walkIn.documentNumber")}
                  </label>
                  <Input
                    id="documentNumber"
                    placeholder={t("walkIn.enterDocumentNumber")}
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                  />
                </div>
                
                {turnCode && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Check className="h-6 w-6 text-green-500 mr-2" />
                      <span className="font-medium text-green-700">{t("walkIn.appointmentFound")}</span>
                    </div>
                    <p className="text-green-800">
                      {t("walkIn.turnActivated")} <span className="font-bold text-lg">{turnCode}</span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleManualSearch} className="w-full">
                <Search className="mr-2 h-4 w-4" />
                {t("walkIn.searchAppointment")}
              </Button>
            </CardFooter>
          </TabsContent>
          
          <TabsContent value="qr">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                {qrScanning ? (
                  <>
                    <div className="w-full h-64 bg-muted rounded-md relative overflow-hidden flex items-center justify-center">
                      <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 border-2 border-dashed border-primary-custom rounded-md pointer-events-none" />
                      <div className="animate-pulse text-primary-custom">{t("walkIn.scanning")}</div>
                    </div>
                    <Button variant="outline" onClick={stopQrScanner} className="w-full">
                      {t("walkIn.cancelScan")}
                    </Button>
                  </>
                ) : qrSuccess ? (
                  <div className="w-full p-6 bg-green-50 rounded-md flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Check className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium text-green-800 mb-2">{t("walkIn.appointmentFound")}</h3>
                    <p className="text-green-700 mb-4">
                      {t("walkIn.turnActivated")} <span className="font-bold text-xl">{turnCode}</span>
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-full h-64 bg-muted rounded-md flex items-center justify-center">
                      <QrCode size={100} className="text-muted-foreground opacity-50" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      {t("walkIn.scanQrCode")}
                    </p>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={startQrScanner} 
                disabled={qrScanning} 
                className="w-full"
              >
                <QrCode className="mr-2 h-4 w-4" />
                {qrScanning ? t("walkIn.scanning") : t("walkIn.startScanning")}
              </Button>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default WalkIn;
