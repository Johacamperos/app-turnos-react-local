
import ApiService, { QueueItem } from "@/api/ApiService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent,
  CardFooter,
  CardHeader, CardTitle
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { AuthState, initialState, User } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import {
  BellRing, CheckCircle,
  Clock,
  Coffee,
  History,
  Pause,
  Play,
  UserCheck,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast"; // Import useToast


const AdvisorConsole = () => {
  const [advisorStatus, setAdvisorStatus] = useState("available");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState<User | null>(null); // Initialize user as null
  const [activeTime, setActiveTime] = useState(0);
  const [currentClient, setCurrentClient] = useState<QueueItem | null>(null); // Use QueueItem type
  const queryClient = useQueryClient();
  const { toast } = useToast(); // Initialize toast

  const { data: waitingQueue = [], isLoading, isError, refetch } = useQuery<QueueItem[]>({ // Specify type QueueItem[]
    queryKey: ['waitingQueue'],
    queryFn: () => ApiService.fetchAdvisorQueue(),
  });


  useEffect(() => {
    // Find client assigned to this advisor
    if (waitingQueue && user && waitingQueue.length > 0) {
      const index = waitingQueue.findIndex(client => client.advisorId === user.advisorId);
      if (index !== -1) {
        const client = waitingQueue[index];
        setCurrentClient(client);

        // Create a copy and remove the client from the waiting queue view
        const updatedQueue = waitingQueue.filter((_, i) => i !== index);
        queryClient.setQueryData(['waitingQueue'], updatedQueue);
      }
    }
  }, [waitingQueue, user, queryClient]);



   // Get user info from localStorage on mount
   useEffect(() => {
     const storedUser = localStorage.getItem("user");
     if (storedUser) {
       try {
         setUser(JSON.parse(storedUser));
       } catch (error) {
         console.error("Error parsing user from localStorage:", error);
         // Handle potential parsing error, e.g., clear invalid data
         localStorage.removeItem("user");
       }
     }
   }, []);

  const [servedClients, setServedClients] = useState<any[]>([]); // Use a more specific type if possible

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      if (advisorStatus === "serving" && currentClient) {
        setActiveTime(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [advisorStatus, currentClient]);

  // Format active time
  const formatActiveTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };



  // Call next client
  const callNextClient = async () => {
    if (waitingQueue.length > 0 && !currentClient) {
      try {
        const nextClient = await ApiService.fetchAdvisorNextQueue();
        if (nextClient) {
          setCurrentClient(nextClient);
          // Remove the called client from the local waiting queue display
          queryClient.setQueryData<QueueItem[]>(['waitingQueue'], (oldData) =>
            oldData ? oldData.filter(client => client.queueId !== nextClient.queueId) : []
          );
          setAdvisorStatus("serving");
          setActiveTime(0);
        } else {
           toast({
              title: "No hay clientes",
              description: "No hay clientes disponibles en la cola para llamar.",
              variant: "default", // Or "info" if you prefer
           });
        }
      } catch (error) {
        console.error("Error fetching next client:", error);
        toast({
          title: "Error al llamar",
          description: "No se pudo obtener el siguiente cliente.",
          variant: "destructive",
       });
      }
    } else if (!currentClient) {
       toast({
          title: "Cola vacía",
          description: "No hay clientes en espera para llamar.",
          variant: "default",
       });
    }
  };


  const callClientTurn = async (clientToCall: QueueItem) => { // Use QueueItem type
    if (!currentClient) { // Only call if not currently serving
      try {
        const calledClient = await ApiService.fetchAdvisorQueueTurn(clientToCall.queueId);
        if (calledClient) {
          setCurrentClient(calledClient);
           // Remove the called client from the local waiting queue display
           queryClient.setQueryData<QueueItem[]>(['waitingQueue'], (oldData) =>
             oldData ? oldData.filter(client => client.queueId !== calledClient.queueId) : []
           );
          setAdvisorStatus("serving");
          setActiveTime(0);
        }
      } catch (error) {
        console.error("Error calling specific client:", error);
        toast({
           title: "Error al llamar",
           description: "No se pudo llamar al cliente seleccionado.",
           variant: "destructive",
        });
      }
    } else {
        toast({
          title: "Acción no permitida",
          description: "Termine la atención actual antes de llamar a otro cliente.",
          variant: "destructive",
       });
    }
  };

  // Complete current client
  const completeClient = async () => { // Removed parameter, uses state directly
    if (currentClient) {
      
      
      try {
  
        await ApiService.queueComplete({ queueId: currentClient.queueId });
        setCurrentClient(null);
        setAdvisorStatus("available");
        refetch(); // Refetch waiting queue after completing
      } catch (error) {
         console.error("Error completing client:", error);
         toast({
            title: "Error al completar",
            description: "No se pudo completar el turno del cliente.",
            variant: "destructive",
         });
      }
    }
  };

  // Cancel current client
  const cancelClient = async () => { // Removed parameter, uses state directly
    if (currentClient) {
      try {
        await ApiService.queueCancel({ queueId: currentClient.queueId }); // Send object { queueId: string }
        setCurrentClient(null);
        setAdvisorStatus("available");
        refetch(); // Refetch waiting queue after canceling
      } catch (error) {
        console.error("Error canceling client:", error);
        toast({
           title: "Error al cancelar",
           description: "No se pudo cancelar el turno del cliente.",
           variant: "destructive",
        });
      }
    }
  };

  // Toggle advisor status (pause/resume)
  const togglePause = async () => {
     if (advisorStatus === "paused") {
       // If paused, always allow resuming
       try {
         await ApiService.toggleStatusAdvisor();
         setAdvisorStatus(currentClient ? "serving" : "available");
       } catch (error) {
         console.error("Error resuming status:", error);
         toast({
            title: "Error al reanudar",
            description: "No se pudo cambiar el estado.",
            variant: "destructive",
         });
       }
     } else if (!currentClient) {
       // If not paused and no client is active, allow pausing
       try {
         await ApiService.toggleStatusAdvisor();
         setAdvisorStatus("paused");
       } catch (error) {
         console.error("Error pausing status:", error);
         toast({
            title: "Error al pausar",
            description: "No se pudo cambiar el estado.",
            variant: "destructive",
         });
       }
     } else {
       // If not paused and a client IS active, show a message and prevent pausing
       toast({
         title: "Acción no permitida",
         description: "No puedes pausar mientras atiendes a un cliente.",
         variant: "destructive",
       });
     }
   };


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-display font-medium tracking-tight animate-fade-in">
          Consola de Asesor
        </h1>

        <div className="flex items-center gap-2 text-sm animate-fade-in">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {currentTime.toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
          <span className="font-medium">
            {currentTime.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Advisor Status Card */}
      <Card className="glassmorphism animate-scale-in">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
              <div className="mr-4 relative">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-medium">
                  {user?.name?.substring(0, 2).toUpperCase()}
                </div>
                <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card ${
                  advisorStatus === "available"
                    ? "bg-green-500"
                    : advisorStatus === "serving"
                    ? "bg-blue-500"
                    : "bg-amber-500"
                }`}></span>
              </div>

              {user != null && (
                <div className="flex flex-col">
                  <h2 className="text-xl font-display font-medium">{user.name}</h2>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <UserCheck className="h-4 w-4 mr-1" />
                    Mesa {user.counter || 'N/A'} {/* Handle possible missing counter */}
                  </div>
                </div>
              )}

            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Badge variant={advisorStatus === "available" ? "default" : advisorStatus === "serving" ? "outline" : "secondary"} className="py-1.5">
                {advisorStatus === "available"
                  ? "Disponible"
                  : advisorStatus === "serving"
                  ? "En Atención"
                  : "En Pausa"}
              </Badge>

              <Button
                variant={advisorStatus === "paused" ? "default" : "outline"}
                size="sm"
                onClick={togglePause}
                disabled={advisorStatus !== "paused" && !!currentClient} // Disable pause if serving client
                title={advisorStatus !== "paused" && !!currentClient ? "Termina la atención actual para pausar" : ""}
                className="h-9"
              >
                {advisorStatus === "paused" ? (
                  <>
                    <Play size={16} className="mr-2" />
                    Reanudar
                  </>
                ) : (
                  <>
                    <Pause size={16} className="mr-2" />
                    Pausar
                  </>
                )}
              </Button>

              {/* Hiding status selector as it's controlled by buttons now
              <Select value={advisorStatus} onValueChange={setAdvisorStatus}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Cambiar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="serving">En Atención</SelectItem>
                  <SelectItem value="paused">En Pausa</SelectItem>
                </SelectContent>
              </Select>
              */}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {/* Current Client */}
        <Card className="glassmorphism animate-slide-up min-h-[250px] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-display">Cliente Actual</CardTitle>
          </CardHeader>

          <CardContent className="flex-grow flex items-center justify-center p-6"> {/* Added p-6 */}
            {currentClient ? (
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6 w-full">
                <div className="w-full sm:w-auto">
                  <div className="text-sm text-muted-foreground mb-1">Turno</div>
                  <div className="flex items-center gap-3">
                    <div className="text-4xl font-display font-medium text-primary">
                      {currentClient.code}
                    </div>
                    <Badge
                      className={`${
                        currentClient.type === "Alta"
                          ? "bg-red-100 hover:bg-red-100 text-red-800 border-red-200"
                          : currentClient.type === "Media"
                          ? "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-200"
                      }`}
                    >
                      {currentClient.type || 'Normal'} {/* Display priority type */}
                    </Badge>
                  </div>
                  <div className="text-xl font-medium mt-2">
                    {currentClient.customer}
                  </div>
                </div>

                <div className="w-full sm:w-auto space-y-4">
                  {/* Active Time - Kept commented as per previous version
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Tiempo de Atención</div>
                    <div className="text-2xl font-medium">
                      {formatActiveTime(activeTime)}
                    </div>
                  </div>
                  <Progress value={Math.min((activeTime / 600) * 100, 100)} className="h-2" />
                  */}

                  <div className="flex gap-2 flex-col sm:flex-row"> {/* Stack buttons vertically on small screens */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelClient}
                      className="w-full sm:w-auto"
                    >
                      <XCircle size={16} className="mr-2 text-red-500" />
                      Cancelar
                    </Button>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={completeClient}
                      className="w-full sm:w-auto"
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Completar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground"> {/* Simplified empty state */}
                  {advisorStatus === "paused"
                    ? "Estás en pausa. Reanuda para atender clientes."
                    : "No hay clientes en atención actualmente."}

                {advisorStatus !== "paused" && (
                  <Button onClick={callNextClient} disabled={waitingQueue.length === 0} className="mt-4">
                    <BellRing size={16} className="mr-2" />
                    Llamar Siguiente Cliente
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>


      </div>

      {/* Clients Tabs */}
      <Card className="glassmorphism overflow-hidden animate-slide-up" style={{ animationDelay: "150ms" }}>
        <Tabs defaultValue="waiting" className="w-full">
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4 sm:gap-0"> {/* Added gap for spacing */}
              <CardTitle className="text-xl font-display">Clientes</CardTitle>
              <TabsList>
                <TabsTrigger value="waiting">En Espera ({waitingQueue.length})</TabsTrigger>
                <TabsTrigger value="served">Atendidos ({servedClients.length})</TabsTrigger>
              </TabsList>
            </div>
            {/* Removed Separator */}
          </CardHeader>

          <TabsContent value="waiting" className="m-0">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">Cargando cola...</div>
              ) : isError ? (
                 <div className="py-12 text-center text-destructive">Error al cargar la cola.</div>
              ) : waitingQueue.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-y border-border text-sm text-muted-foreground">
                        <th className="py-3 px-4 text-left font-medium">Turno</th>
                        <th className="py-3 px-4 text-left font-medium">Cliente</th>
                        <th className="py-3 px-4 text-left font-medium">Prioridad</th>
                        <th className="py-3 px-4 text-left font-medium">Agendado</th>
                        <th className="py-3 px-4 text-left font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {waitingQueue.map((client, index) => (
                        <tr
                          key={client.queueId} // Use client.id as key
                          className={`text-sm hover:bg-muted/50 transition-colors ${
                            index !== waitingQueue.length - 1 ? "border-b border-border" : ""
                          }`}
                        >
                          <td className="py-3 px-4">{client.code}</td>
                          <td className="py-3 px-4 font-medium">{client.customer}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              client.type === "Alta"
                                ? "bg-red-100 text-red-800"
                                : client.type === "Media"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {client.type || 'Normal'} {/* Display priority type */}
                            </span>
                          </td>
                          <td className="py-3 px-4">{client.scheduled || 'N/A'}</td> {/* Display scheduled time */}
                          <td className="py-3 px-4">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={currentClient !== null || advisorStatus === "paused"}
                              onClick={() => { callClientTurn(client) }}
                            >
                              <BellRing size={16} className="mr-2" />
                              Llamar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  No hay clientes en espera
                </div>
              )}
            </CardContent>
          </TabsContent>

          <TabsContent value="served" className="m-0">
            <CardContent className="p-0">
              {servedClients.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-y border-border text-sm text-muted-foreground">
                        <th className="py-3 px-4 text-left font-medium">Turno</th>
                        <th className="py-3 px-4 text-left font-medium">Cliente</th>
                        <th className="py-3 px-4 text-left font-medium">Prioridad</th>
                        <th className="py-3 px-4 text-left font-medium">Hora</th>
                        <th className="py-3 px-4 text-left font-medium">Duración</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servedClients.map((client, index) => (
                        <tr
                          key={client.id}
                          className={`text-sm hover:bg-muted/50 transition-colors ${
                            index !== servedClients.length - 1 ? "border-b border-border" : ""
                          }`}
                        >
                          <td className="py-3 px-4">{client.code}</td> {/* Use code from served data */}
                          <td className="py-3 px-4 font-medium">{client.customer}</td> {/* Use customer from served data */}
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              client.type === "Alta" // Use type from served data
                                ? "bg-red-100 text-red-800"
                                : client.type === "Media"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {client.type || 'Normal'} {/* Display priority type */}
                            </span>
                          </td>
                          <td className="py-3 px-4">{client.serveTime}</td>
                          <td className="py-3 px-4">{client.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  No has atendido clientes en esta sesión
                </div>
              )}
            </CardContent>
          </TabsContent>

          {/*
          <CardFooter className="flex justify-between p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Mostrando datos de la sesión actual
            </div>
             <Button variant="outline" size="sm">
              <History size={16} className="mr-2" />
              Ver Historial Completo
            </Button>
          </CardFooter>
          */}
        </Tabs>
      </Card>
    </div>
  );
};

export default AdvisorConsole;
