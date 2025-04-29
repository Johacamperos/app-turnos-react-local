
import React from "react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface Advisor {
  id: number;
  name: string;
  status: string;
  queue: string;
}

interface AdvisorListProps {
  advisorData: Advisor[];
}

const AdvisorList: React.FC<AdvisorListProps> = ({ advisorData }) => {
  return (
    <Card className="glassmorphism animate-slide-up" style={{ animationDelay: "100ms" }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-display">Asesores Activos</CardTitle>
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {advisorData.map((advisor) => (
            <div 
              key={advisor.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {advisor.name.charAt(0)}
                  </div>
                  <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card ${
                    advisor.status === "Disponible" 
                      ? "bg-green-500" 
                      : advisor.status === "Ocupado"
                      ? "bg-red-500"
                      : "bg-amber-500"
                  }`}></span>
                </div>
                <div>
                  <p className="font-medium text-sm">{advisor.name}</p>
                  <p className="text-xs text-muted-foreground">{advisor.queue}</p>
                </div>
              </div>
              <div className="text-xs">
                <span className={`px-2 py-1 rounded-full ${
                  advisor.status === "Disponible" 
                    ? "bg-green-100 text-green-800" 
                    : advisor.status === "Ocupado"
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {advisor.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" className="w-full">
          <Users className="mr-2 h-4 w-4" />
          Ver todos los asesores
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdvisorList;
