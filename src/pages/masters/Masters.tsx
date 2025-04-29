
import React from "react";
import { 
  Building2, Users, Map, Flag, 
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Masters = () => {
  const modules = [
    {
      title: "Gestión de Clientes",
      description: "Administre información de los clientes, documentos y estados",
      icon: Users,
      path: "/masters/customers",
      color: "bg-blue-500",
    },
    {
      title: "Gestión de Oficinas",
      description: "Configure oficinas y sus códigos de dispositivos",
      icon: Building2,
      path: "/masters/offices",
      color: "bg-green-500",
    },
    {
      title: "Gestión de Zonas",
      description: "Administre zonas y sus relaciones con oficinas",
      icon: Map,
      path: "/masters/zones",
      color: "bg-amber-500",
    },
    {
      title: "Gestión de Prioridades",
      description: "Configure prioridades y asignación de asesores",
      icon: Flag,
      path: "/masters/priorities",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-medium tracking-tight">
          Maestros
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module, index) => (
          <Card 
            key={module.title} 
            className="overflow-hidden transition-all duration-200 hover:shadow-md animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div 
                  className={`${module.color} rounded-lg p-3 text-white`}
                >
                  <module.icon className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-xl mt-4">{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-2">
              <Button asChild variant="outline" className="w-full justify-between">
                <Link to={module.path}>
                  Acceder
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Masters;
