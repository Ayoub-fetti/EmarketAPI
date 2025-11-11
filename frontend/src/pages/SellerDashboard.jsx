import { useAuth } from "../context/AuthContext";

export default function SellerDashboard() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <h1 className="text-3xl font-semibold">Salam, ana seller</h1>
      {user && (
        <p className="text-lg text-gray-600 text-center max-w-xl">
          {`Welcome ${user.fullname || user.email}! Hadi page test bash nta2kdo belli redirect dial seller khdam.`}
        </p>
      )}
    </div>
  );
}

