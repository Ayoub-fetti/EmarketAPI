export default function AdminOrders() {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold text-gray-900">Orders</h2>
        <p className="text-sm text-gray-500">
          Monitor order statuses, soft deletes, and restorations.
        </p>
      </header>
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
        TODO: hook into `/api/orders`, add pagination & status controls.
      </div>
    </section>
  );
}

