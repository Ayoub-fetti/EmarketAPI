import React from "react";
import useAdminStats from "../../hooks/admin/useAdminStats";
import AdminStatsDashboard from "../../components/admin/AdminStatsDashboard";

export default function AdminStats() {
  const {
    loading,
    error,
    stats,
    monthlyRevenue,
    topProducts,
    recentOrders,
    refetch,
  } = useAdminStats();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-sm text-gray-500">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-600">
        <div className="font-semibold">Error</div>
        <p className="mt-2 text-sm">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-4 sm:space-y-6">
      <header className="space-y-2 mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Analytics Dashboard
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Overview of sales, users, and performance.
        </p>
      </header>

      <AdminStatsDashboard
        stats={stats}
        monthlyRevenue={monthlyRevenue}
        topProducts={topProducts}
        recentOrders={recentOrders}
      />
    </section>
  );
}
