import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { api } from "../api.js";

export default function CartPage({ user, cart, refreshCart }) {
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "5rem" }}>
        <h2>Please log in to view your cart</h2>
        <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={() => navigate("/login")}>
          Login
        </button>
      </div>
    );
  }

  const handleQuantityChange = async (item, diff) => {
    const currentQty = parseInt(item.quantity || 1);
    if (currentQty + diff <= 0) {
      handleRemoveItem(item._id);
      return;
    }

    setUpdatingId(item._id);
    try {
      // Send the difference to increment/decrement in database
      await api.addToCart({
        title: item.title,
        size: item.size,
        quantity: diff,
        price: item.price,
        discount: item.discount
      });
      await refreshCart();
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
    }
    setUpdatingId(null);
  };

  const handleRemoveItem = async (id) => {
    setUpdatingId(id);
    try {
      await api.removeFromCart(id);
      await refreshCart();
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
    setUpdatingId(null);
  };

  const handleClearCart = async () => {
    try {
      await api.clearCart();
      await refreshCart();
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "5rem", animation: "fadeIn 0.5s ease" }}>
        <div style={{ display: "inline-flex", padding: "1.5rem", borderRadius: "50%", background: "var(--primary-glow)", color: "var(--primary)", marginBottom: "1.5rem" }}>
          <ShoppingBag size={48} />
        </div>
        <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Your Cart is Empty</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Explore our extensive product catalog and find the perfect items to add!</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Start Shopping
        </button>
      </div>
    );
  }

  // Price calculations
  let totalMRP = 0;
  let totalDiscount = 0;
  cart.forEach((item) => {
    const qty = parseInt(item.quantity || 1);
    const itemTotalMRP = item.price * qty;
    const finalPrice = Math.round(item.price * (1 - item.discount / 100));
    const itemFinalTotal = finalPrice * qty;

    totalMRP += itemTotalMRP;
    totalDiscount += (itemTotalMRP - itemFinalTotal);
  });

  const deliveryCharges = 0; // Free
  const finalPrice = totalMRP - totalDiscount + deliveryCharges;

  return (
    <div className="cart-layout" style={{ animation: "fadeIn 0.5s ease-out" }}>
      {/* Cart Items List */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2>Shopping Cart ({cart.length} unique items)</h2>
          <button className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.2)" }} onClick={handleClearCart}>
            Clear Cart
          </button>
        </div>

        <div className="cart-items-list">
          {cart.map((item) => {
            const itemFinalPrice = Math.round(item.price * (1 - item.discount / 100));
            const qty = parseInt(item.quantity || 1);
            return (
              <div key={item._id} className="cart-item-card" style={{ opacity: updatingId === item._id ? 0.6 : 1 }}>
                <img className="cart-item-img" src={item.mainImg} alt={item.title} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200"; }} />
                
                <div className="cart-item-details">
                  <div>
                    <h3 className="cart-item-title">{item.title}</h3>
                    <div className="cart-item-meta" style={{ marginTop: "0.25rem" }}>
                      Size: <span style={{ fontWeight: "700", color: "var(--text-main)" }}>{item.size}</span>
                    </div>
                  </div>

                  <div className="cart-item-qty-row">
                    <button className="qty-btn" disabled={updatingId === item._id} onClick={() => handleQuantityChange(item, -1)}>-</button>
                    <span className="qty-val">{qty}</span>
                    <button className="qty-btn" disabled={updatingId === item._id} onClick={() => handleQuantityChange(item, 1)}>+</button>
                  </div>
                </div>

                <div className="cart-item-price-side">
                  <button className="remove-item-btn" disabled={updatingId === item._id} onClick={() => handleRemoveItem(item._id)}>
                    <Trash2 size={14} />
                    Remove
                  </button>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "800", fontSize: "1.1rem" }}>₹{itemFinalPrice * qty}</div>
                    {item.discount > 0 && (
                      <div style={{ fontSize: "0.75rem", textDecoration: "line-through", color: "var(--text-muted)" }}>
                        ₹{item.price * qty}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Summary Panel */}
      <div className="summary-card">
        <h3 className="summary-title">Price Details</h3>
        
        <div className="summary-row">
          <span>Total MRP</span>
          <span>₹{totalMRP}</span>
        </div>
        
        <div className="summary-row" style={{ color: "var(--success)" }}>
          <span>Discount on MRP</span>
          <span>- ₹{totalDiscount}</span>
        </div>
        
        <div className="summary-row">
          <span>Delivery Charges</span>
          <span style={{ color: "var(--success)", fontWeight: "600" }}>FREE</span>
        </div>

        <div className="summary-row total">
          <span>Total Amount</span>
          <span>₹{finalPrice}</span>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "1.5rem", padding: "1rem" }}
          onClick={() => navigate("/checkout")}
        >
          Place Order
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
