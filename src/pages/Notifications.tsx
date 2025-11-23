 
import React, { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { useNotifications } from "@/hooks/use-notifications";
import NotificationsList from "@/components/notifications/NotificationsList";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Notifications = () => {
  const { clearNotifications, markAllAsRead, notifications } = useNotifications();
  const { toast } = useToast();
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  const handleClearAll = () => {
    clearNotifications();
    toast({
      title: "All notifications cleared",
      duration: 2000,
    });
    setIsConfirmClearOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast({
      title: "All notifications marked as read",
      duration: 2000,
    });
  };

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="page-heading mb-1 flex items-center">
            <Bell className="mr-2 h-5 w-5" /> Notifications
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage all your notifications in one place
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={!notifications.some((n) => !n.read)}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => setIsConfirmClearOpen(true)}
            disabled={notifications.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      {isConfirmClearOpen && (
        <Card className="mb-6 border-destructive/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="font-medium">Are you sure you want to clear all notifications?</p>
              <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              <div className="flex justify-center gap-4 mt-4">
                <Button variant="outline" onClick={() => setIsConfirmClearOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleClearAll}>
                  Yes, Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <NotificationsList />
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default Notifications;
