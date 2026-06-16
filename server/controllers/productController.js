import { Product } from "../models/Schema.js";

export const getProducts = async (req, res) => {
  try {
    const { category, gender, sort, search, minPrice, maxPrice } = req.query;
    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { gender: { $regex: search, $options: "i" } }
      ];
    }

    // Category filter (support comma-separated categories, case-insensitive)
    if (category) {
      const categoryList = category.split(",");
      const regexList = categoryList.map(c => new RegExp(`^${c.trim()}$`, "i"));
      query.category = { $in: regexList };
    }

    // Gender filter (support comma-separated genders, case-insensitive)
    if (gender) {
      const genderList = gender.split(",");
      const regexList = genderList.map(g => new RegExp(`^${g.trim()}$`, "i"));
      query.gender = { $in: regexList };
    }

    // Price range filter
    if (minPrice !== undefined && minPrice !== "" || maxPrice !== undefined && maxPrice !== "") {
      query.price = {};
      if (minPrice !== undefined && minPrice !== "") {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== "") {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Sorting
    let sortOption = {};
    if (sort) {
      if (sort === "Price (low to high)") {
        sortOption.price = 1;
      } else if (sort === "Price (high to low)") {
        sortOption.price = -1;
      } else if (sort === "Discount") {
        sortOption.discount = -1;
      } else {
        // "Popularity" or others
        sortOption._id = -1;
      }
    } else {
      sortOption._id = -1; // Default newest first
    }

    const products = await Product.find(query).sort(sortOption);
    res.status(200).json(products);
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ message: "Server error fetching products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Get Product Details Error:", error);
    res.status(500).json({ message: "Server error fetching product details" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { title, description, mainImg, carousel, sizes, category, gender, price, discount } = req.body;

    if (!title || !description || !mainImg || !price || !category || !gender) {
      return res.status(400).json({ message: "Missing required product fields" });
    }

    const newProduct = new Product({
      title,
      description,
      mainImg,
      carousel: carousel || [],
      sizes: sizes || [],
      category,
      gender,
      price: Number(price),
      discount: Number(discount) || 0
    });

    await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: "Server error creating product" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { title, description, mainImg, carousel, sizes, category, gender, price, discount } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.title = title || product.title;
    product.description = description || product.description;
    product.mainImg = mainImg || product.mainImg;
    product.carousel = carousel || product.carousel;
    product.sizes = sizes || product.sizes;
    product.category = category || product.category;
    product.gender = gender || product.gender;
    product.price = price !== undefined ? Number(price) : product.price;
    product.discount = discount !== undefined ? Number(discount) : product.discount;

    await product.save();
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Server error updating product" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: "Server error deleting product" });
  }
};
