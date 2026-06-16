import { Cart } from "../models/Schema.js";

export const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.user._id.toString() });
    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({ message: "Server error fetching cart" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { title, description, mainImg, size, quantity, price, discount } = req.body;
    const userId = req.user._id.toString();

    if (!title || !size || !quantity || price === undefined) {
      return res.status(400).json({ message: "Missing required cart fields" });
    }

    // Check if item with same title and size already exists in user's cart
    const existingItem = await Cart.findOne({ userId, title, size });
    if (existingItem) {
      // Increment quantity
      const newQty = parseInt(existingItem.quantity) + parseInt(quantity);
      existingItem.quantity = newQty.toString();
      await existingItem.save();
      return res.status(200).json({ message: "Cart item updated", cartItem: existingItem });
    }

    const newCartItem = new Cart({
      userId,
      title,
      description: description || "",
      mainImg: mainImg || "",
      size,
      quantity: quantity.toString(),
      price: Number(price),
      discount: Number(discount) || 0
    });

    await newCartItem.save();
    res.status(201).json({ message: "Added to cart successfully", cartItem: newCartItem });
  } catch (error) {
    console.error("Add To Cart Error:", error);
    res.status(500).json({ message: "Server error adding to cart" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const cartItem = await Cart.findOneAndDelete({ _id: req.params.id, userId });
    
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Remove From Cart Error:", error);
    res.status(500).json({ message: "Server error removing from cart" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    await Cart.deleteMany({ userId });
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    res.status(500).json({ message: "Server error clearing cart" });
  }
};
