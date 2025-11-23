import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  BarChart2, 
  FileText, 
  PlusCircle, 
  Settings, 
  LogOut,
  Building2,
  Brain,
  Bot
} from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useProfileInfo } from "@/hooks/use-profile-info";
import { useAuth } from "@/hooks/use-auth";

const Navbar = () => {
  const location = useLocation();
  const { profileInfo } = useProfileInfo();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="h-screen w-64 bg-gradient-to-b from-background to-gray-200 dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-xl">
      <div className="p-8 pb-4 flex flex-col items-center">
        <div className="w-16 h-16 rounded-xl shadow-lg bg-primary flex items-center justify-center mb-2">
          <span className="text-white font-bold text-2xl">BP</span>
        </div>
        <span className="text-2xl font-bold text-primary mb-2">BidPro</span>
        <div className="w-full border-b border-gray-300 dark:border-gray-700 my-2"></div>
      </div>
      
      <div className="flex-1 px-4 space-y-2 py-4">
        <Link to="/dashboard">
          <Button 
            variant={location.pathname === "/dashboard" ? "default" : "ghost"} 
            className={`w-full justify-start ${location.pathname === "/dashboard" ? "bg-primary text-white hover:bg-accent rounded-lg" : ""}`}
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        
        <Link to="/projects">
          <Button 
            variant={location.pathname === "/projects" ? "default" : "ghost"}
            className={`w-full justify-start ${location.pathname === "/projects" ? "bg-primary text-white hover:bg-accent rounded-lg" : ""}`}
          >
            <Building2 className="mr-2 h-4 w-4" />
            Projects
          </Button>
        </Link>
        
        <Link to="/new-project">
          <Button 
            variant={location.pathname === "/new-project" ? "default" : "ghost"}
            className={`w-full justify-start ${location.pathname === "/new-project" ? "bg-primary text-white hover:bg-accent rounded-lg" : ""}`}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
        
        <Link to="/bids">
          <Button 
            variant={location.pathname === "/bids" ? "default" : "ghost"}
            className={`w-full justify-start ${location.pathname === "/bids" ? "bg-primary text-white hover:bg-accent rounded-lg" : ""}`}
          >
            <FileText className="mr-2 h-4 w-4" />
            Bids
          </Button>
        </Link>
        
        <Link to="/generate-bid">
          <Button 
            variant={location.pathname === "/generate-bid" ? "default" : "ghost"}
            className={`w-full justify-start ${location.pathname === "/generate-bid" ? "bg-primary text-white hover:bg-accent rounded-lg" : ""}`}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Generate Bid
          </Button>
        </Link>
        
        <Link to="/ai-analysis">
          <Button 
            variant={location.pathname === "/ai-analysis" ? "default" : "ghost"}
            className={`w-full justify-start ${location.pathname === "/ai-analysis" ? "bg-primary text-white hover:bg-accent rounded-lg" : ""}`}
          >
            <Brain className="mr-2 h-4 w-4" />
            Documents
          </Button>
        </Link>
        
        <Link to="/settings">
          <Button 
            variant={location.pathname === "/settings" ? "default" : "ghost"}
            className={`w-full justify-start ${location.pathname === "/settings" ? "bg-primary text-white hover:bg-accent rounded-lg" : ""}`}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2">
              <span className="font-medium text-sm">{user?.fullName?.split(' ').map(n => n[0]).join('') || profileInfo.fullName.split(' ').map(n => n[0]).join('')}</span>
            </div>
            <div className="text-sm">
              <p className="font-medium">{user?.email || profileInfo.email}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Project Manager</p>
            </div>
          </div>
          <NotificationBell />
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-500"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 text-center">
        © {new Date().getFullYear()} BidPro. All rights reserved.
      </div>
    </div>
  );
};

export default Navbar;
