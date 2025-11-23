 
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, Trash2, Bell, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useNotifications, NotificationType } from '@/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface NotificationsListProps {
  onNotificationClick?: () => void;
}

const NotificationsList = ({ onNotificationClick }: NotificationsListProps) => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all');

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    
    if (onNotificationClick) {
      onNotificationClick();
    }
    
    toast({
      title: "Notification marked as read",
      duration: 2000,
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast({
      title: "All notifications marked as read",
      duration: 2000,
    });
  };

  const handleClearNotifications = () => {
    clearNotifications();
    toast({
      title: "All notifications cleared",
      duration: 2000,
    });
  };
  
  const filteredNotifications = activeFilter === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.type === activeFilter);

  // Count notifications by type
  const notificationCounts = {
    all: notifications.length,
    info: notifications.filter(n => n.type === 'info').length,
    success: notifications.filter(n => n.type === 'success').length,
    warning: notifications.filter(n => n.type === 'warning').length,
    error: notifications.filter(n => n.type === 'error').length,
  };

  return (
    <div className="bg-popover rounded-md overflow-hidden">
      <div className="p-4 flex items-center justify-between bg-muted/50">
        <div className="flex items-center">
          <Bell className="h-4 w-4 mr-2" />
          <h4 className="font-medium">Notifications</h4>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMarkAllAsRead} 
            disabled={!notifications.some(n => !n.read)}
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Read all</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearNotifications}
            disabled={notifications.length === 0}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Clear</span>
          </Button>
        </div>
      </div>
      
      {/* Filter tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        <Button
          variant="ghost"
          size="sm"
          className={`rounded-none py-2 px-3 ${activeFilter === 'all' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All {notificationCounts.all > 0 && <span className="ml-1 text-xs bg-muted rounded-full px-1.5">{notificationCounts.all}</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`rounded-none py-2 px-3 ${activeFilter === 'info' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveFilter('info')}
          disabled={notificationCounts.info === 0}
        >
          <Info className="h-3.5 w-3.5 mr-1 text-blue-500" /> 
          Info {notificationCounts.info > 0 && <span className="ml-1 text-xs bg-muted rounded-full px-1.5">{notificationCounts.info}</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`rounded-none py-2 px-3 ${activeFilter === 'success' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveFilter('success')}
          disabled={notificationCounts.success === 0}
        >
          <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-500" /> 
          Success {notificationCounts.success > 0 && <span className="ml-1 text-xs bg-muted rounded-full px-1.5">{notificationCounts.success}</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`rounded-none py-2 px-3 ${activeFilter === 'warning' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveFilter('warning')}
          disabled={notificationCounts.warning === 0}
        >
          <AlertCircle className="h-3.5 w-3.5 mr-1 text-yellow-500" /> 
          Warnings {notificationCounts.warning > 0 && <span className="ml-1 text-xs bg-muted rounded-full px-1.5">{notificationCounts.warning}</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`rounded-none py-2 px-3 ${activeFilter === 'error' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveFilter('error')}
          disabled={notificationCounts.error === 0}
        >
          <AlertCircle className="h-3.5 w-3.5 mr-1 text-red-500" /> 
          Errors {notificationCounts.error > 0 && <span className="ml-1 text-xs bg-muted rounded-full px-1.5">{notificationCounts.error}</span>}
        </Button>
      </div>
      
      <ScrollArea className="h-[320px]">
        {filteredNotifications.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <p>No notifications {activeFilter !== 'all' ? `of type ${activeFilter}` : ''}</p>
          </div>
        ) : (
          <div>
            {filteredNotifications.map((notification) => (
              <div key={notification.id}>
                <div 
                  className={`
                    p-4 cursor-pointer hover:bg-muted/50 transition-colors
                    ${!notification.read ? 'bg-muted/20' : ''}
                  `} 
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h5 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h5>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(notification.date, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
                <Separator />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationsList;
