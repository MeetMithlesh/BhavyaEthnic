import { IndianRupee, Package, ShoppingBag, Truck } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import { useShopStore } from "../../stores/useShopStore";
import { formatCurrency } from "../../utils/format";

export default function AdminDashboard() {
  const orders = useShopStore((state) => state.orders);
  const products = useShopStore((state) => state.products);
  const fetchProducts = useShopStore((state) => state.fetchProducts);
  const fetchAdminOrders = useShopStore((state) => state.fetchAdminOrders);
  const isOrdersLoading = useShopStore((state) => state.isOrdersLoading);
  const sales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pending = orders.filter((order) => !["Delivered", "Cancelled"].includes(order.orderStatus)).length;

  const stats = [
    { label: "Total sales", value: formatCurrency(sales), icon: IndianRupee },
    { label: "Pending orders", value: pending, icon: Truck },
    { label: "Products", value: products.length, icon: Package },
    { label: "Orders", value: orders.length, icon: ShoppingBag },
  ];

  useEffect(() => {
    fetchProducts();
    fetchAdminOrders();
  }, [fetchAdminOrders, fetchProducts]);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-terracotta">Admin</p>
          <h1 className="mt-2 font-serif text-4xl">Store dashboard</h1>
        </div>
        <Link to="/admin/products"><Button>Add product</Button></Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-md bg-white p-5 ring-1 ring-clay/20">
            <Icon className="text-terracotta" />
            <p className="mt-5 text-sm text-stone">{label}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-md bg-white p-5 ring-1 ring-clay/20">
        <h2 className="font-serif text-2xl">Recent orders</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-stone">
              <tr>
                <th className="py-3">Order</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {isOrdersLoading && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-stone">Loading orders...</td>
                </tr>
              )}
              {orders.slice(0, 5).map((order) => (
                <tr key={order._id} className="border-t border-clay/15">
                  <td className="py-3 font-semibold">{order._id}</td>
                  <td>{order.orderStatus}</td>
                  <td>{order.paymentStatus}</td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td>{order.items.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
