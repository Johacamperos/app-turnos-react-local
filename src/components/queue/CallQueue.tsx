
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BellRing, Volume2 } from "lucide-react";

interface Advisor {
  id: number;
  name: string;
  status: string;
  queue: string;
}

interface QueueItem {
  id: string;
  name: string;
  priority: string;
  time: string;
  status: string;
  advisor: string;
  waitTime: string;
}

interface CallQueueProps {
  advisorData: Advisor[];
  queueData: QueueItem[];
}

const CallQueue: React.FC<CallQueueProps> = ({ advisorData, queueData }) => {
  return (
    <Card className="glassmorphism animate-slide-up" style={{ animationDelay: "150ms" }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-display">Llamar Turno</CardTitle>
          <Volume2 className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar asesor" />
          </SelectTrigger>
          <SelectContent>
            {advisorData.map((advisor) => (
              <SelectItem key={advisor.id} value={advisor.id.toString()}>
                {advisor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar turno" />
          </SelectTrigger>
          <SelectContent>
            {queueData.filter(q => q.status === "En espera").map((queue) => (
              <SelectItem key={queue.id} value={queue.id}>
                {queue.id} - {queue.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button className="w-full">
          <BellRing className="mr-2 h-4 w-4" />
          Llamar Turno
        </Button>
      </CardContent>
    </Card>
  );
};

export default CallQueue;
