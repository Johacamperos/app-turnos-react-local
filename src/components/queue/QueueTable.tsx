
import React from "react";
import { Button } from "@/components/ui/button";
import { BellRing, CheckCircle, XCircle } from "lucide-react";

interface QueueItem {
  id: string;
  name: string;
  priority: string;
  time: string;
  status: string;
  advisor: string;
  waitTime: string;
}

interface QueueTableProps {
  filteredQueue: QueueItem[];
}

const QueueTable: React.FC<QueueTableProps> = ({ filteredQueue }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-y border-border text-sm text-muted-foreground">
            <th className="py-3 px-4 text-left font-medium">ID</th>
            <th className="py-3 px-4 text-left font-medium">Cliente</th>
            <th className="py-3 px-4 text-left font-medium">Prioridad</th>
            <th className="py-3 px-4 text-left font-medium">Hora</th>
            <th className="py-3 px-4 text-left font-medium">Espera</th>
            <th className="py-3 px-4 text-left font-medium">Estado</th>
            <th className="py-3 px-4 text-left font-medium">Asesor</th>
            <th className="py-3 px-4 text-left font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredQueue.map((item, index) => (
            <tr 
              key={item.id} 
              className={`text-sm hover:bg-muted/50 transition-colors ${
                index !== filteredQueue.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <td className="py-3 px-4">{item.id}</td>
              <td className="py-3 px-4 font-medium">{item.name}</td>
              <td className="py-3 px-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  item.priority === "Alta" 
                    ? "bg-red-100 text-red-800" 
                    : item.priority === "Media"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {item.priority}
                </span>
              </td>
              <td className="py-3 px-4">{item.time}</td>
              <td className="py-3 px-4">{item.waitTime}</td>
              <td className="py-3 px-4">
                <span className={`inline-flex items-center ${
                  item.status === "En atención" 
                    ? "text-green-600" 
                    : "text-amber-600"
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="py-3 px-4">{item.advisor}</td>
              <td className="py-3 px-4">
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <BellRing size={16} className="text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <CheckCircle size={16} className="text-green-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <XCircle size={16} className="text-red-500" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QueueTable;
