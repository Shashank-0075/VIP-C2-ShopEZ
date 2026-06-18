import dns from "dns";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { seedDatabase } from "./models/localDb.js";
import bcrypt from "bcryptjs";
import { User } from "./models/Schema.js";

// Global DNS configuration to bypass corporate DNS block on MongoDB Atlas hostnames
// Commented out because this custom lookup breaks the dns.lookup API contract (e.g. for options.all) and causes MongoDB connection failures.
/*
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
  let actualOptions = options;
  let actualCallback = callback;
  if (typeof options === "function") {
    actualCallback = options;
    actualOptions = {};
  }
  if (hostname && hostname.includes("mongodb.net")) {
    dns.resolve4(hostname, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        return originalLookup(hostname, actualOptions, actualCallback);
      }
      return actualCallback(null, addresses[0], 4);
    });
  } else {
    return originalLookup(hostname, actualOptions, actualCallback);
  }
};
*/

// Initialize fallback flag
global.USE_LOCAL_DB = false;

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Initialize dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" });
});

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ message: "Something went wrong on the server", error: err.message });
});

// Database Connection
const MongoUri = process.env.MONGO_URI || process.env.DRIVER_LINK;

if (!MongoUri) {
  console.error("WARNING: No MongoDB connection string found in MONGO_URI or DRIVER_LINK. Please check your .env file.");
}

const seedMongoDatabase = async () => {
  try {
    const adminEmail = "admin@shopez.com";
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      console.log(`Seeding default admin user (${adminEmail}) to MongoDB Atlas...`);
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const newAdmin = new User({
        username: "Admin Shashank",
        email: adminEmail,
        password: hashedPassword,
        usertype: "Admin"
      });
      await newAdmin.save();
      console.log("Seeding completed.");
    }
    
    // Also ensure admin@ex.com is accessible with admin123
    const existingExAdmin = await User.findOne({ email: "admin@ex.com" });
    if (existingExAdmin) {
      const isExMatch = await bcrypt.compare("admin123", existingExAdmin.password);
      if (!isExMatch) {
        console.log("Updating admin@ex.com password to admin123...");
        const hashedEx = await bcrypt.hash("admin123", 10);
        existingExAdmin.password = hashedEx;
        await existingExAdmin.save();
      }
    }
  } catch (err) {
    console.error("Failed to seed MongoDB Atlas database:", err.message);
  }
};

const connectToMongo = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(MongoUri, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s
    });
    console.log("Connected to your MongoDB database successfully");
    global.USE_LOCAL_DB = false;
    await seedMongoDatabase();
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    console.log("--------------------------------------------------");
    console.log("FALLING BACK TO LOCAL FILE-BASED JSON DATABASE!");
    console.log("--------------------------------------------------");
    global.USE_LOCAL_DB = true;
    seedDatabase();
  }
};

// Start Server
app.listen(PORT, () => {
  console.log(`App server is running on port ${PORT}`);
  if (MongoUri) {
    connectToMongo();
  } else {
    console.log("No MongoDB connection string found. Using local JSON database.");
    global.USE_LOCAL_DB = true;
    seedDatabase();
  }
});
