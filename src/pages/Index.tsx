
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Clock, CalendarCheck } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const Index = () => {
  const { theme } = useTheme();
  
  // Sample statistics data
  const stats = [
    {
      title: "Turnos Totales",
      value: "124",
      icon: Activity,
      change: "+12%",
      trend: "up",
    },
    {
      title: "Turnos en Espera",
      value: "32",
      icon: Clock,
      change: "+5%",
      trend: "up",
    },
    {
      title: "Asesores Activos",
      value: "8",
      icon: Users,
      change: "-1",
      trend: "down",
    },
    {
      title: "Citas Programadas",
      value: "42",
      icon: CalendarCheck,
      change: "+8",
      trend: "up",
    },
  ];

  // Sample queue data for today
  const queueData = [
    { id: "T-001", name: "Ana Martínez", priority: "Alta", status: "En atención", waitTime: "0:05" },
    { id: "T-002", name: "Juan Pérez", priority: "Alta", status: "En espera", waitTime: "0:12" },
    { id: "T-003", name: "Carla Ruiz", priority: "Media", status: "En espera", waitTime: "0:15" },
    { id: "T-004", name: "Roberto Santos", priority: "Baja", status: "En espera", waitTime: "0:20" },
    { id: "T-005", name: "María López", priority: "Baja", status: "En espera", waitTime: "0:25" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-medium tracking-tight animate-fade-in">
          Panel de Control
        </h1>
        <div className="flex items-center text-sm text-muted-foreground animate-fade-in">
          <Clock className="mr-2 h-4 w-4" />
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.title} className="overflow-hidden glassmorphism animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-primary-custom" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className={`text-xs ${
                  stat.trend === "up" ? "text-green-500" : "text-red-500"
                }`}>
                  {stat.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Queue */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 glassmorphism animate-slide-up">
          <CardHeader>
            <CardTitle className="text-xl font-display">Cola de Turnos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-sm text-muted-foreground">
                    <th className="py-3 px-4 text-left font-medium">ID</th>
                    <th className="py-3 px-4 text-left font-medium">Nombre</th>
                    <th className="py-3 px-4 text-left font-medium">Prioridad</th>
                    <th className="py-3 px-4 text-left font-medium">Estado</th>
                    <th className="py-3 px-4 text-left font-medium">Tiempo Espera</th>
                  </tr>
                </thead>
                <tbody>
                  {queueData.map((item, index) => (
                    <tr 
                      key={item.id} 
                      className={`text-sm hover:bg-muted/50 transition-colors ${
                        index !== queueData.length - 1 ? "border-b border-border" : ""
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-3 px-4 text-primary-custom font-medium">{item.id}</td>
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
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center ${
                          item.status === "En atención" 
                            ? "text-green-600" 
                            : "text-amber-600"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{item.waitTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism animate-slide-up" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="text-xl font-display">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: "10:32", text: "Carlos García atendió a Juan Pérez" },
                { time: "10:25", text: "Nuevo turno registrado: María López" },
                { time: "10:20", text: "Ana Martínez comenzó la atención" },
                { time: "10:15", text: "Roberto Santos escaneó QR de llegada" },
                { time: "10:05", text: "Carla Ruiz agenda cita para mañana" },
              ].map((activity, index) => (
                <div key={index} className="flex gap-3 text-sm border-b border-border last:border-0 pb-3 last:pb-0">
                  <div className="text-primary-custom">{activity.time}</div>
                  <div>{activity.text}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
