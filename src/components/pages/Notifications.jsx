import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import { notificationService } from '@/services/api/notificationService';
import { formatCurrency, formatDate } from '@/utils/formatters';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [allNotifications, currentSettings] = await Promise.all([
        notificationService.getAllNotifications(),
        notificationService.getSettings()
      ]);
      setNotifications(allNotifications);
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error fetching notification data:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await notificationService.dismissNotification(id);
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, dismissed: true } : n
      ));
      toast.success('Notification dismissed');
    } catch (error) {
      console.error('Error dismissing notification:', error);
      toast.error('Failed to dismiss notification');
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.clearAllNotifications();
      setNotifications(prev => prev.map(n => ({ ...n, dismissed: true })));
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const handleUpdateSettings = async (newSettings) => {
    try {
      const updated = await notificationService.updateSettings(newSettings);
      setSettings(updated);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
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

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'error': return 'bg-red-50';
      case 'warning': return 'bg-orange-50';
      case 'info': return 'bg-blue-50';
      default: return 'bg-gray-50';
    }
  };

  const activeNotifications = notifications.filter(n => !n.dismissed);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Notifications</h1>
          <p className="text-gray-600 mt-1">Manage your budget alerts and settings</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Notifications ({activeNotifications.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {activeNotifications.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={handleClearAll}
                variant="outline"
                size="sm"
              >
                <ApperIcon name="Trash2" size={16} className="mr-2" />
                Clear All
              </Button>
            </div>
          )}

          {activeNotifications.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ApperIcon name="Bell" size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active notifications</h3>
              <p className="text-gray-600">You're all caught up! New budget alerts will appear here.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className={`p-4 ${getSeverityBg(notification.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${getSeverityColor(notification.severity)}`}>
                          <ApperIcon 
                            name={getSeverityIcon(notification.severity)} 
                            size={20}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {notification.message}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.description}
                          </p>
                          {notification.data && (
                            <div className="text-sm text-gray-500 space-y-1">
                              <div>Spent: {formatCurrency(notification.data.currentSpent)}</div>
                              <div>Budget: {formatCurrency(notification.data.monthlyLimit)}</div>
                              <div>Remaining: {formatCurrency(notification.data.remaining)}</div>
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-2">
                            {formatDate(notification.timestamp)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDismiss(notification.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <ApperIcon name="X" size={18} />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Budget Alerts</label>
                  <p className="text-xs text-gray-500">Get notified when spending approaches limits</p>
                </div>
                <button
                  onClick={() => handleUpdateSettings({ budgetAlerts: !settings.budgetAlerts })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.budgetAlerts ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.budgetAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Threshold ({settings.threshold}%)
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={settings.threshold}
                  onChange={(e) => handleUpdateSettings({ threshold: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Notifications;