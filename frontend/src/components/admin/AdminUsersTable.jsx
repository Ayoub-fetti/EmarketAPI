import React, { memo } from "react";
import { FaEye, FaEdit, FaBan, FaTrash, FaUndo, FaUsers } from "react-icons/fa";

const statusLabels = {
  active: "Active",
  pending: "Pending",
};

const statusColors = {
  active: "bg-green-100 text-green-800 border border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
};

const roleLabels = {
  user: "User",
  seller: "Seller",
  admin: "Admin",
};

const roleColors = {
  user: "bg-blue-100 text-blue-800 border border-blue-200",
  seller: "bg-purple-100 text-purple-800 border border-purple-200",
  admin: "bg-red-100 text-red-800 border border-red-200",
};

const AdminUsersTable = memo(
  ({
    users,
    showDeleted,
    onView,
    onEdit,
    onSoftDelete,
    onDelete,
    onRestore,
  }) => {
    return (
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {[
                  "Name",
                  "Email",
                  "Role",
                  "Status",
                  "Registration Date",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900">
                    <div className="truncate max-w-[120px] sm:max-w-none">
                      {user.fullname || "—"}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-700">
                    <div className="truncate max-w-[150px] sm:max-w-none">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span
                      className={`inline-flex rounded-full px-2 sm:px-3 py-1 text-xs font-bold shadow-sm whitespace-nowrap ${
                        roleColors[user.role] || roleColors.user
                      }`}
                    >
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span
                      className={`inline-flex rounded-full px-2 sm:px-3 py-1 text-xs font-bold shadow-sm whitespace-nowrap ${
                        statusColors[user.status] || statusColors.active
                      }`}
                    >
                      {statusLabels[user.status] || user.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => onView(user)}
                        className="flex items-center gap-1 rounded-lg border border-blue-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                        title="View"
                      >
                        <FaEye className="w-3 h-3" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      {!showDeleted ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onEdit(user)}
                            className="flex items-center gap-1 rounded-lg border border-green-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-green-600 transition hover:bg-green-50"
                            title="Edit"
                          >
                            <FaEdit className="w-3 h-3" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSoftDelete(user)}
                            className="flex items-center gap-1 rounded-lg border border-yellow-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-yellow-600 transition hover:bg-yellow-50"
                            title="Deactivate"
                          >
                            <FaBan className="w-3 h-3" />
                            <span className="hidden sm:inline">Deactivate</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(user)}
                            className="flex items-center gap-1 rounded-lg border border-red-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                            title="Delete"
                          >
                            <FaTrash className="w-3 h-3" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRestore(user)}
                          className="flex items-center gap-1 rounded-lg border border-green-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-green-600 transition hover:bg-green-50"
                          title="Restore"
                        >
                          <FaUndo className="w-3 h-3" />
                          <span className="hidden sm:inline">Restore</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 sm:px-6 py-12 text-center text-xs sm:text-sm text-gray-500"
                  >
                    <FaUsers className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p>No users found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

export default AdminUsersTable;
