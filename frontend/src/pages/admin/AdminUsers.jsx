import { useCallback, useEffect, useState, useMemo } from "react";
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
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newRole, setNewRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(null); // 'delete', 'softDelete', 'restore'
  const [actionLoading, setActionLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "user",
    status: "active",
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [active, deleted] = await Promise.all([
        adminUsersService.fetchUsers(),
        adminUsersService.fetchDeletedUsers(),
      ]);
      setUsers(active);
      setDeletedUsers(deleted);
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

  const filteredUsers = useMemo(() => {
    const source = showDeleted ? deletedUsers : users;
    if (roleFilter === "all") return source;
    return source.filter((user) => user.role === roleFilter);
  }, [users, deletedUsers, roleFilter, showDeleted]);

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

  const openViewModal = async (user) => {
    setViewingUser(null);
    try {
      const userDetails = await adminUsersService.fetchUserById(user._id);
      setViewingUser(userDetails);
    } catch (err) {
      toast.error("Impossible de charger les détails de l'utilisateur.");
    }
  };

  const closeViewModal = () => {
    setViewingUser(null);
  };

  const openActionModal = (user, type) => {
    setActionTarget(user);
    setActionType(type);
  };

  const closeActionModal = () => {
    setActionTarget(null);
    setActionType(null);
    setActionLoading(false);
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
      await fetchUsers();
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

  const handleCreate = async () => {
    if (!newUser.fullname || !newUser.email || !newUser.password) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setCreating(true);
    try {
      const createdUser = await adminUsersService.createUser(newUser);
      toast.success("Utilisateur créé avec succès.");
      setNewUser({
        fullname: "",
        email: "",
        password: "",
        role: "user",
        status: "active",
      });
      setIsCreateModalOpen(false);
      await fetchUsers();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Impossible de créer l'utilisateur.";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleAction = async () => {
    if (!actionTarget || !actionType) return;
    setActionLoading(true);
    try {
      if (actionType === "delete") {
        await adminUsersService.deleteUser(actionTarget._id);
        toast.success("Utilisateur supprimé définitivement.");
        setUsers((prev) => prev.filter((u) => u._id !== actionTarget._id));
        setDeletedUsers((prev) =>
          prev.filter((u) => u._id !== actionTarget._id),
        );
      } else if (actionType === "softDelete") {
        await adminUsersService.softDeleteUser(actionTarget._id);
        toast.success("Utilisateur désactivé.");
        setUsers((prev) => prev.filter((u) => u._id !== actionTarget._id));
      } else if (actionType === "restore") {
        await adminUsersService.restoreUser(actionTarget._id);
        toast.success("Utilisateur restauré.");
        setDeletedUsers((prev) =>
          prev.filter((u) => u._id !== actionTarget._id),
        );
      }
      closeActionModal();
      await fetchUsers();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Une erreur est survenue.";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFilterByRole = async (role) => {
    if (role === "all") {
      await fetchUsers();
      return;
    }
    setLoading(true);
    try {
      const filtered = await adminUsersService.filterUsersByRole(role);
      if (showDeleted) {
        setDeletedUsers(filtered);
      } else {
        setUsers(filtered);
      }
    } catch (err) {
      toast.error("Erreur lors du filtrage.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && users.length === 0 && deletedUsers.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && users.length === 0) {
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

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Filtrer par rôle:
          </label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              handleFilterByRole(e.target.value);
            }}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tous</option>
            <option value="user">Utilisateur</option>
            <option value="seller">Vendeur</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Afficher:</label>
          <button
            type="button"
            onClick={() => setShowDeleted(false)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              !showDeleted
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Actifs ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setShowDeleted(true)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              showDeleted
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Supprimés ({deletedUsers.length})
          </button>
        </div>
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            + Créer un utilisateur
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {showDeleted ? "Utilisateurs supprimés" : "Utilisateurs actifs"}
          </h3>
          <p className="text-sm text-gray-500">
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? "s" : ""} trouvé
            {filteredUsers.length > 1 ? "s" : ""}.
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
              {filteredUsers.map((user) => (
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
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openViewModal(user)}
                        className="rounded-md border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                      >
                        Détails
                      </button>
                      {!showDeleted ? (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="rounded-md border border-green-200 px-3 py-1 text-xs font-semibold text-green-600 transition hover:bg-green-50"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => openActionModal(user, "softDelete")}
                            className="rounded-md border border-yellow-200 px-3 py-1 text-xs font-semibold text-yellow-600 transition hover:bg-yellow-50"
                          >
                            Désactiver
                          </button>
                          <button
                            type="button"
                            onClick={() => openActionModal(user, "delete")}
                            className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Supprimer
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openActionModal(user, "restore")}
                          className="rounded-md border border-green-200 px-3 py-1 text-xs font-semibold text-green-600 transition hover:bg-green-50"
                        >
                          Restaurer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
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

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Créer un nouvel utilisateur
            </h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={newUser.fullname}
                  onChange={(e) =>
                    setNewUser({ ...newUser, fullname: e.target.value })
                  }
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rôle
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      role: e.target.value,
                      status: e.target.value === "seller" ? "pending" : "active",
                    })
                  }
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
                  value={newUser.status}
                  onChange={(e) =>
                    setNewUser({ ...newUser, status: e.target.value })
                  }
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
                  if (creating) return;
                  setIsCreateModalOpen(false);
                  setNewUser({
                    fullname: "",
                    email: "",
                    password: "",
                    role: "user",
                    status: "active",
                  });
                }}
                disabled={creating}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {creating ? "Création..." : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
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

      {/* View User Details Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Détails de l'utilisateur
            </h3>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Nom:</span>
                <p className="text-sm text-gray-900">
                  {viewingUser.fullname || "—"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Email:
                </span>
                <p className="text-sm text-gray-900">{viewingUser.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Rôle:</span>
                <span
                  className={`ml-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    roleColors[viewingUser.role] || roleColors.user
                  }`}
                >
                  {roleLabels[viewingUser.role] || viewingUser.role}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Statut:
                </span>
                <span
                  className={`ml-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    statusColors[viewingUser.status] || statusColors.active
                  }`}
                >
                  {statusLabels[viewingUser.status] || viewingUser.status}
                </span>
              </div>
              {viewingUser.avatar && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Avatar:
                  </span>
                  <p className="text-sm text-gray-900">{viewingUser.avatar}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Date de création:
                </span>
                <p className="text-sm text-gray-900">
                  {viewingUser.createdAt
                    ? new Date(viewingUser.createdAt).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "—"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeViewModal}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionTarget && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              {actionType === "delete"
                ? "Supprimer définitivement"
                : actionType === "softDelete"
                  ? "Désactiver l'utilisateur"
                  : "Restaurer l'utilisateur"}
            </h3>
            <p className="mt-3 text-sm text-gray-600">
              {actionType === "delete" &&
                "Cette action est irréversible. L'utilisateur sera supprimé définitivement de la base de données."}
              {actionType === "softDelete" &&
                "L'utilisateur sera désactivé mais pourra être restauré plus tard."}
              {actionType === "restore" &&
                "L'utilisateur sera restauré et réapparaîtra dans la liste active."}
            </p>
            <p className="mt-2 text-sm text-gray-800">
              Utilisateur:{" "}
              <span className="font-semibold">
                {actionTarget.fullname} ({actionTarget.email})
              </span>
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (actionLoading) return;
                  closeActionModal();
                }}
                disabled={actionLoading}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAction}
                disabled={actionLoading}
                className={[
                  "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70",
                  actionType === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : actionType === "softDelete"
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-green-600 hover:bg-green-700",
                ].join(" ")}
              >
                {actionLoading ? "Traitement..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
