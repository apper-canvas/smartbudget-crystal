import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Sidebar from "@/components/organisms/Sidebar";
import Dashboard from "@/components/pages/Dashboard";
import Transactions from "@/components/pages/Transactions";
import Budgets from "@/components/pages/Budgets";
import Goals from "@/components/pages/Goals";
import Notifications from "@/components/pages/Notifications";
import Reports from "@/components/pages/Reports";
import NotificationBar from "@/components/molecules/NotificationBar";
const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 lg:ml-0 overflow-auto">
            <div className="p-6">
<Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </div>
          </main>
        </div>
<NotificationBar />
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;