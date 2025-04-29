import { useTheme } from "@/contexts/ThemeContext";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";


const Device = () => {
  const { theme } = useTheme();
  useEffect(() => {
   
  }, []);

  const getDeviceId = () => {
    let deviceId = localStorage.getItem("device_id");
    
    if (!deviceId) {
      //deviceId = uuidv4(); // Generate new UUID
      const uuid = uuidv4().replace(/\D/g, ""); // Remove non-numeric characters
      const numbers = uuid.substring(0, 12).match(/.{1,3}/g); // Take first 12 digits and split into groups of 3
      deviceId = numbers.join(" ");

      localStorage.setItem("device_id", deviceId);
    }
    
    return deviceId;
  };


  // Usage
const deviceId = getDeviceId();
console.log("Device ID:", deviceId);


  return (
    <div className="flex flex-col items-center text-center modal-turn__content"> 
    <div className=" w-full mb-[20px] relative px-[40px]">   
      <div className="modal-turn__content_client pt-[70px] pb-[20px]"> 
        <div className="text-black text-[48px] font-bold">Código de enlace</div>
      </div>
      <div className="absolute bg-white border-2 border-gray-300 rounded-full clip-half clip-half-circle-left"></div>
      <div className="absolute bg-white border-2 border-gray-300 rounded-full clip-half clip-half-circle-right"></div>
    </div>
    <div className="modal-turn__content_content flex flex-col gap-[6px] pb-[70px]"> 
      <div className="text-black text-[26px] font-normal uppercase tracking-[8px]"></div>
      <div className="font-bold text-[#00C65E] text-[180px] leading-[154px]">{deviceId}</div> 
     
    </div>
  </div>
  );
};

export default Device;