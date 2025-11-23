 
import { Button } from "@/components/ui/button";
import { PlusCircle, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const DashboardHeader = () => {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 className="page-heading mb-1">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Welcome back, {user?.fullName || "Guest"}
        </p>
      </div>
      <div className="mt-4 md:mt-0 flex gap-3">
        <Link to="/generate-bid">
          <Button className="bg-bidgenius-600 hover:bg-bidgenius-700 text-white">
            <Bot className="mr-2 h-4 w-4" />
            Generate Bid
          </Button>
        </Link>
        <Link to="/new-project">
          <Button className="bg-bidgenius-accent-500 hover:bg-bidgenius-accent-600 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHeader;
