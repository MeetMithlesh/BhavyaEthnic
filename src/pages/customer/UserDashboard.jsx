import { ExternalLink, LogOut } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import { getOrderStepIndex, orderSteps, formatCurrency } from "../../utils/format";
import { getUserIdFromStoreUser, useShopStore } from "../../stores/useShopStore";

export default function UserDashboard() {
  const user = useShopStore((state) => state.user);
  const logout = useShopStore((state) => state.logout);
  const fetchMyOrders = useShopStore((state) => state.fetchMyOrders);
  const isOrdersLoading = useShopStore((state) => state.isOrdersLoading);
  const allOrders = useShopStore((state) => state.orders);
  const userId = getUserIdFromStoreUser(user);
  const orders = useMemo(
    () => allOrders.filter((order) => !user || order.user === userId || order.user?._id === userId || user.role === "Admin"),
    [allOrders, user, userId],
  );

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-terracotta">Dashboard</p>
          <h1 className="mt-2 font-serif text-5xl text-ink">Hello, {user?.name}</h1>
        </div>
        <Button variant="secondary" onClick={logout}><LogOut className="mr-2" size={18} /> Logout</Button>
      </div>

      <div className="mt-10 grid gap-6">
        {isOrdersLoading && <div className="h-40 animate-pulse rounded-md bg-blush" />}
        {orders.map((order) => {
          const active = getOrderStepIndex(order.orderStatus);
          return (
            <article key={order._id} className="rounded-md bg-white p-6 ring-1 ring-clay/20">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-2xl text-ink">Order {order._id}</p>
                  <p className="mt-1 text-sm text-stone">{new Date(order.createdAt).toLocaleDateString()} - {formatCurrency(order.totalAmount)}</p>
                </div>
                <span className="rounded-md bg-blush px-3 py-1 text-sm font-bold text-terracotta">{order.orderStatus}</span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                {orderSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-3 sm:block">
                    <div className={`size-8 rounded-full ${index <= active ? "bg-terracotta" : "bg-clay/30"}`} />
                    <p className={`mt-0 text-sm font-semibold sm:mt-2 ${index <= active ? "text-ink" : "text-stone"}`}>{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-4">
                {order.items.map((item) => (
                  <div key={`${order._id}-${item.product}-${item.size}`} className="flex gap-4">
                    <div className="h-20 w-16 overflow-hidden rounded-md bg-blush">
                      {item.image && <img src={item.image} alt={item.title} className="h-full w-full object-cover object-top" />}
                    </div>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-stone">Size {item.size} x {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              {order.trackingLink && (
                <a href={order.trackingLink} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-terracotta">
                  Track parcel {order.trackingInfo && `(${order.trackingInfo})`} <ExternalLink size={16} />
                </a>
              )}
            </article>
          );
        })}
        {orders.length === 0 && (
          <div className="rounded-md bg-white p-10 text-center">
            <p className="font-serif text-3xl">No orders yet.</p>
            <Link to="/shop"><Button className="mt-5">Start shopping</Button></Link>
          </div>
        )}
      </div>
    </section>
  );
}
