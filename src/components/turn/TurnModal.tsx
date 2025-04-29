import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion"; 

const TurnModal = ({ isOpen, onClose, turn }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-70 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] md:w-[70%] lg:w-[42%] -translate-x-1/2 -translate-y-1/2 bg-[#FCFFFD] border-[3px] border-modal rounded-xl shadow-modal focus:outline-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }} 
            transition={{ duration: 0.3 }}
            className="relative"
          > 
            <div className="flex flex-col items-center text-center modal-turn__content"> 
              <div className=" w-full mb-[20px] relative px-[40px]">   
                <div className="modal-turn__content_client pt-[70px] pb-[20px]"> 
                  <div className="text-black text-[48px] font-bold">{turn.customer}</div>
                </div>
                <div className="absolute bg-white border-2 border-gray-300 rounded-full clip-half clip-half-circle-left"></div>
                <div className="absolute bg-white border-2 border-gray-300 rounded-full clip-half clip-half-circle-right"></div>
              </div>
              <div className="modal-turn__content_content flex flex-col gap-[6px] pb-[70px]"> 
                <div className="text-black text-[26px] font-normal uppercase tracking-[8px]">Turno Asignado</div>
                <div className="font-bold text-[#00C65E] text-[180px] leading-[154px]">{turn.code}</div> 
                <div className="flex align-center justify-center gap-[10px] text-[27px] font-bold"> 
                  <span>Puesto: {turn.counter}</span>
                  <span>-</span>
                  <span>Asesor: {turn.advisor}</span> 
                </div>
              </div>
            </div>
            
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TurnModal;
