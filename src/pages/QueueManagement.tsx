
import React, { useState } from "react";
import QueuePageHeader from "@/components/queue/QueuePageHeader";
import QueueFilters from "@/components/queue/QueueFilters";
import QueueTabs from "@/components/queue/QueueTabs";
import AdvisorList from "@/components/queue/AdvisorList";
import CallQueue from "@/components/queue/CallQueue";

const QueueManagement = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  
  // Sample queue data
  const queueData = [
    { id: "T-001", name: "Ana Martínez", priority: "Alta", time: "10:30", status: "En atención", advisor: "Carlos García", waitTime: "0:05" },
    { id: "T-002", name: "Juan Pérez", priority: "Alta", time: "10:40", status: "En espera", advisor: "Pendiente", waitTime: "0:12" },
    { id: "T-003", name: "Carla Ruiz", priority: "Media", time: "10:45", status: "En espera", advisor: "Pendiente", waitTime: "0:15" },
    { id: "T-004", name: "Roberto Santos", priority: "Baja", time: "10:50", status: "En espera", advisor: "Pendiente", waitTime: "0:20" },
    { id: "T-005", name: "María López", priority: "Baja", time: "10:55", status: "En espera", advisor: "Pendiente", waitTime: "0:25" },
    { id: "T-006", name: "Luis Ramírez", priority: "Media", time: "11:00", status: "En espera", advisor: "Pendiente", waitTime: "0:10" },
    { id: "T-007", name: "Pedro Gómez", priority: "Baja", time: "11:05", status: "En espera", advisor: "Pendiente", waitTime: "0:08" },
  ];
  
  // Sample advisor data
  const advisorData = [
    { id: 1, name: "Carlos García", status: "Ocupado", queue: "General" },
    { id: 2, name: "Laura Rodríguez", status: "Disponible", queue: "General" },
    { id: 3, name: "Miguel Álvarez", status: "Disponible", queue: "Preferencial" },
    { id: 4, name: "Diana Torres", status: "En pausa", queue: "General" },
  ];
  
  // Filter queue data based on the selected tab
  const filteredQueue = selectedTab === "all" 
    ? queueData 
    : queueData.filter(item => {
        if (selectedTab === "priority") return item.priority === "Alta";
        if (selectedTab === "waiting") return item.status === "En espera";
        if (selectedTab === "attention") return item.status === "En atención";
        return true;
      });
  
  return (
    <div className="space-y-8">
      <QueuePageHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue Management */}
        <div className="lg:col-span-2 space-y-6">
          <QueueFilters />
          <QueueTabs 
            filteredQueue={filteredQueue} 
            queueData={queueData} 
            selectedTab={selectedTab} 
            setSelectedTab={setSelectedTab} 
          />
        </div>
        
        {/* Advisor Status */}
        <div className="space-y-6">
          <AdvisorList advisorData={advisorData} />
          <CallQueue advisorData={advisorData} queueData={queueData} />
        </div>
      </div>
    </div>
  );
};

export default QueueManagement;
