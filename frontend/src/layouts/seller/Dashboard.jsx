import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../../components/seller/Sidebar";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  // If seller status is pending, redirect to pending approval page
  if (user?.role === "seller" && user?.status === "pending") {
    return <Navigate to="/seller/pending" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <main className="flex-1 w-full lg:w-auto overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
