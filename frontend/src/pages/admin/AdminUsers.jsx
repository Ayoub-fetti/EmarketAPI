import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { adminUsersService } from "../../services/admin/adminUsersService";

const statusLabels = {
  active: "Actif",
  pending: "En attente",
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
};

const roleLabels = {
  user: "Utilisateur",
  seller: "Vendeur",
  admin: "Administrateur",
};

const roleColors = {
  user: "bg-blue-100 text-blue-800",
  seller: "bg-purple-100 text-purple-800",
  admin: "bg-red-100 text-red-800",
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newRole, setNewRole] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminUsersService.fetchUsers();
      setUsers(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Erreur lors du chargement des utilisateurs.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openEditModal = (user) => {
    setEditingUser(user);
    setNewStatus(user.status || "active");
    setNewRole(user.role || "user");
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setNewStatus("");
    setNewRole("");
    setSaving(false);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const updatedUser = await adminUsersService.updateUserStatusAndRole(
        editingUser._id,
        {
          status: newStatus,
          role: newRole,
        },
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === editingUser._id ? updatedUser : u)),
      );
      toast.success("Utilisateur mis à jour avec succès.");
      closeEditModal();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Impossible de mettre à jour l'utilisateur.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-600">
        <div className="font-semibold">Erreur</div>
        <p className="mt-2 text-sm">{error}</p>
        <button
          type="button"
          onClick={fetchUsers}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-gray-900">
          Gestion des utilisateurs
        </h2>
        <p className="text-sm text-gray-500">
          Consultez et gérez les utilisateurs, leurs statuts et leurs rôles.
        </p>
      </header>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Liste des utilisateurs
          </h3>
          <p className="text-sm text-gray-500">
            {users.length} utilisateur{users.length > 1 ? "s" : ""} trouvé
            {users.length > 1 ? "s" : ""}.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Nom",
                  "Email",
                  "Rôle",
                  "Statut",
                  "Date d'inscription",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {user.fullname || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        roleColors[user.role] || roleColors.user
                      }`}
                    >
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        statusColors[user.status] || statusColors.active
                      }`}
                    >
                      {statusLabels[user.status] || user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(user)}
                      className="rounded-md border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Modifier l'utilisateur
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {editingUser.fullname} ({editingUser.email})
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rôle
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="user">Utilisateur</option>
                  <option value="seller">Vendeur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Statut
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="active">Actif</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (saving) return;
                  closeEditModal();
                }}
                disabled={saving}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving ||
                  (newStatus === editingUser.status &&
                    newRole === editingUser.role)
                }
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
