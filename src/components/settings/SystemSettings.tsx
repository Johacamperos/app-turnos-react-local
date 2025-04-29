import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { BluetoothConnected, Link, Save, Webhook, Trash, Plus, Edit } from 'lucide-react';
import { useSystem } from "@/contexts/SystemContext";

const systemFormSchema = z.object({
  webhookUrl: z.string().url('La URL del webhook debe ser válida').or(z.literal('')),
  notificationsEnabled: z.boolean().default(false),
  deviceId: z.string().optional(),
  deviceName: z.string().min(1, 'El nombre del dispositivo es obligatorio').optional(),
  deviceToken: z.string().optional(),
  additionalConfig: z.string().optional(),
});

type SystemFormValues = z.infer<typeof systemFormSchema>;

const DeviceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre del dispositivo es obligatorio'),
  token: z.string().optional(),
});

type Device = z.infer<typeof DeviceSchema>;

const SystemSettings = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { system, updateSystem, addDevice, removeDevice, updateDevice } = useSystem();
  const [activeTab, setActiveTab] = useState('webhooks');
  const [devices, setDevices] = useState<Device[]>([]);
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [isEditingDevice, setIsEditingDevice] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);

  useEffect(() => {
    if (system && system.devices) {
      setDevices(system.devices.map(device => ({
        id: device.id,
        name: device.name,
        token: device.token
      })));
    }
  }, [system]);

  const defaultValues: Partial<SystemFormValues> = {
    webhookUrl: system?.webhookUrl || '',
    notificationsEnabled: system?.notificationsEnabled || false,
    deviceName: '',
    deviceToken: '',
    additionalConfig: system?.additionalConfig || '',
  };

  const form = useForm<SystemFormValues>({
    resolver: zodResolver(systemFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (system) {
      form.reset({
        webhookUrl: system.webhookUrl || '',
        notificationsEnabled: system.notificationsEnabled || false,
        additionalConfig: system.additionalConfig || '',
      });
    }
  }, [system, form]);

  const onSubmit = async (data: SystemFormValues) => {
    try {
      console.log('System settings submitted:', data);
      
      const systemData = {
        webhookUrl: data.webhookUrl,
        notificationsEnabled: data.notificationsEnabled,
        additionalConfig: data.additionalConfig,
        devices: devices,
      };
      
      await updateSystem(systemData);
      
      toast({
        title: t('settings.changesSaved'),
        description: t('common.success'),
      });
    } catch (error) {
      console.error('Error saving system settings:', error);
      toast({
        title: t('common.error'),
        description: t('settings.errorSaving'),
        variant: 'destructive',
      });
    }
  };

  const handleAddDevice = () => {
    setIsAddingDevice(true);
    setCurrentDevice(null);
    form.reset({
      deviceId: '',
      deviceName: '',
      deviceToken: '',
    });
  };

  const handleEditDevice = (device: Device) => {
    setIsEditingDevice(true);
    setCurrentDevice(device);
    form.reset({
      deviceId: device.id,
      deviceName: device.name,
      deviceToken: device.token,
    });
  };

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      await removeDevice(deviceId);
      
      const updatedDevices = devices.filter(device => device.id !== deviceId);
      setDevices(updatedDevices);

      toast({
        title: 'Dispositivo eliminado',
        description: 'El dispositivo ha sido eliminado correctamente',
      });
    } catch (error) {
      console.error('Error removing device:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el dispositivo',
        variant: 'destructive',
      });
    }
  };

  const handleSaveDevice = async () => {
    const deviceData = {
      id: form.getValues('deviceId') || `device-${Date.now()}`,
      name: form.getValues('deviceName') || '',
      token: form.getValues('deviceToken'),
    };

    if (!deviceData.name) {
      form.setError('deviceName', { 
        type: 'manual', 
        message: 'El nombre del dispositivo es obligatorio' 
      });
      return;
    }

    try {
      if (isEditingDevice && currentDevice) {
        await updateDevice(currentDevice.id, {
          name: deviceData.name,
          token: deviceData.token,
        });
        
        const updatedDevices = devices.map(device => 
          device.id === currentDevice.id ? deviceData : device
        );
        setDevices(updatedDevices);
        
        toast({
          title: 'Dispositivo actualizado',
          description: `El dispositivo "${deviceData.name}" ha sido actualizado correctamente`,
        });
      } else {
        await addDevice(deviceData);
        
        setDevices([...devices, deviceData]);
        
        toast({
          title: 'Dispositivo añadido',
          description: `El dispositivo "${deviceData.name}" ha sido añadido correctamente`,
        });
      }

      setIsAddingDevice(false);
      setIsEditingDevice(false);
      setCurrentDevice(null);
      form.reset({
        deviceId: '',
        deviceName: '',
        deviceToken: '',
      });
    } catch (error) {
      console.error('Error saving device:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el dispositivo',
        variant: 'destructive',
      });
    }
  };

  const handleCancelDeviceForm = () => {
    setIsAddingDevice(false);
    setIsEditingDevice(false);
    setCurrentDevice(null);
    form.reset({
      deviceId: '',
      deviceName: '',
      deviceToken: '',
    });
  };

  return (
    <div className="grid gap-6">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <BluetoothConnected className="h-4 w-4" />
            Dispositivos
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="webhooks">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Webhooks</CardTitle>
                  <CardDescription>
                    Configure los webhooks para recibir notificaciones del sistema en tiempo real
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="webhookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL del Webhook</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input placeholder="https://example.com/webhook" {...field} />
                          </FormControl>
                          <Link className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <FormDescription>
                          Esta URL recibirá notificaciones cuando ocurran eventos en el sistema
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notificationsEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Notificaciones</FormLabel>
                          <FormDescription>
                            Habilitar el envío de notificaciones al webhook
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalConfig"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Configuración adicional</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Configuración adicional en formato JSON"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Configuración adicional para el webhook en formato JSON (opcional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="devices">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Dispositivos</CardTitle>
                    <CardDescription>
                      Vincule dispositivos para recibir notificaciones del sistema
                    </CardDescription>
                  </div>
                  {!isAddingDevice && !isEditingDevice && (
                    <Button
                      onClick={handleAddDevice}
                      type="button"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Añadir Dispositivo
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {isAddingDevice || isEditingDevice ? (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="deviceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del Dispositivo</FormLabel>
                            <FormControl>
                              <Input placeholder="Sala de Conferencias" {...field} />
                            </FormControl>
                            <FormDescription>
                              Un nombre descriptivo para identificar este dispositivo
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deviceToken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Token del Dispositivo (Opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="token-xxxxx" {...field} />
                            </FormControl>
                            <FormDescription>
                              Token de autenticación para este dispositivo
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center justify-end gap-2 pt-4">
                        <Button
                          onClick={handleCancelDeviceForm}
                          type="button"
                          variant="outline"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSaveDevice}
                          type="button"
                        >
                          {isEditingDevice ? 'Actualizar' : 'Guardar'} Dispositivo
                        </Button>
                      </div>
                    </div>
                  ) : devices.length > 0 ? (
                    <div className="space-y-4">
                      {devices.map((device) => (
                        <div key={device.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <h4 className="font-medium">{device.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              ID: {device.id}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleEditDevice(device)}
                              type="button"
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteDevice(device.id)}
                              type="button"
                              variant="outline"
                              size="sm"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-8">
                      <BluetoothConnected className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No hay dispositivos vinculados</h3>
                      <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                        Vincule un dispositivo para recibir notificaciones en tiempo real sobre eventos del sistema
                      </p>
                      <Button
                        onClick={handleAddDevice}
                        type="button"
                      >
                        Añadir Dispositivo
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <div className="mt-6 flex justify-end">
              <Button type="submit" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {t("common.save")}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
