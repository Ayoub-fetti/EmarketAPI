import { MdEdit, MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import React from "react";

function CouponsTable({ coupons, onDelete }) {
  const navigate = useNavigate();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        label: "Actif",
        className: "bg-orange-100 text-orange-800",
      },
      inactive: {
        label: "Inactif",
        className: "bg-gray-100 text-gray-800",
      },
    };

    const config = statusConfig[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const isExpired = (expirationDate) => {
    return new Date(expirationDate) < new Date();
  };

  const getUsageInfo = (usedBy, maxUsage) => {
    const used = usedBy.length;
    if (maxUsage) {
      const percentage = (used / maxUsage) * 100;
      return { used, maxUsage, percentage: Math.round(percentage) };
    }
    return { used, maxUsage: null, percentage: null };
  };

  const handleDelete = (coupon) => {
    if (onDelete) {
      onDelete(coupon);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-600 uppercase px-4 sm:px-6 py-4 min-w-[160px]">
                Code
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase px-4 py-4 min-w-[120px]">
                Réduction
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase px-4 py-4 hidden md:table-cell min-w-[180px]">
                Validité
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase px-4 py-4 hidden lg:table-cell min-w-[120px]">
                Utilisation
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase px-4 py-4 hidden xl:table-cell min-w-[100px]">
                Achat Min.
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase px-4 py-4 min-w-[100px]">
                Statut
              </th>
              <th className="text-right text-xs font-semibold text-gray-600 uppercase px-4 sm:px-6 py-4 min-w-[140px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => {
              const expired = isExpired(coupon.expirationDate);
              const usageInfo = getUsageInfo(coupon.usedBy, coupon.maxUsage);

              return (
                <tr
                  key={coupon._id}
                  className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 ${
                    expired ? "opacity-60" : ""
                  }`}
                >
                  {/* Code */}
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-meduim text-sm text-gray-900">
                        {coupon.code}
                      </span>
                    </div>
                  </td>

                  {/* Réduction */}
                  <td className="px-4 py-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {coupon.value}
                      </span>
                      {coupon.type === "percentage" ? (
                        <span>%</span>
                      ) : (
                        <span>DH</span>
                      )}
                    </div>
                  </td>

                  {/* Validité */}
                  <td className="px-4 py-4 hidden md:table-cell">
                    <div className="text-xs">
                      <div className="text-gray-900">
                        {formatDate(coupon.startDate)}
                      </div>
                      <div className="text-gray-500">
                        au {formatDate(coupon.expirationDate)}
                      </div>
                      {expired && (
                        <span className="text-red-700 font-medium">Expiré</span>
                      )}
                    </div>
                  </td>

                  {/* Utilisation */}
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <div className="text-sm">
                      <div className="text-gray-900 mb-1">
                        {usageInfo.used}
                        {usageInfo.maxUsage ? ` / ${usageInfo.maxUsage}` : ""}
                      </div>
                      {usageInfo.percentage !== null && (
                        <div className="w-20">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                usageInfo.percentage >= 80
                                  ? "bg-red-600"
                                  : usageInfo.percentage >= 50
                                  ? "bg-yellow-600"
                                  : "bg-green-600"
                              }`}
                              style={{ width: `${usageInfo.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Achat minimum */}
                  <td className="px-4 py-4 text-sm text-gray-900 hidden xl:table-cell">
                    {coupon.minimumPurchase > 0
                      ? `${coupon.minimumPurchase} DH`
                      : "Aucun"}
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-4">{getStatusBadge(coupon.status)}</td>

                  {/* Actions */}
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 rounded-md transition-colors bg-orange-700 hover:bg-orange-800"
                        title="Modifier"
                        onClick={() =>
                          navigate(`/seller/coupons/edit/${coupon._id}`)
                        }
                      >
                        <MdEdit className="text-lg text-white" />
                      </button>
                      <button
                        className="p-2 bg-gray-700 hover:bg-gray-800 rounded-md transition-colors"
                        title="Supprimer"
                        onClick={() => handleDelete(coupon)}
                      >
                        <MdDelete className="text-lg text-white" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default React.memo(CouponsTable);
