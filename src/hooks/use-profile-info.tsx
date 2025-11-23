 
import { useState, useEffect } from "react";

export interface ProfileInfo {
  fullName: string;
  email: string;
  company: string;
  phone: string;
}

const defaultProfileInfo: ProfileInfo = {
  fullName: "John Doe",
  email: "john@example.com",
  company: "Acme Demolition Co.",
  phone: "(123) 456-7890"
};

export function useProfileInfo() {
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>(defaultProfileInfo);

  // Load profile info from localStorage on component mount
  useEffect(() => {
    const storedInfo = localStorage.getItem('profileInfo');
    
    if (storedInfo) {
      try {
        const parsedInfo = JSON.parse(storedInfo);
        setProfileInfo(parsedInfo);
      } catch (err) {
        console.error("Error parsing stored profile info:", err);
      }
    }
  }, []);

  // Save profile info to localStorage
  const updateProfileInfo = (newInfo: ProfileInfo) => {
    localStorage.setItem('profileInfo', JSON.stringify(newInfo));
    setProfileInfo(newInfo);
  };

  return { profileInfo, updateProfileInfo };
}
