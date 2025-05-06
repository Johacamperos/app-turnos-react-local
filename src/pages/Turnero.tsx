import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TurnModal from "@/components/turn/TurnModal";
import { useTheme } from "@/contexts/ThemeContext";

type TurnData = {
  code: string;
  customer: string;
  status: string;
  advisor: string;
  counter: string;
  timestamp: string;
};

const Turnero = () => {
  const { theme } = useTheme();
  const logoUrl = theme.logoUrl;

  const [currentTurn, setCurrentTurn] = useState<TurnData | null>(null);
  const [lastCalls, setLastCalls] = useState<TurnData[]>([]);
  const [isNewCall, setIsNewCall] = useState(false);

  const clientsQueue = useRef<TurnData[]>([]);
  const deviceId = localStorage.getItem("device_id");

  useEffect(() => {
    if (!deviceId) return;

    const url = `https://app-turnos-realtime-api-develop.azurewebsites.net/v1.0/stream/${deviceId}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      if (event.data) {
        const data: TurnData = JSON.parse(event.data);
        clientsQueue.current.unshift(data); // Añade el nuevo turno al inicio
        if (clientsQueue.current.length > 5) clientsQueue.current.pop(); // Opcional: limita la cantidad

        setLastCalls([...clientsQueue.current]);
        setCurrentTurn(data);
        setIsNewCall(true);
        setTimeout(() => setIsNewCall(false), 4000);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [deviceId]);

  return (
    <main className="min-h-screen py-[84px] flex bg-[#FCFAF9]">
      <div className="max-w-7xl w-full mx-auto py-[59px] px-[74px] shadow-box-shadow rounded-[12px] relative bg-[#fff]">
        <div className="lg:col-span-12">
          <img
            src={logoUrl}
            className="absolute -top-10 w-[80px] md:w-[100px] lg:w-[136px]"
            alt="Logo"
          />
          <h1 className="text-[20px] md:text-[24px] lg:text-[36px] text-[#333E33] font-bold mb-[75px] md:ms-[120px] lg:ms-[190px]">
            Por favor, espera tu turno y acércate cuando seas llamado.
          </h1>
          <div className="bg-white rounded-xl overflow-hidden flex flex-col gap-[30px]">
            <div className="p-4 bg-gradient-to-bl from-[#F2EFED] via-[#FFF] to-[#E4DDD9] border border-[#EFECEC] rounded-[12px]">
              <div className="grid grid-cols-5 text-[18px] text-black font-normal leading-[21px] tracking-[-0.16px]">
                <div>Turno</div>
                <div>Cliente</div>
                <div>Estado</div>
                <div>Asesor</div>
                <div>Estación</div>
              </div>
            </div>
            {lastCalls.length > 0 && (
              <div className="flex flex-col gap-[16px] text-black">
                <AnimatePresence initial={false}>
                  {lastCalls.map((call) => (
                    <motion.div
                      key={`${call.code}-${call.timestamp}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`p-4 grid grid-cols-5 items-center bg-[#FBFEFF] turn border rounded-[12px] text-[24px]
                        ${call.status === "Llamado" ? "turn__waiting" : ""}`}
                    >
                      <div>{call.code}</div>
                      <div>{call.customer}</div>
                      <div>{call.status}</div>
                      <div>{call.advisor}</div>
                      <div>{call.counter}</div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
      {lastCalls.length > 0 && currentTurn && (
        <TurnModal
          isOpen={isNewCall}
          onClose={() => setIsNewCall(false)}
          turn={currentTurn}
        />
      )}
    </main>
  );
};

export default Turnero;
