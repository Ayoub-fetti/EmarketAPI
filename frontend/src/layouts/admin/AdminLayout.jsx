import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

