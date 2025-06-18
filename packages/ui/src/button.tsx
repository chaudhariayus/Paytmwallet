"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  // className?: string;
  appName: string;
}

export const Button = ({ children/*, className*/, appName }: ButtonProps) => {
  return (
    <button
      // className={className}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      onClick={() => alert(`Hello from your ${appName} app!`)}
    >
      {children}
    </button>
  );
};
