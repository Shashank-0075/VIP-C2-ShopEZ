import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Filter, Star, Shirt, Laptop, Smartphone, Apple, Trophy } from "lucide-react";
import { api } from "../api.js";

export default function CatalogPage({ user }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bannerUrl, setBannerUrl] = useState("https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070");
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [sortOption, setSortOption] = useState("Popularity");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [searchParams] = useSearchParams();
  const searchVal = searchParams.get("search") || "";
  const navigate = useNavigate();

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchVal, selectedCategories, selectedGenders, sortOption, minPrice, maxPrice]);

  const fetchConfig = async () => {
    try {
      const config = await api.getAdminConfig();
      if (config) {
        setCategories(config.categories || []);
        if (config.banner) setBannerUrl(config.banner);
      }
    } catch (err) {
      console.error("Failed to load admin config:", err);
      // Fallback defaults
      setCategories(["Fashion", "Electronics", "Mobiles", "Groceries", "Sports Equipments"]);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({
        search: searchVal,
        category: selectedCategories,
        gender: selectedGenders,
        sort: sortOption,
        minPrice,
        maxPrice,
      });
      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
    setLoading(false);
  };

  const handleCategoryCheckboxChange = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleGenderCheckboxChange = (gen) => {
    if (selectedGenders.includes(gen)) {
      setSelectedGenders(selectedGenders.filter((g) => g !== gen));
    } else {
      setSelectedGenders([...selectedGenders, gen]);
    }
  };

  const selectSingleCategoryOnly = (cat) => {
    if (selectedCategories.length === 1 && selectedCategories[0] === cat) {
      setSelectedCategories([]); // Clear if clicked again
    } else {
      setSelectedCategories([cat]);
    }
  };

  // Helper icons for categories strip
  const getCategoryIcon = (cat, size = 24) => {
    const lower = cat.toLowerCase();
    if (lower.includes("fashion")) return <Shirt size={size} />;
    if (lower.includes("elect")) return <Laptop size={size} />;
    if (lower.includes("mobile")) return <Smartphone size={size} />;
    if (lower.includes("groc")) return <Apple size={size} />;
    if (lower.includes("sport")) return <Trophy size={size} />;
    return <Filter size={size} />;
  };

  const getCategoryClassSuffix = (cat) => {
    const lower = cat.toLowerCase();
    if (lower.includes("fashion")) return "fashion";
    if (lower.includes("elect")) return "electronics";
    if (lower.includes("mobile")) return "mobiles";
    if (lower.includes("groc")) return "groceries";
    if (lower.includes("sport")) return "sports";
    return "default";
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      {/* Banner */}
      <div className="hero-banner">
        <img src={bannerUrl} alt="ShopEZ Super Sale Banner" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070"; }} />
        <div className="hero-overlay">
          <h1>Mega Discount Extravaganza</h1>
          <p>Get up to 50% Off on top brands. Discover premium quality fashion, cutting-edge electronics, and daily essentials with ShopEZ.</p>
          <div>
            <button className="btn btn-primary" onClick={() => {
              const fashionSec = categories.find(c => c.toLowerCase().includes("fashion"));
              if (fashionSec) selectSingleCategoryOnly(fashionSec);
            }}>Shop Now</button>
          </div>
        </div>
      </div>

      {/* Categories Strip */}
      <div className="categories-strip">
        {categories.map((cat, idx) => {
          const isActive = selectedCategories.includes(cat);
          const classSuffix = getCategoryClassSuffix(cat);
          return (
            <div
              key={idx}
              className={`category-pill ${isActive ? "active" : ""}`}
              onClick={() => selectSingleCategoryOnly(cat)}
            >
              <div className={`category-icon cat-${classSuffix}`}>
                {getCategoryIcon(cat, 22)}
              </div>
              <span>{cat}</span>
            </div>
          );
        })}
      </div>

      {/* Main Catalog Section */}
      <div className="catalog-container">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Filters</h3>
            <button
              onClick={() => {
                setSelectedCategories([]);
                setSelectedGenders([]);
                setSortOption("Popularity");
                setMinPrice("");
                setMaxPrice("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer",
                padding: "0",
                textDecoration: "underline"
              }}
            >
              Clear All
            </button>
          </div>

          <div className="filter-section">
            <h3 className="filter-title">
              <span>Sort By</span>
            </h3>
            {["Popularity", "Price (low to high)", "Price (high to low)", "Discount"].map((opt) => (
              <label key={opt} className="filter-option">
                <input
                  type="radio"
                  name="sort"
                  checked={sortOption === opt}
                  onChange={() => setSortOption(opt)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>

          <div className="filter-section">
            <h3 className="filter-title">
              <span>Categories</span>
            </h3>
            {categories.map((cat) => (
              <label key={cat} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => handleCategoryCheckboxChange(cat)}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>

          <div className="filter-section">
            <h3 className="filter-title">
              <span>Gender</span>
            </h3>
            {["Men", "Women", "Unisex"].map((gen) => (
              <label key={gen} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedGenders.includes(gen)}
                  onChange={() => handleGenderCheckboxChange(gen)}
                />
                <span>{gen}</span>
              </label>
            ))}
          </div>

          <div className="filter-section">
            <h3 className="filter-title">
              <span>Price Range</span>
            </h3>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--border-color)",
                  backgroundColor: "var(--bg-app)",
                  color: "var(--text-main)",
                  outline: "none",
                  fontSize: "0.85rem",
                  transition: "all var(--transition-fast)"
                }}
              />
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--border-color)",
                  backgroundColor: "var(--bg-app)",
                  color: "var(--text-main)",
                  outline: "none",
                  fontSize: "0.85rem",
                  transition: "all var(--transition-fast)"
                }}
              />
            </div>
          </div>
        </aside>

        {/* Products Grid Column */}
        <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {searchVal && (
            <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-muted)" }}>
              Search results for: "<span style={{ color: "var(--primary)" }}>{searchVal}</span>" ({products.length} items found)
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <h3 style={{ color: "var(--text-muted)" }}>Loading Products...</h3>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "var(--bg-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>No Products Found</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                We couldn't find any products matching your filters or search keywords.
              </p>
              {user && user.usertype === "Admin" ? (
                <button className="btn btn-primary" onClick={() => navigate("/admin/new-product")}>
                  Add First Product
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={() => {
                  setSelectedCategories([]);
                  setSelectedGenders([]);
                  setSortOption("Popularity");
                  navigate("/");
                }}>
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="products-grid">
              {products.map((prod) => {
                const finalPrice = Math.round(prod.price * (1 - prod.discount / 100));
                return (
                  <div key={prod._id} className="product-card">
                    <img className="product-card-img" src={prod.mainImg} alt={prod.title} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400"; }} />
                    <div className="product-card-body">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                        <span style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--primary)", fontWeight: "800" }}>{prod.category}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.15rem", color: "var(--warning)", fontSize: "0.75rem", fontWeight: "700" }}>
                          <Star size={12} fill="currentColor" />
                          <span>4.2</span>
                        </div>
                      </div>
                      <h3 className="product-card-title">{prod.title}</h3>
                      <p className="product-card-desc">{prod.description}</p>
                      
                      <div className="price-row">
                        <span className="price-current">₹{finalPrice}</span>
                        {prod.discount > 0 && (
                          <>
                            <span className="price-original">₹{prod.price}</span>
                            <span className="discount-badge">{prod.discount}% OFF</span>
                          </>
                        )}
                      </div>

                      <button
                        className="btn btn-primary"
                        style={{ width: "100%", padding: "0.6rem" }}
                        onClick={() => navigate(`/product/${prod._id}`)}
                      >
                        Shop Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
