import { Outlet } from "react-router-dom";
import Sidebar from "../../components/seller/Sidebar";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
