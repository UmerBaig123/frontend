 
import React from "react";
import Navbar from "./Navbar";

interface PageContainerProps {
  children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="bidgenius-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PageContainer;
