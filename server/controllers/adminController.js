import { Admin, User, Product, Orders } from "../models/Schema.js";

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070";
const DEFAULT_CATEGORIES = ["Fashion", "Electronics", "Mobiles", "Groceries", "Sports Equipments"];

export const getConfig = async (req, res) => {
  try {
    let config = await Admin.findOne();
    if (!config) {
      config = new Admin({
        banner: DEFAULT_BANNER,
        categories: DEFAULT_CATEGORIES
      });
      await config.save();
    }
    res.status(200).json(config);
  } catch (error) {
    console.error("Get Config Error:", error);
    res.status(500).json({ message: "Server error fetching configurations" });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const { banner, categories } = req.body;
    let config = await Admin.findOne();
    if (!config) {
      config = new Admin({
        banner: banner || DEFAULT_BANNER,
        categories: categories || DEFAULT_CATEGORIES
      });
    } else {
      if (banner !== undefined) config.banner = banner;
      if (categories !== undefined) config.categories = categories;
    }
    await config.save();
    res.status(200).json({ message: "Configuration updated successfully", config });
  } catch (error) {
    console.error("Update Config Error:", error);
    res.status(500).json({ message: "Server error updating configurations" });
  }
};

export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      User.countDocuments({ usertype: "Customer" }),
      Product.countDocuments(),
      Orders.countDocuments()
    ]);

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders
    });
  } catch (error) {
    console.error("Get Stats Error:", error);
    res.status(500).json({ message: "Server error fetching stats" });
  }
};
