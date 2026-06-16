import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../api.js";

export default function ProductDetailsPage({ user, updateCartCount }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await api.getProductById(id);
      setProduct(data);
      if (data.mainImg) setActiveImg(data.mainImg);
      if (data.sizes && data.sizes.length > 0) {
        setSelectedSize(data.sizes[0]);
      }
    } catch (err) {
      console.error("Error loading product details:", err);
    }
    setLoading(false);
  };

  const handleAddToCart = async (redirectToCheck = false) => {
    if (!user) {
      navigate("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }

    if (user.usertype === "Admin") {
      setAlertMsg("Admins cannot purchase items.");
      setTimeout(() => setAlertMsg(""), 3000);
      return;
    }

    if (!selectedSize) {
      setAlertMsg("Please select a size first.");
      setTimeout(() => setAlertMsg(""), 3000);
      return;
    }

    setAddingToCart(true);
    try {
      await api.addToCart({
        title: product.title,
        description: product.description,
        mainImg: product.mainImg,
        size: selectedSize,
        quantity: quantity,
        price: product.price,
        discount: product.discount,
      });

      await updateCartCount();

      if (redirectToCheck) {
        navigate("/checkout");
      } else {
        setAlertMsg("Item successfully added to your cart!");
        setTimeout(() => setAlertMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setAlertMsg("Error adding item to cart.");
      setTimeout(() => setAlertMsg(""), 3000);
    }
    setAddingToCart(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "5rem" }}>
        <h3>Loading Product Details...</h3>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "5rem" }}>
        <h2>Product Not Found</h2>
        <button className="btn btn-secondary" onClick={() => navigate("/")} style={{ marginTop: "1rem" }}>
          <ArrowLeft size={16} /> Back to Shop
        </button>
      </div>
    );
  }

  const finalPrice = Math.round(product.price * (1 - product.discount / 100));
  const imagesList = [product.mainImg, ...(product.carousel || [])].filter(Boolean);

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ maxWidth: "1000px", margin: "1rem auto 0", padding: "0 2rem" }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="details-container">
        {/* Product Images Column */}
        <div className="details-gallery">
          <img className="gallery-main" src={activeImg} alt={product.title} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600"; }} />
          
          {imagesList.length > 1 && (
            <div className="gallery-thumbnails">
              {imagesList.map((img, idx) => (
                <img
                  key={idx}
                  className={`gallery-thumb ${activeImg === img ? "active" : ""}`}
                  src={img}
                  alt={`Thumbnail ${idx}`}
                  onClick={() => setActiveImg(img)}
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=100"; }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info Column */}
        <div className="details-info">
          <div className="details-category-gender">
            {product.gender} • {product.category}
          </div>
          <h1 className="details-title">{product.title}</h1>
          
          <div className="price-row" style={{ margin: "0.5rem 0 1.5rem" }}>
            <span className="price-current" style={{ fontSize: "1.85rem" }}>₹{finalPrice}</span>
            {product.discount > 0 && (
              <>
                <span className="price-original" style={{ fontSize: "1.2rem" }}>₹{product.price}</span>
                <span className="discount-badge" style={{ fontSize: "0.9rem" }}>{product.discount}% OFF</span>
              </>
            )}
          </div>

          <p className="details-desc">{product.description}</p>

          {/* Alert messages */}
          {alertMsg && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: alertMsg.includes("success") ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: alertMsg.includes("success") ? "var(--success)" : "var(--danger)",
              marginBottom: "1.5rem",
              fontSize: "0.9rem",
              fontWeight: "600",
              border: `1px solid ${alertMsg.includes("success") ? "var(--success)" : "var(--danger)"}`
            }}>
              {alertMsg.includes("success") && <CheckCircle2 size={16} />}
              <span>{alertMsg}</span>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div className="size-select-title">Select Size:</div>
              <div className="sizes-grid">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    className={`size-btn ${selectedSize === sz ? "active" : ""}`}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div style={{ marginBottom: "2rem" }}>
            <div className="size-select-title">Quantity:</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                className="qty-btn"
                style={{ width: "32px", height: "32px", fontSize: "1.2rem" }}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span className="qty-val" style={{ fontSize: "1.1rem", minWidth: "35px" }}>{quantity}</span>
              <button
                className="qty-btn"
                style={{ width: "32px", height: "32px", fontSize: "1.2rem" }}
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Purchase Actions */}
          <div className="details-actions">
            <button
              className="btn btn-secondary"
              style={{ display: "flex", gap: "0.5rem", padding: "1rem" }}
              onClick={() => handleAddToCart(false)}
              disabled={addingToCart}
            >
              <ShoppingBag size={18} />
              Add to Cart
            </button>
            <button
              className="btn btn-primary"
              style={{ padding: "1rem" }}
              onClick={() => handleAddToCart(true)}
              disabled={addingToCart}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
