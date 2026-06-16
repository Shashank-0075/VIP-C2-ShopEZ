import { Orders, Cart } from "../models/Schema.js";

export const getOrders = async (req, res) => {
  try {
    let query = {};
    if (req.user.usertype !== "Admin") {
      query.userId = req.user._id.toString();
    }
    const orders = await Orders.find(query).sort({ _id: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ message: "Server error fetching orders" });
  }
};

export const placeOrder = async (req, res) => {
  try {
    const { name, email, mobile, address, pincode, paymentMethod, items } = req.body;
    const userId = req.user._id.toString();

    if (!name || !email || !mobile || !address || !pincode || !paymentMethod || !items || items.length === 0) {
      return res.status(400).json({ message: "All checkout details and items are required" });
    }

    const orderDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const deliveryDateObj = new Date();
    deliveryDateObj.setDate(deliveryDateObj.getDate() + 5);
    const deliveryDate = deliveryDateObj.toISOString().split("T")[0];

    const orderPromises = items.map(item => {
      const newOrder = new Orders({
        userId,
        name,
        email,
        mobile,
        address,
        pincode,
        title: item.title,
        description: item.description || "",
        mainImg: item.mainImg || "",
        size: item.size,
        quantity: Number(item.quantity),
        price: Number(item.price),
        discount: Number(item.discount) || 0,
        paymentMethod,
        orderDate,
        deliveryDate,
        orderStatus: "order placed"
      });
      return newOrder.save();
    });

    await Promise.all(orderPromises);

    // Clear cart for this user
    await Cart.deleteMany({ userId });

    res.status(201).json({ message: "Order placed successfully" });
  } catch (error) {
    console.error("Place Order Error:", error);
    res.status(500).json({ message: "Server error placing order" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Orders.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = orderStatus;
    // If order is cancelled, set deliveryDate to empty or cancel
    await order.save();
    res.status(200).json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ message: "Server error updating order status" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Orders.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify ownership if not admin
    if (req.user.usertype !== "Admin" && order.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. Cannot cancel this order" });
    }

    order.orderStatus = "cancelled";
    await order.save();
    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ message: "Server error cancelling order" });
  }
};
