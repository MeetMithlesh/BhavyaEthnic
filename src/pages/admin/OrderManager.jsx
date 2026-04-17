import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import { useShopStore } from "../../stores/useShopStore";
import { formatCurrency } from "../../utils/format";

const statuses = ["Live", "Confirmed", "Shipped", "Delivered", "Cancelled"];

export default function OrderManager() {
  const orders = useShopStore((state) => state.orders);
  const fetchAdminOrders = useShopStore((state) => state.fetchAdminOrders);
  const isOrdersLoading = useShopStore((state) => state.isOrdersLoading);
  const updateOrder = useShopStore((state) => state.updateOrder);
  const [statusFilter, setStatusFilter] = useState("All");
  const [tracking, setTracking] = useState({});
  const filtered = statusFilter === "All" ? orders : orders.filter((order) => order.orderStatus === statusFilter);

  useEffect(() => {
    fetchAdminOrders();
  }, [fetchAdminOrders]);

  const update = (order, orderStatus) => {
    updateOrder(order._id, {
      orderStatus,
      trackingInfo: tracking[order._id]?.trackingInfo || order.trackingInfo,
      trackingLink: tracking[order._id]?.trackingLink || order.trackingLink,
    });
  };

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-terracotta">Orders</p>
          <h1 className="mt-2 font-serif text-4xl">Order manager</h1>
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-md border border-clay/30 bg-white px-3 outline-none">
          {["All", ...statuses].map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>
      <div className="mt-8 grid gap-5">
        {isOrdersLoading && <div className="h-40 animate-pulse rounded-md bg-blush" />}
        {filtered.map((order) => (
          <article key={order._id} className="rounded-md bg-white p-5 ring-1 ring-clay/20">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-serif text-2xl">{order._id}</p>
                <p className="mt-1 text-sm text-stone">{order.shippingAddress.fullName} - {order.shippingAddress.city}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatCurrency(order.totalAmount)}</p>
                <p className="text-sm text-stone">{order.paymentStatus}</p>
              </div>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-stone">
                  <tr>
                    <th className="py-2">Item</th>
                    <th>Size</th>
                    <th>Qty</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={`${item.product}-${item.size}`} className="border-t border-clay/15">
                      <td className="flex items-center gap-3 py-3">
                        <div className="h-14 w-11 overflow-hidden rounded-md bg-blush">
                          {item.image && <img src={item.image} alt={item.title} className="h-full w-full object-cover object-top" />}
                        </div>
                        {item.title}
                      </td>
                      <td>{item.size}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
              <input
                value={tracking[order._id]?.trackingInfo ?? order.trackingInfo ?? ""}
                onChange={(event) => setTracking((current) => ({ ...current, [order._id]: { ...current[order._id], trackingInfo: event.target.value } }))}
                placeholder="Tracking number or info"
                className="h-11 rounded-md border border-clay/30 px-3 outline-none focus:border-terracotta"
              />
              <input
                value={tracking[order._id]?.trackingLink ?? order.trackingLink ?? ""}
                onChange={(event) => setTracking((current) => ({ ...current, [order._id]: { ...current[order._id], trackingLink: event.target.value } }))}
                placeholder="Tracking link"
                className="h-11 rounded-md border border-clay/30 px-3 outline-none focus:border-terracotta"
              />
              {order.trackingLink && (
                <a href={order.trackingLink} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-blush px-4 text-sm font-bold text-terracotta">
                  Open <ExternalLink size={15} />
                </a>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {statuses.map((status) => (
                <Button key={status} variant={order.orderStatus === status ? "dark" : "secondary"} onClick={() => update(order, status)}>
                  Mark {status}
                </Button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
