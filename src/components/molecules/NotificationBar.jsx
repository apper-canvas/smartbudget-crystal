import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import { notificationService } from '@/services/api/notificationService';
import { formatCurrency } from '@/utils/formatters';

const NotificationBar = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Check for new notifications periodically
    const interval = setInterval(checkForNewNotifications, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const active = await notificationService.getActiveNotifications();
      setNotifications(active);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewNotifications = async () => {
    try {
      const newAlerts = await notificationService.checkBudgetAlerts();
      if (newAlerts.length > 0) {
        // Show toast for new alerts
        newAlerts.forEach(alert => {
          toast.warning(`Budget Alert: ${alert.message}`, {
            position: "top-right",
            autoClose: 5000,
          });
        });
        fetchNotifications(); // Refresh the notification bar
      }
    } catch (error) {
      console.error('Error checking for new notifications:', error);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await notificationService.dismissNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error': return 'AlertTriangle';
      case 'warning': return 'AlertCircle';
      case 'info': return 'Info';
      default: return 'Bell';
    }
  };

  if (loading || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className={`p-4 rounded-lg border-l-4 shadow-lg ${getSeverityColor(notification.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <ApperIcon 
                  name={getSeverityIcon(notification.severity)} 
                  size={20} 
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">
                    {notification.message}
                  </h4>
                  <p className="text-xs opacity-90 mb-2">
                    {notification.description}
                  </p>
                  {notification.data && (
                    <div className="text-xs opacity-75">
                      Remaining: {formatCurrency(notification.data.remaining)}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDismiss(notification.id)}
                className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <ApperIcon name="X" size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBar;