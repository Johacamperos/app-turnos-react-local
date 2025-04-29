
import React from "react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import QueueTable from "./QueueTable";

interface QueueItem {
  id: string;
  name: string;
  priority: string;
  time: string;
  status: string;
  advisor: string;
  waitTime: string;
}

interface QueueTabsProps {
  filteredQueue: QueueItem[];
  queueData: QueueItem[];
  selectedTab: string;
  setSelectedTab: (value: string) => void;
}

const QueueTabs: React.FC<QueueTabsProps> = ({ 
  filteredQueue, 
  queueData, 
  selectedTab, 
  setSelectedTab 
}) => {
  return (
    <Card className="glassmorphism overflow-hidden animate-slide-up">
      <CardHeader className="px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-display">Cola de Turnos</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            Actualizado: 11:05 AM
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTab}>
        <div className="px-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              Todos
            </TabsTrigger>
            <TabsTrigger value="priority" className="text-xs sm:text-sm">
              Prioritarios
            </TabsTrigger>
            <TabsTrigger value="waiting" className="text-xs sm:text-sm">
              En Espera
            </TabsTrigger>
            <TabsTrigger value="attention" className="text-xs sm:text-sm">
              En Atención
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="m-0">
          <CardContent className="p-0">
            <QueueTable filteredQueue={filteredQueue} />
          </CardContent>
        </TabsContent>
        
        <TabsContent value="priority" className="m-0">
          <CardContent>
            <div className="py-8 text-center text-muted-foreground">
              Mostrando turnos prioritarios
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="waiting" className="m-0">
          <CardContent>
            <div className="py-8 text-center text-muted-foreground">
              Mostrando turnos en espera
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="attention" className="m-0">
          <CardContent>
            <div className="py-8 text-center text-muted-foreground">
              Mostrando turnos en atención
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-between p-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredQueue.length} de {queueData.length} turnos
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm">
            Siguiente
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default QueueTabs;
