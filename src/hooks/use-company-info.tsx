 
import { useState, useEffect } from "react";

interface CompanyInfo {
  companyName: string;
  slogan: string;
  businessDescription: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
}

const defaultCompanyInfo: CompanyInfo = {
  companyName: "Your Company",
  slogan: "Smarter Demolition Bids Powered by AI",
  businessDescription: "Upload historical data, scan floor plans, and generate accurate demolition bids with the power of artificial intelligence.",
  address: "123 Main St, City, State 12345",
  phone: "(123) 456-7890",
  email: "info@yourcompany.com",
  website: "https://yourcompany.com",
};

export function useCompanyInfo() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo);

  useEffect(() => {
    const storedInfo = localStorage.getItem('companyInfo');
    
    if (storedInfo) {
      try {
        const parsedInfo = JSON.parse(storedInfo);
        setCompanyInfo(parsedInfo);
      } catch (err) {
        console.error("Error parsing stored company info:", err);
      }
    }
  }, []);

  const updateCompanyInfo = (newInfo: Partial<CompanyInfo>) => {
    const updatedInfo = { ...companyInfo, ...newInfo };
    setCompanyInfo(updatedInfo);
    localStorage.setItem('companyInfo', JSON.stringify(updatedInfo));
  };

  return { companyInfo, updateCompanyInfo };
}
