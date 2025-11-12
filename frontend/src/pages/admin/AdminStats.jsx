export default function AdminStats() {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-gray-900">
          Overview & Statistics
        </h2>
        <p className="text-sm text-gray-500">
          Placeholder section to plug charts and KPIs later.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Total Sales", "Active Users", "Orders Today", "Low Stock"].map(
          (title) => (
            <div
              key={title}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm text-gray-500">{title}</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">0</p>
            </div>
          ),
        )}
      </div>
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
        Future spot for analytics (charts, tables, etc.).
      </div>
    </section>
  );
}

