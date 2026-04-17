import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import api from "../utils/api";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const getUserId = (user) => user?.id || user?._id;

const normalizeProductsPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const useShopStore = create(
  persist(
    (set, get) => ({
      user: null,
      products: [],
      selectedProduct: null,
      cart: [],
      wishlist: [],
      orders: [],
      isCartOpen: false,
      isProductsLoading: false,
      isProductLoading: false,
      isAuthLoading: false,
      isOrdersLoading: false,
      productsError: "",
      productError: "",

      hydrateMe: async () => {
        if (!localStorage.getItem("bhavya_token")) return null;

        try {
          const { data } = await api.get("/auth/me");
          const user = data.data?.user;
          set({ user });
          return user;
        } catch {
          localStorage.removeItem("bhavya_token");
          set({ user: null });
          return null;
        }
      },

      login: async ({ email, password }) => {
        set({ isAuthLoading: true });
        try {
          const { data } = await api.post("/auth/login", { email, password });
          const { token, user } = data.data;
          localStorage.setItem("bhavya_token", token);
          set({ user, isAuthLoading: false });
          toast.success(`Welcome, ${user.name}`);
          return user;
        } catch (error) {
          set({ isAuthLoading: false });
          toast.error(getErrorMessage(error, "Login failed"));
          throw error;
        }
      },

      register: async ({ name, email, password }) => {
        set({ isAuthLoading: true });
        try {
          const { data } = await api.post("/auth/register", { name, email, password });
          const { token, user } = data.data;
          localStorage.setItem("bhavya_token", token);
          set({ user, isAuthLoading: false });
          toast.success("Account created");
          return user;
        } catch (error) {
          set({ isAuthLoading: false });
          toast.error(getErrorMessage(error, "Registration failed"));
          throw error;
        }
      },

      googleLogin: async (credential) => {
        if (!credential) {
          toast.error("Google credential is missing");
          return null;
        }

        set({ isAuthLoading: true });
        try {
          const { data } = await api.post("/auth/google", { credential });
          const { token, user } = data.data;
          localStorage.setItem("bhavya_token", token);
          set({ user, isAuthLoading: false });
          toast.success("Google login connected");
          return user;
        } catch (error) {
          set({ isAuthLoading: false });
          toast.error(getErrorMessage(error, "Google login failed"));
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // Local logout should still complete even if the API is offline.
        }

        localStorage.removeItem("bhavya_token");
        set({ user: null, cart: [], wishlist: [], orders: [], isCartOpen: false });
        toast.success("Logged out");
      },

      fetchProducts: async (query = {}) => {
        set({ isProductsLoading: true, productsError: "" });
        try {
          const { data } = await api.get("/products", { params: query });
          const products = normalizeProductsPayload(data.data);
          set({ products, isProductsLoading: false });
          return products;
        } catch (error) {
          const message = getErrorMessage(error, "Unable to fetch products");
          set({ isProductsLoading: false, productsError: message, products: [] });
          toast.error(message);
          return [];
        }
      },

      fetchProductBySlug: async (slug) => {
        set({ isProductLoading: true, productError: "", selectedProduct: null });
        try {
          const { data } = await api.get(`/products/${slug}`);
          const product = data.data;
          set((state) => ({
            selectedProduct: product,
            isProductLoading: false,
            products: state.products.some((item) => item._id === product._id)
              ? state.products.map((item) => (item._id === product._id ? product : item))
              : [product, ...state.products],
          }));
          return product;
        } catch (error) {
          const message = getErrorMessage(error, "Unable to fetch product");
          set({ isProductLoading: false, productError: message });
          return null;
        }
      },

      fetchMyOrders: async () => {
        set({ isOrdersLoading: true });
        try {
          const { data } = await api.get("/orders/mine");
          const orders = data.data || [];
          set({ orders, isOrdersLoading: false });
          return orders;
        } catch (error) {
          set({ isOrdersLoading: false });
          toast.error(getErrorMessage(error, "Unable to fetch orders"));
          return [];
        }
      },

      fetchAdminOrders: async () => {
        set({ isOrdersLoading: true });
        try {
          const { data } = await api.get("/orders/admin");
          const orders = data.data || [];
          set({ orders, isOrdersLoading: false });
          return orders;
        } catch (error) {
          set({ isOrdersLoading: false });
          toast.error(getErrorMessage(error, "Unable to fetch admin orders"));
          return [];
        }
      },

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      addToCart: (product, size, quantity = 1) => {
        if (!size) {
          toast.error("Choose a size first");
          return false;
        }

        const stock = product.sizes.find((item) => item.size === size)?.stock || 0;
        const existing = get().cart.find((item) => item.productId === product._id && item.size === size);
        const nextQuantity = (existing?.quantity || 0) + quantity;

        if (nextQuantity > stock) {
          toast.error(`Only ${stock} left in size ${size}`);
          return false;
        }

        set((state) => ({
          cart: existing
            ? state.cart.map((item) =>
                item.productId === product._id && item.size === size
                  ? { ...item, quantity: nextQuantity }
                  : item,
              )
            : [...state.cart, { productId: product._id, size, quantity }],
          isCartOpen: true,
        }));

        toast.success("Added to cart");
        return true;
      },

      updateCartQuantity: (productId, size, quantity) => {
        if (quantity < 1) return get().removeFromCart(productId, size);

        const product = get().products.find((item) => item._id === productId);
        const stock = product?.sizes.find((item) => item.size === size)?.stock || 0;

        if (quantity > stock) {
          toast.error(`Only ${stock} left in size ${size}`);
          return;
        }

        set((state) => ({
          cart: state.cart.map((item) =>
            item.productId === productId && item.size === size ? { ...item, quantity } : item,
          ),
        }));
      },

      removeFromCart: (productId, size) => {
        set((state) => ({
          cart: state.cart.filter((item) => !(item.productId === productId && item.size === size)),
        }));
        toast.success("Removed from cart");
      },

      clearCart: () => set({ cart: [] }),

      toggleWishlist: (productId) => {
        const exists = get().wishlist.includes(productId);
        set((state) => ({
          wishlist: exists
            ? state.wishlist.filter((item) => item !== productId)
            : [...state.wishlist, productId],
        }));
        toast.success(exists ? "Removed from wishlist" : "Added to wishlist");
      },

      addReview: async (productId, review) => {
        try {
          const { data } = await api.post(`/products/${productId}/reviews`, review);
          const product = data.data;
          set((state) => ({
            selectedProduct: product,
            products: state.products.map((item) => (item._id === product._id ? product : item)),
          }));
          toast.success("Review added");
          return product;
        } catch (error) {
          toast.error(getErrorMessage(error, "Unable to add review"));
          throw error;
        }
      },

      placeOrder: async ({ shippingAddress, paymentStatus = "Pending" }) => {
        const { cart, user } = get();

        if (!user) {
          toast.error("Please login before checkout");
          return null;
        }

        if (cart.length === 0) {
          toast.error("Your cart is empty");
          return null;
        }

        try {
          const { data } = await api.post("/orders", {
            items: cart.map((item) => ({
              product: item.productId,
              size: item.size,
              quantity: item.quantity,
            })),
            shippingAddress,
            paymentStatus,
          });

          const order = data.data;
          set((state) => ({
            orders: [order, ...state.orders],
            cart: [],
            isCartOpen: false,
          }));
          await get().fetchProducts();
          toast.success("Order placed");
          return order;
        } catch (error) {
          toast.error(getErrorMessage(error, "Unable to place order"));
          return null;
        }
      },

      createProduct: async (product) => {
        try {
          const { data } = await api.post("/products", product);
          set((state) => ({ products: [data.data, ...state.products] }));
          toast.success("Product saved");
          return data.data;
        } catch (error) {
          toast.error(getErrorMessage(error, "Unable to save product"));
          throw error;
        }
      },

      updateProduct: async (productId, patch) => {
        try {
          const { data } = await api.put(`/products/${productId}`, patch);
          set((state) => ({
            products: state.products.map((product) => (product._id === productId ? data.data : product)),
          }));
          toast.success("Product updated");
          return data.data;
        } catch (error) {
          toast.error(getErrorMessage(error, "Unable to update product"));
          throw error;
        }
      },

      deleteProduct: async (productId) => {
        try {
          await api.delete(`/products/${productId}`);
          set((state) => ({
            products: state.products.filter((product) => product._id !== productId),
            cart: state.cart.filter((item) => item.productId !== productId),
            wishlist: state.wishlist.filter((item) => item !== productId),
          }));
          toast.success("Product deleted");
        } catch (error) {
          toast.error(getErrorMessage(error, "Unable to delete product"));
          throw error;
        }
      },

      updateOrder: async (orderId, patch) => {
        try {
          const { data } = await api.put(`/orders/${orderId}/status`, patch);
          set((state) => ({
            orders: state.orders.map((order) => (order._id === orderId ? data.data : order)),
          }));
          toast.success("Order updated");
          return data.data;
        } catch (error) {
          toast.error(getErrorMessage(error, "Unable to update order"));
          throw error;
        }
      },
    }),
    {
      name: "bhavya-shop-state",
      partialize: (state) => ({
        user: state.user,
        cart: state.cart,
        wishlist: state.wishlist,
      }),
    },
  ),
);

export const getCartDetails = (cart, products) => {
  const items = cart
    .map((cartItem) => {
      const product = products.find((item) => item._id === cartItem.productId);
      if (!product) return null;
      return { ...cartItem, product, lineTotal: product.price * cartItem.quantity };
    })
    .filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  return { items, subtotal, count: items.reduce((sum, item) => sum + item.quantity, 0) };
};

export const getUserIdFromStoreUser = getUserId;
