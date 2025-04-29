import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

const Footer: React.FC = () => {
  const { theme } = useTheme();
  const companyName: string = theme.companyName;
  const year: number = new Date().getFullYear();

  return (
    <footer className="text-center text-sm pb-6 font-roboto">
      &copy; {year} {companyName}. Todos los derechos reservados
    </footer>
  );
};

export default Footer;