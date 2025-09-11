import { useState, useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { AuthContext } from "../../App";

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { logout } = useContext(AuthContext);
const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Transactions", href: "/transactions", icon: "Receipt" },
    { name: "Budgets", href: "/budgets", icon: "Target" },
    { name: "Category Settings", href: "/budgets/categories", icon: "Settings" },
    { name: "Goals", href: "/goals", icon: "Trophy" },
    { name: "Notifications", href: "/notifications", icon: "Bell" },
    { name: "Reports", href: "/reports", icon: "BarChart3" },
  ];

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <ApperIcon name="DollarSign" size={20} className="text-white" />
              </div>
              <span className="ml-3 text-xl font-bold gradient-text">SmartBudget</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-r-2 border-primary"
                      : "text-gray-600 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <ApperIcon
                    name={item.icon}
                    size={20}
                    className={`mr-3 ${
                      isActive ? "text-primary" : "text-gray-400 group-hover:text-primary"
                    }`}
                  />
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-primary rounded-full"
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
<div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                  <ApperIcon name="User" size={16} className="text-gray-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Personal Account</p>
                  <p className="text-xs text-gray-500">Free Plan</p>
                </div>
              </div>
<button
                onClick={logout}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="Logout"
              >
                <ApperIcon name="LogOut" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <ApperIcon name="DollarSign" size={20} className="text-white" />
            </div>
            <span className="ml-3 text-xl font-bold gradient-text">SmartBudget</span>
          </div>
          <button
            onClick={toggleMobile}
            className="p-2 rounded-md text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <ApperIcon name={isMobileOpen ? "X" : "Menu"} size={24} />
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
              className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl"
            >
              <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                      <ApperIcon name="DollarSign" size={20} className="text-white" />
                    </div>
                    <span className="ml-3 text-xl font-bold gradient-text">SmartBudget</span>
                  </div>
                  <button
                    onClick={closeMobile}
                    className="p-2 rounded-md text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors"
                  >
                    <ApperIcon name="X" size={20} />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={closeMobile}
                        className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-r-2 border-primary"
                            : "text-gray-600 hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        <ApperIcon
                          name={item.icon}
                          size={20}
                          className={`mr-3 ${
                            isActive ? "text-primary" : "text-gray-400 group-hover:text-primary"
                          }`}
                        />
                        {item.name}
                        {isActive && (
                          <motion.div
                            layoutId="mobileActiveIndicator"
                            className="ml-auto w-2 h-2 bg-primary rounded-full"
                          />
                        )}
                      </NavLink>
                    );
                  })}
                </nav>

                {/* Footer */}
<div className="p-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                        <ApperIcon name="User" size={16} className="text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">Personal Account</p>
                        <p className="text-xs text-gray-500">Free Plan</p>
                      </div>
                    </div>
<button
                      onClick={logout}
                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Logout"
                    >
                      <ApperIcon name="LogOut" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;