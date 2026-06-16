import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { LogOut, RefreshCw, XCircle, ShoppingBag, CheckCircle, PackageOpen } from "lucide-react";
import { api } from "../api.js";

export default function ProfilePage({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const showSuccessBanner = searchParams.get("orderPlaced") === "success";

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error("Error loading profile orders:", err);
    }
    setLoading(false);
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await api.cancelOrder(orderId);
        // Update local state
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, orderStatus: "cancelled" } : order
        ));
      } catch (err) {
        alert(err.message || "Failed to cancel order");
      }
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "5rem" }}>
        <h2>Access Denied</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="profile-layout" style={{ animation: "fadeIn 0.5s ease-out" }}>
      {/* Sidebar Info */}
      <aside className="profile-sidebar">
        <div className="profile-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <h2 className="profile-name">{user.username}</h2>
        <p className="profile-email">{user.email}</p>
        
        <div className="profile-meta-item">
          <span style={{ color: "var(--text-muted)" }}>Account Type</span>
          <span style={{ fontWeight: "700", color: "var(--primary)" }}>{user.usertype}</span>
        </div>
        <div className="profile-meta-item">
          <span style={{ color: "var(--text-muted)" }}>Orders Placed</span>
          <span style={{ fontWeight: "700" }}>{orders.length}</span>
        </div>

        <button 
          className="btn btn-secondary" 
          style={{ width: "100%", marginTop: "1.5rem", color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.2)" }}
          onClick={() => {
            localStorage.removeItem("shopez_token");
            window.location.href = "/login";
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </aside>

      {/* Main Order History Section */}
      <div>
        {showSuccessBanner && (
          <div style={{
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid var(--success)",
            color: "var(--success)",
            padding: "1.25rem 1.5rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            animation: "pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          }}>
            <CheckCircle size={32} />
            <div>
              <h3 style={{ color: "var(--success)", fontSize: "1.1rem" }}>Order Placed Successfully!</h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.9 }}>Thank you for shopping with ShopEZ. Your order confirmation has been logged below.</p>
            </div>
            <button 
              onClick={() => {
                setSearchParams({});
              }} 
              style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: "700" }}
            >
              Dismiss
            </button>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 className="orders-list-title">My Orders</h2>
          <button className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }} onClick={fetchOrders} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <h3>Loading orders...</h3>
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "4rem",
            backgroundColor: "var(--bg-card)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)"
          }}>
            <div style={{ display: "inline-flex", padding: "1rem", borderRadius: "50%", background: "var(--border-color)", color: "var(--text-muted)", marginBottom: "1rem" }}>
              <PackageOpen size={36} />
            </div>
            <h3 style={{ marginBottom: "0.5rem" }}>No Orders Yet</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>You haven't placed any orders with ShopEZ yet.</p>
            <a href="/" className="btn btn-primary">Start Shopping</a>
          </div>
        ) : (
          <div className="orders-stack">
            {orders.map((order) => {
              const itemPrice = order.price;
              const discountPrice = Math.round(itemPrice * (1 - order.discount / 100));
              const qty = order.quantity || 1;
              const totalAmount = discountPrice * qty;

              return (
                <div key={order._id} className="order-card">
                  <div className="order-header-row">
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Order ID:</span> <span style={{ fontWeight: "600" }}>{order._id}</span>
                      <span style={{ margin: "0 0.5rem", color: "var(--border-color)" }}>|</span>
                      <span style={{ color: "var(--text-muted)" }}>Placed on:</span> <span style={{ fontWeight: "600" }}>{order.orderDate}</span>
                    </div>
                    <span className={`order-status-badge ${
                      order.orderStatus === "order placed" ? "placed" :
                      order.orderStatus === "in transit" ? "transit" :
                      order.orderStatus === "delivered" ? "delivered" : "cancelled"
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="order-item-detail-row">
                    <img className="order-item-img" src={order.mainImg} alt="" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200"; }} />
                    <div className="order-item-info">
                      <h3 className="order-item-title">{order.title}</h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                        Size: <span style={{ fontWeight: "700", color: "var(--text-main)" }}>{order.size}</span>
                        <span style={{ margin: "0 0.5rem" }}>•</span>
                        Quantity: <span style={{ fontWeight: "700", color: "var(--text-main)" }}>{qty}</span>
                        <span style={{ margin: "0 0.5rem" }}>•</span>
                        Payment: <span style={{ fontWeight: "700", color: "var(--text-main)" }}>{order.paymentMethod}</span>
                      </p>
                      
                      <div className="order-shipping-details">
                        <div style={{ fontWeight: "700", marginBottom: "0.25rem", color: "var(--text-main)" }}>Shipping Destination:</div>
                        <div>{order.name} ({order.mobile})</div>
                        <div>{order.address}, Pincode: {order.pincode}</div>
                        {order.orderStatus !== "cancelled" && order.orderStatus !== "delivered" && (
                          <div style={{ marginTop: "0.25rem", color: "var(--primary)", fontWeight: "600" }}>
                            Expected Delivery: {order.deliveryDate}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "800", fontSize: "1.15rem" }}>₹{totalAmount}</div>
                        {order.discount > 0 && (
                          <div style={{ fontSize: "0.8rem", textDecoration: "line-through", color: "var(--text-muted)" }}>
                            ₹{itemPrice * qty}
                          </div>
                        )}
                      </div>

                      {order.orderStatus !== "cancelled" && order.orderStatus !== "delivered" && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ 
                            padding: "0.4rem 0.8rem", 
                            fontSize: "0.8rem", 
                            color: "var(--danger)", 
                            borderColor: "rgba(239, 68, 68, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem"
                          }}
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          <XCircle size={14} />
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
