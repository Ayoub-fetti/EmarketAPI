import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function PendingApproval() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user status changes to active, redirect to dashboard
    if (user?.status === "active") {
      navigate("/seller/overview", { replace: true });
    }
  }, [user?.status, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg text-center">
        <div className="mb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Demande en attente d'approbation
        </h1>

        <p className="mb-6 text-gray-600">
          Votre demande de compte vendeur est en cours de traitement. Un
          administrateur examinera votre demande et vous notifiera une fois
          votre compte approuvé.
        </p>

        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-left">
          <p className="text-sm text-blue-800">
            <strong>Que se passe-t-il ensuite ?</strong>
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-700">
            <li>Un administrateur examinera votre demande</li>
            <li>Vous recevrez une notification une fois approuvé</li>
            <li>Vous pourrez alors accéder à votre tableau de bord</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Se déconnecter
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Actualiser
          </button>
        </div>
      </div>
    </div>
  );
}

