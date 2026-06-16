import React, { useState, useEffect } from "react";
import { Users, ShoppingBag, CreditCard, Image, Plus, ListFilter, Trash2, Edit2, CheckCircle2 } from "lucide-react";
import { api } from "../api.js";

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, products, orders, new-product
  
  // Stats
  const [stats, setStats] = useState({ totalUsers: 0, totalProducts: 0, totalOrders: 0 });
  const [banner, setBanner] = useState("");
  const [categoriesStr, setCategoriesStr] = useState("");
  
  // Lists
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Forms & Modal states
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    mainImg: "",
    carousel1: "",
    carousel2: "",
    carousel3: "",
    sizes: ["S", "M", "L", "XL"],
    category: "Fashion",
    gender: "Unisex",
    price: "",
    discount: ""
  });
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [alertMsg, setAlertMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.usertype === "Admin") {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsData = await api.getAdminStats();
      setStats(statsData);

      const config = await api.getAdminConfig();
      if (config) {
        setBanner(config.banner || "");
        setCategoriesStr((config.categories || []).join(", "));
      }

      const productsData = await api.getProducts();
      setProducts(productsData);

      const ordersData = await api.getOrders();
      setOrders(ordersData);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    }
    setLoading(false);
  };

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    try {
      const categoriesArray = categoriesStr.split(",").map(c => c.trim()).filter(Boolean);
      await api.updateAdminConfig({
        banner,
        categories: categoriesArray
      });
      triggerAlert("Configuration updated successfully!");
    } catch (err) {
      triggerAlert(err.message || "Failed to update configurations");
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const carousel = [newProduct.carousel1, newProduct.carousel2, newProduct.carousel3].filter(Boolean);
      const dataToSend = {
        ...newProduct,
        price: Number(newProduct.price),
        discount: Number(newProduct.discount) || 0,
        carousel
      };
      
      await api.createProduct(dataToSend);
      triggerAlert("Product created successfully!");
      
      // Reset form
      setNewProduct({
        title: "",
        description: "",
        mainImg: "",
        carousel1: "",
        carousel2: "",
        carousel3: "",
        sizes: ["S", "M", "L", "XL"],
        category: "Fashion",
        gender: "Unisex",
        price: "",
        discount: ""
      });
      
      // Refresh lists
      fetchAdminData();
    } catch (err) {
      triggerAlert(err.message || "Failed to add product");
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const carousel = [editingProduct.carousel1, editingProduct.carousel2, editingProduct.carousel3].filter(Boolean);
      const dataToSend = {
        ...editingProduct,
        price: Number(editingProduct.price),
        discount: Number(editingProduct.discount) || 0,
        carousel
      };

      await api.updateProduct(editingProduct._id, dataToSend);
      triggerAlert("Product updated successfully!");
      setEditingProduct(null);
      fetchAdminData();
    } catch (err) {
      triggerAlert(err.message || "Failed to update product");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.deleteProduct(id);
        triggerAlert("Product deleted successfully!");
        fetchAdminData();
      } catch (err) {
        triggerAlert(err.message || "Failed to delete product");
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      triggerAlert(`Order status updated to "${newStatus}"!`);
      // Update locally
      setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
    } catch (err) {
      triggerAlert(err.message || "Failed to update order status");
    }
  };

  const triggerAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(""), 3000);
  };

  if (!user || user.usertype !== "Admin") {
    return (
      <div style={{ textAlign: "center", padding: "5rem" }}>
        <h2>Unauthorized Access</h2>
        <p style={{ color: "var(--text-muted)" }}>Admin credentials are required to view this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container" style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: "2rem" }}>Admin Workspace</h1>
          <p style={{ color: "var(--text-muted)" }}>Configure layout, stock items, and process orders.</p>
        </div>

        {/* Dashboard inner navigation */}
        <div className="admin-nav">
          <div className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => { setActiveTab("dashboard"); setEditingProduct(null); }}>
            Overview
          </div>
          <div className={`admin-nav-item ${activeTab === "products" ? "active" : ""}`} onClick={() => { setActiveTab("products"); setEditingProduct(null); }}>
            All Products ({products.length})
          </div>
          <div className={`admin-nav-item ${activeTab === "orders" ? "active" : ""}`} onClick={() => { setActiveTab("orders"); setEditingProduct(null); }}>
            All Orders ({orders.length})
          </div>
          <div className={`admin-nav-item ${activeTab === "new-product" ? "active" : ""}`} onClick={() => { setActiveTab("new-product"); setEditingProduct(null); }}>
            Add Product
          </div>
        </div>
      </div>

      {alertMsg && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem 1.25rem",
          borderRadius: "var(--radius-sm)",
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          color: "var(--success)",
          border: "1px solid var(--success)",
          marginBottom: "1.5rem",
          fontWeight: "600",
          fontSize: "0.95rem"
        }}>
          <CheckCircle2 size={16} />
          <span>{alertMsg}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <h3>Loading dashboard analytics...</h3>
        </div>
      ) : (
        <>
          {/* Main Overview Tab */}
          {activeTab === "dashboard" && (
            <div>
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("dashboard")}>
                  <div className="stat-icon"><Users size={24} /></div>
                  <div className="stat-info">
                    <h3>Total Users</h3>
                    <p>{stats.totalUsers}</p>
                  </div>
                </div>

                <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("products")}>
                  <div className="stat-icon" style={{ background: "rgba(236, 72, 153, 0.15)", color: "var(--secondary)" }}><ShoppingBag size={24} /></div>
                  <div className="stat-info">
                    <h3>All Products</h3>
                    <p>{stats.totalProducts}</p>
                  </div>
                </div>

                <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("orders")}>
                  <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--success)" }}><CreditCard size={24} /></div>
                  <div className="stat-info">
                    <h3>All Orders</h3>
                    <p>{stats.totalOrders}</p>
                  </div>
                </div>
              </div>

              {/* Banner Configuration Panel */}
              <div className="admin-content-section">
                <h2 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><Image size={20} /> Update Banner</h2>
                <form onSubmit={handleUpdateConfig}>
                  <div className="form-group">
                    <label htmlFor="banner">Banner Image URL</label>
                    <input
                      type="url"
                      id="banner"
                      className="form-control"
                      value={banner}
                      onChange={(e) => setBanner(e.target.value)}
                      placeholder="Enter banner image URL link"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="categories">Categories (comma-separated list)</label>
                    <input
                      type="text"
                      id="categories"
                      className="form-control"
                      value={categoriesStr}
                      onChange={(e) => setCategoriesStr(e.target.value)}
                      placeholder="e.g. Fashion, Electronics, Mobiles, Groceries"
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">Update Configs</button>
                </form>
              </div>
            </div>
          )}

          {/* All Products Tab */}
          {activeTab === "products" && !editingProduct && (
            <div className="admin-content-section" style={{ overflowX: "auto" }}>
              <h2 style={{ marginBottom: "1rem" }}>Inventory Catalog</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Title</th>
                    <th>Category</th>
                    <th>Gender</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Sizes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(prod => (
                    <tr key={prod._id}>
                      <td><img src={prod.mainImg} alt="" style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "4px" }} /></td>
                      <td style={{ fontWeight: "700" }}>{prod.title}</td>
                      <td>{prod.category}</td>
                      <td>{prod.gender}</td>
                      <td>₹{prod.price}</td>
                      <td>{prod.discount}%</td>
                      <td>{(prod.sizes || []).join(", ")}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                            onClick={() => setEditingProduct({
                              ...prod,
                              carousel1: prod.carousel && prod.carousel[0] ? prod.carousel[0] : "",
                              carousel2: prod.carousel && prod.carousel[1] ? prod.carousel[1] : "",
                              carousel3: prod.carousel && prod.carousel[2] ? prod.carousel[2] : ""
                            })}
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                            onClick={() => handleDeleteProduct(prod._id)}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Edit Product Sub-View */}
          {editingProduct && (
            <div className="admin-content-section">
              <h2 style={{ marginBottom: "1rem" }}>Edit Product: {editingProduct.title}</h2>
              <form onSubmit={handleUpdateProduct}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  <div>
                    <div className="form-group">
                      <label>Product Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingProduct.title}
                        onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Product Description</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Main Image Thumbnail URL</label>
                      <input
                        type="url"
                        className="form-control"
                        value={editingProduct.mainImg}
                        onChange={(e) => setEditingProduct({ ...editingProduct, mainImg: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          className="form-control"
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        >
                          {categoriesStr.split(",").map(c => c.trim()).filter(Boolean).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Gender Category</label>
                        <select
                          className="form-control"
                          value={editingProduct.gender}
                          onChange={(e) => setEditingProduct({ ...editingProduct, gender: e.target.value })}
                        >
                          <option value="Men">Men</option>
                          <option value="Women">Women</option>
                          <option value="Unisex">Unisex</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div className="form-group">
                        <label>Original Price (₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Discount Percentage (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editingProduct.discount}
                          onChange={(e) => setEditingProduct({ ...editingProduct, discount: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Carousel Image URLs (Optional)</label>
                      <input
                        type="url"
                        className="form-control"
                        style={{ marginBottom: "0.5rem" }}
                        placeholder="Image URL 1"
                        value={editingProduct.carousel1}
                        onChange={(e) => setEditingProduct({ ...editingProduct, carousel1: e.target.value })}
                      />
                      <input
                        type="url"
                        className="form-control"
                        style={{ marginBottom: "0.5rem" }}
                        placeholder="Image URL 2"
                        value={editingProduct.carousel2}
                        onChange={(e) => setEditingProduct({ ...editingProduct, carousel2: e.target.value })}
                      />
                      <input
                        type="url"
                        className="form-control"
                        placeholder="Image URL 3"
                        value={editingProduct.carousel3}
                        onChange={(e) => setEditingProduct({ ...editingProduct, carousel3: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingProduct(null)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* All Orders Tab */}
          {activeTab === "orders" && (
            <div className="admin-content-section" style={{ overflowX: "auto" }}>
              <h2 style={{ marginBottom: "1rem" }}>Customer Purchases</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order Details</th>
                    <th>Customer Info</th>
                    <th>Destination</th>
                    <th>Product</th>
                    <th>Price Summary</th>
                    <th>Order Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const finalItemPrice = Math.round(order.price * (1 - order.discount / 100));
                    const totalPayable = finalItemPrice * (order.quantity || 1);
                    return (
                      <tr key={order._id}>
                        <td>
                          <div style={{ fontSize: "0.8rem", fontWeight: "700" }}>ID: {order._id}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Date: {order.orderDate}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: "700" }}>{order.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{order.email}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{order.mobile}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: "0.8rem" }}>{order.address}</div>
                          <div style={{ fontSize: "0.8rem", fontWeight: "700" }}>Pin: {order.pincode}</div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <img src={order.mainImg} alt="" style={{ width: "35px", height: "35px", objectFit: "cover", borderRadius: "4px" }} />
                            <div>
                              <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>{order.title}</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Size: {order.size} • Qty: {order.quantity}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: "700" }}>₹{totalPayable}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{order.paymentMethod}</div>
                        </td>
                        <td>
                          <span className={`order-status-badge ${
                            order.orderStatus === "order placed" ? "placed" :
                            order.orderStatus === "in transit" ? "transit" :
                            order.orderStatus === "delivered" ? "delivered" : "cancelled"
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td>
                          {order.orderStatus !== "cancelled" ? (
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                              <select
                                className="form-control"
                                style={{ padding: "0.3rem", fontSize: "0.8rem", width: "110px" }}
                                value={order.orderStatus}
                                onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                              >
                                <option value="order placed">Placed</option>
                                <option value="in transit">In Transit</option>
                                <option value="delivered">Delivered</option>
                              </select>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.2)" }}
                                onClick={() => handleUpdateOrderStatus(order._id, "cancelled")}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>None</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Product Tab */}
          {activeTab === "new-product" && (
            <div className="admin-content-section">
              <h2 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><Plus size={22} /> Add New Stock Item</h2>
              <form onSubmit={handleCreateProduct}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                  <div>
                    <div className="form-group">
                      <label htmlFor="new-title">Product Title / Name</label>
                      <input
                        type="text"
                        id="new-title"
                        className="form-control"
                        value={newProduct.title}
                        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                        placeholder="e.g. Leather jacket, Smartwatch"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="new-desc">Product Description</label>
                      <textarea
                        id="new-desc"
                        className="form-control"
                        rows="4"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Detailed details, product material, warranty, etc."
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="new-mainImg">Main Image URL</label>
                      <input
                        type="url"
                        id="new-mainImg"
                        className="form-control"
                        value={newProduct.mainImg}
                        onChange={(e) => setNewProduct({ ...newProduct, mainImg: e.target.value })}
                        placeholder="Enter direct photo image URL link"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div className="form-group">
                        <label htmlFor="new-category">Category</label>
                        <select
                          id="new-category"
                          className="form-control"
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        >
                          {categoriesStr.split(",").map(c => c.trim()).filter(Boolean).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="new-gender">Gender Type</label>
                        <select
                          id="new-gender"
                          className="form-control"
                          value={newProduct.gender}
                          onChange={(e) => setNewProduct({ ...newProduct, gender: e.target.value })}
                        >
                          <option value="Men">Men</option>
                          <option value="Women">Women</option>
                          <option value="Unisex">Unisex</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div className="form-group">
                        <label htmlFor="new-price">Retail Price (₹)</label>
                        <input
                          type="number"
                          id="new-price"
                          className="form-control"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          placeholder="Original price"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="new-discount">Discount Percentage (%)</label>
                        <input
                          type="number"
                          id="new-discount"
                          className="form-control"
                          value={newProduct.discount}
                          onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                          placeholder="e.g. 15 for 15% off"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Carousel Image URLs (Optional)</label>
                      <input
                        type="url"
                        className="form-control"
                        style={{ marginBottom: "0.5rem" }}
                        placeholder="Carousel Photo URL 1"
                        value={newProduct.carousel1}
                        onChange={(e) => setNewProduct({ ...newProduct, carousel1: e.target.value })}
                      />
                      <input
                        type="url"
                        className="form-control"
                        style={{ marginBottom: "0.5rem" }}
                        placeholder="Carousel Photo URL 2"
                        value={newProduct.carousel2}
                        onChange={(e) => setNewProduct({ ...newProduct, carousel2: e.target.value })}
                      />
                      <input
                        type="url"
                        className="form-control"
                        placeholder="Carousel Photo URL 3"
                        value={newProduct.carousel3}
                        onChange={(e) => setNewProduct({ ...newProduct, carousel3: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem", padding: "0.8rem 2rem" }}>
                  Add Product
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
