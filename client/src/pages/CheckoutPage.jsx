import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Truck } from "lucide-react";
import { api } from "../api.js";

export default function CheckoutPage({ user, cart, refreshCart }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user ? user.username : "",
    email: user ? user.email : "",
    mobile: "",
    address: "",
    pincode: "",
    paymentMethod: "Cash on Delivery"
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!user || cart.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "5rem" }}>
        <h2>Invalid Checkout State</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Please add items to your cart before checking out.</p>
        <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={() => navigate("/")}>
          Go Shopping
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, mobile, address, pincode, paymentMethod } = formData;

    if (!name || !email || !mobile || !address || !pincode) {
      setErrorMsg("All fields are required.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await api.placeOrder({
        name,
        email,
        mobile,
        address,
        pincode,
        paymentMethod,
        items: cart
      });

      // Reset cart locally
      await refreshCart();
      
      // Redirect to profile to see placed order
      navigate("/profile?orderPlaced=success");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to place order. Please try again.");
    }
    setLoading(false);
  };

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
  const finalPrice = totalMRP - totalDiscount;

  return (
    <div className="checkout-layout" style={{ animation: "fadeIn 0.5s ease-out" }}>
      {/* Shipping details form */}
      <div>
        <h2 style={{ marginBottom: "1.5rem" }}>Shipping Details</h2>
        
        {errorMsg && (
          <div style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", border: "1px solid var(--danger)", marginBottom: "1.25rem", fontSize: "0.9rem" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ backgroundColor: "var(--bg-card)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
          <div className="form-group">
            <label htmlFor="name">Recipient Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              placeholder="10-digit mobile number"
              className="form-control"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Full Shipping Address</label>
            <textarea
              id="address"
              name="address"
              rows="3"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
              required
              style={{ resize: "vertical" }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pincode">Pincode / Zip Code</label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              className="form-control"
              value={formData.pincode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "0" }}>
            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              className="form-control"
              value={formData.paymentMethod}
              onChange={handleChange}
            >
              <option value="Cash on Delivery">Cash on Delivery (COD)</option>
              <option value="Netbanking">Netbanking</option>
              <option value="UPI / GPay">UPI / GPay</option>
              <option value="Credit / Debit Card">Credit / Debit Card</option>
            </select>
          </div>
        </form>
      </div>

      {/* Checkout Summary panel */}
      <div>
        <h2 style={{ marginBottom: "1.5rem" }}>Order Summary</h2>
        <div className="summary-card" style={{ position: "static" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "180px", overflowY: "auto", marginBottom: "1.25rem", paddingRight: "0.5rem" }}>
            {cart.map((item) => (
              <div key={item._id} style={{ display: "flex", justifySpace: "between", alignItems: "center", gap: "1rem", fontSize: "0.85rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
                <img src={item.mainImg} alt="" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }} />
                <div style={{ flexGrow: "1" }}>
                  <div style={{ fontWeight: "700" }}>{item.title}</div>
                  <div style={{ color: "var(--text-muted)" }}>Qty: {item.quantity} • Size: {item.size}</div>
                </div>
                <div style={{ fontWeight: "700" }}>₹{Math.round(item.price * (1 - item.discount / 100)) * parseInt(item.quantity || 1)}</div>
              </div>
            ))}
          </div>

          <div className="summary-row">
            <span>Total Items Price</span>
            <span>₹{totalMRP}</span>
          </div>
          
          <div className="summary-row" style={{ color: "var(--success)" }}>
            <span>Discount on Items</span>
            <span>- ₹{totalDiscount}</span>
          </div>
          
          <div className="summary-row">
            <span>Shipping Fees</span>
            <span style={{ color: "var(--success)", fontWeight: "600" }}>FREE</span>
          </div>

          <div className="summary-row total" style={{ marginBottom: "1.5rem" }}>
            <span>Amount Payable</span>
            <span>₹{finalPrice}</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "1rem" }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm & Place Order"}
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1.25rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <ShieldCheck size={16} color="var(--success)" />
              <span>Secure checkout. 256-bit SSL Encryption.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <Truck size={16} color="var(--primary)" />
              <span>Estimated delivery: 3-5 business days.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
