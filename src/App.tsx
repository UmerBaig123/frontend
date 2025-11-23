 
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import BidDetail from "./pages/BidDetail";
import EditProject from "./pages/EditProject";
import NewProject from "./pages/NewProject";
import GenerateBid from "./pages/GenerateBid";
import AiAnalysis from "./pages/AiAnalysis";
import AnalysisHistory from "./pages/AnalysisHistory";
import Bids from "./pages/Bids";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Customize from "./pages/Customize";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { Toaster } from "./components/ui/toaster";
import { NotificationsProvider } from "./hooks/use-notifications";
import { AuthProvider, RequireAuth } from "./hooks/use-auth";

function App() {
  return (
    <NotificationsProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            } />
            <Route path="/projects" element={
              <RequireAuth>
                <Projects />
              </RequireAuth>
            } />
            <Route path="/projects/:id" element={
              <RequireAuth>
                <ProjectDetail />
              </RequireAuth>
            } />
            <Route path="/projects/:projectId/bids/:bidId" element={
              <RequireAuth>
                <BidDetail />
              </RequireAuth>
            } />
            <Route path="/projects/:id/edit" element={
              <RequireAuth>
                <EditProject />
              </RequireAuth>
            } />
            <Route path="/new-project" element={
              <RequireAuth>
                <NewProject />
              </RequireAuth>
            } />
            <Route path="/bids" element={
              <RequireAuth>
                <Bids />
              </RequireAuth>
            } />
            <Route path="/bids/:id" element={
              <RequireAuth>
                <BidDetail />
              </RequireAuth>
            } />
            <Route path="/ai-analysis" element={
              <RequireAuth>
                <AiAnalysis />
              </RequireAuth>
            } />
            <Route path="/generate-bid" element={
              <RequireAuth>
                <GenerateBid />
              </RequireAuth>
            } />
            <Route path="/analysis-history" element={
              <RequireAuth>
                <AnalysisHistory />
              </RequireAuth>
            } />
            <Route path="/notifications" element={
              <RequireAuth>
                <Notifications />
              </RequireAuth>
            } />
            <Route path="/settings" element={
              <RequireAuth>
                <Settings />
              </RequireAuth>
            } />
            <Route path="/customize" element={
              <RequireAuth>
                <Customize />
              </RequireAuth>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </NotificationsProvider>
  );
}

export default App;
