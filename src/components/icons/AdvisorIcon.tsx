// components/icons/AdvisorIcon.tsx
import React from 'react';

interface AdvisorIconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const AdvisorIcon: React.FC<AdvisorIconProps> = ({ 
  color = 'currentColor', 
  size = 24, 
  strokeWidth = 1,
  className = '',
  ...props 
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size * 1.3} // Mantener proporción original (20x26)
      viewBox="0 0 20 26"
      fill="none"
      className={`lucide ${className}`}
      {...props}
    >
      <path d="M14.5019 8.34891C13.0432 7.49427 12.324 6.72561 10.9081 7.13061C8.66947 7.97134 7.74312 8.47183 5.578 8.31964V7.465C5.578 5.01049 7.58581 3.00305 10.04 3.00305C12.4941 3.00305 14.5019 5.01086 14.5019 7.465V8.34854V8.34891Z" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}/>
      <path d="M3.65613 8.2161V7.38524C3.65613 3.86902 6.52515 1 10.0399 1C13.5547 1 16.4252 3.86902 16.4252 7.38524V8.2439" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}/>
      <path d="M5.57825 8.31999V10.2074C5.57825 12.6619 7.58605 14.6694 10.0402 14.6694C12.4943 14.6694 14.5021 12.6616 14.5021 10.2074V8.31999" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}/>
      <path d="M2.44622 24.9996H1V21.1915C1.05817 17.6379 5.39976 16.9893 7.90659 16.161V14.1213M12.1735 14.1217V16.1613C14.6804 16.9896 19.022 17.6379 19.0801 21.1918V25H6.82659" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}/>
      <path d="M12.1735 16.1613L7.40748 19.3761L6.04285 16.7171" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}/>
      <path d="M5.5783 7.65598H4.79135C4.08745 7.65598 3.51233 8.2311 3.51233 8.935V9.45085C3.51233 10.1548 4.08745 10.7313 4.79135 10.7313H5.60977" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}/>
      <path d="M14.5019 7.65598H15.2889C15.9928 7.65598 16.5679 8.2311 16.5679 8.935V9.45085C16.5679 10.1548 15.9928 10.7313 15.2889 10.7313H14.4716" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}/>
      <path d="M10.0402 12.6865H15.5433C16.0288 12.6865 16.4254 12.2895 16.4254 11.8044V10.0373" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}/>
      <path d="M10.9209 21.1128L11.579 18.6393M8.5011 18.6393L9.15927 21.1128" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}/>
      <path d="M8.27283 24.9996L9.15929 21.1128H10.9209L11.8084 24.9996" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}/>
      <path d="M7.90662 16.1613L12.6741 19.3761L14.0376 16.7171" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}/>
      <path d="M14.2076 22.5605H16.6662" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}/>
      <path d="M4.63879 24.9996H4.6366" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}/>
    </svg>
  );
};

export default AdvisorIcon;