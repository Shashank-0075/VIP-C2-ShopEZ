import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User as UserIcon, LogOut, Search, Settings, ShieldAlert, Plus, Layers, Package, TrendingUp, X } from "lucide-react";
import { api } from "./api.js";

// Page Imports
import CatalogPage from "./pages/CatalogPage.jsx";
import ProductDetailsPage from "./pages/ProductDetailsPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

function AppContent() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const stored = localStorage.getItem("shopez_search_history");
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUserAndCart();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".history-dropdown-container")) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setShowHistory(false);
  }, [location.pathname]);

  // Set theme based on user type (Admin gets dark dashboard theme)
  useEffect(() => {
    if (user && user.usertype === "Admin" && location.pathname.startsWith("/admin")) {
      document.body.classList.add("admin-theme");
    } else {
      document.body.classList.remove("admin-theme");
    }
  }, [user, location.pathname]);

  const fetchUserAndCart = async () => {
    const token = localStorage.getItem("shopez_token");
    if (token) {
      try {
        const userData = await api.getMe();
        setUser(userData.user);
        
        if (userData.user.usertype === "Customer") {
          const cartData = await api.getCart();
          setCart(cartData);
        }
      } catch (error) {
        console.error("Session expired:", error);
        handleLogout();
      }
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("shopez_token");
    setUser(null);
    setCart([]);
    document.body.classList.remove("admin-theme");
    navigate("/login");
  };

  const updateCartCount = async () => {
    if (user && user.usertype === "Customer") {
      try {
        const cartData = await api.getCart();
        setCart(cartData);
      } catch (err) {
        console.error("Error refreshing cart count", err);
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    navigate("/");
    setShowHistory(false);
  };

  const clearHistory = (e) => {
    e.stopPropagation();
    setSearchHistory([]);
    localStorage.removeItem("shopez_search_history");
  };

  const handleHistoryItemClick = (query) => {
    setSearchQuery(query);
    const updatedHistory = [
      query,
      ...searchHistory.filter(q => q.toLowerCase() !== query.toLowerCase())
    ].slice(0, 5);
    setSearchHistory(updatedHistory);
    localStorage.setItem("shopez_search_history", JSON.stringify(updatedHistory));
    navigate(`/?search=${encodeURIComponent(query)}`);
    setShowHistory(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      const updatedHistory = [
        query,
        ...searchHistory.filter(q => q.toLowerCase() !== query.toLowerCase())
      ].slice(0, 5);
      setSearchHistory(updatedHistory);
      localStorage.setItem("shopez_search_history", JSON.stringify(updatedHistory));
      navigate(`/?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/");
    }
    setShowHistory(false);
  };

  // Compute total items in cart
  const cartItemCount = cart.reduce((total, item) => total + parseInt(item.quantity || 1), 0);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h2 style={{ fontFamily: "Outfit, sans-serif" }}>Loading ShopEZ...</h2>
      </div>
    );
  }

  const isAdminView = user && user.usertype === "Admin" && location.pathname.startsWith("/admin");

  return (
    <div>
      {/* Navigation Header */}
      <header className="header glass">
        <div className="logo-container" onClick={() => navigate(user && user.usertype === "Admin" ? "/admin" : "/")}>
          {isAdminView ? "ShopEZ (admin)" : "ShopEZ"}
        </div>

        {/* Search Bar - hidden for admins and on auth pages */}
        {!isAdminView && !["/login", "/register"].includes(location.pathname) && (
          <div className="history-dropdown-container" style={{ position: "relative", flex: "0 1 500px" }}>
            <form 
              className="search-bar" 
              onSubmit={handleSearchSubmit}
              style={{ display: "flex", alignItems: "center", width: "100%" }}
            >
              <Search size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search Electronics, Fashion, Mobiles, Groceries..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowHistory(true);
                }}
                onFocus={() => setShowHistory(true)}
                style={{ flexGrow: 1 }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    color: "var(--text-muted)",
                    borderRadius: "50%",
                    transition: "background-color var(--transition-fast)",
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-app)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <X size={16} />
                </button>
              )}
            </form>

            {/* Search History Dropdown */}
            {showHistory && searchHistory.length > 0 && (
              <div 
                className="glass"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: "0.5rem",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 200,
                  overflow: "hidden",
                  padding: "0.5rem 0",
                  animation: "fadeIn 0.2s ease-out",
                  border: "1px solid var(--border-color)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 1rem 0.5rem", borderBottom: "1px solid var(--border-color)", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>
                  <span>RECENT SEARCHES</span>
                  <button 
                    onClick={clearHistory}
                    style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "600", cursor: "pointer", fontSize: "0.75rem", padding: 0 }}
                  >
                    Clear
                  </button>
                </div>
                {searchHistory.map((query, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleHistoryItemClick(query)}
                    style={{
                      padding: "0.6rem 1rem",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      color: "var(--text-main)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      transition: "background-color var(--transition-fast)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-app)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <Search size={14} color="var(--text-muted)" />
                    <span>{query}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="nav-actions">
          {user ? (
            <>
              {user.usertype === "Admin" ? (
                <>
                  <Link to="/admin" className="nav-item">
                    <Settings size={18} />
                    <span>Dashboard</span>
                  </Link>
                  <span className="nav-item" style={{ cursor: "default", color: "var(--primary)" }}>
                    <ShieldAlert size={18} />
                    <span>Admin: {user.username}</span>
                  </span>
                </>
              ) : (
                <>
                  <Link to="/" className="nav-item">
                    <span>Shop</span>
                  </Link>
                  <Link to="/profile" className="nav-item">
                    <UserIcon size={18} />
                    <span>{user.username}</span>
                  </Link>
                  <Link to="/cart" className="nav-item">
                    <ShoppingCart size={18} />
                    {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
                    <span>Cart</span>
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="nav-item"
                style={{ background: "none", border: "none", font: "inherit", cursor: "pointer" }}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-item">
                <span>Shop</span>
              </Link>
              <Link to="/login">
                <button className="btn btn-primary" style={{ padding: "0.4rem 1.2rem", borderRadius: "20px" }}>
                  Login
                </button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Pages Container */}
      <main>
        <Routes>
          <Route path="/" element={<CatalogPage user={user} />} />
          <Route path="/product/:id" element={<ProductDetailsPage user={user} updateCartCount={updateCartCount} />} />
          <Route path="/cart" element={<CartPage user={user} cart={cart} refreshCart={updateCartCount} />} />
          <Route path="/checkout" element={<CheckoutPage user={user} cart={cart} refreshCart={updateCartCount} />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
          <Route path="/admin/*" element={<AdminDashboard user={user} />} />
          <Route path="/login" element={<LoginPage onAuthSuccess={fetchUserAndCart} />} />
          <Route path="/register" element={<RegisterPage onAuthSuccess={fetchUserAndCart} />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
