import React from "react";
import { Shield } from "lucide-react";

const SimpleNavbar = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 shadow-lg">
      <div className="flex items-center justify-center space-x-3">
        <Shield className="h-8 w-8 text-white transition-transform duration-300 hover:scale-110" />
        <span className="text-2xl font-semibold text-white tracking-wide">
          Decentralized ID
        </span>
      </div>
    </header>
  );
};

export default SimpleNavbar;
