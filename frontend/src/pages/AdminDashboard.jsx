import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <h1 className="text-3xl font-semibold">Salam, ana admin</h1>
      {user && (
        <p className="text-lg text-gray-600 text-center max-w-xl">
          {`Welcome ${user.fullname || user.email}! This simple dashboard is only here so we can test the role-based redirect.`}
        </p>
      )}
    </div>
  );
}

