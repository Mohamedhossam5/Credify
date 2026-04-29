import React from 'react';

interface DashboardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const DashboardButton: React.FC<DashboardButtonProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <button 
      className={`btn-primary ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default DashboardButton;
