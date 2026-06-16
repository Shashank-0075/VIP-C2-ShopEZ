import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Database storage directory
const DB_DIR = path.resolve(process.cwd());

const getFilePath = (collectionName) => {
  return path.join(DB_DIR, `db_${collectionName}.json`);
};

// Synchronous helper to read data
export const readData = (collectionName) => {
  const filePath = getFilePath(collectionName);
  if (!fs.existsSync(filePath)) {
    writeData(collectionName, []);
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw || "[]");
  } catch (err) {
    console.error(`Error reading database file for ${collectionName}:`, err);
    return [];
  }
};

// Synchronous helper to write data
export const writeData = (collectionName, data) => {
  const filePath = getFilePath(collectionName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error(`Error writing database file for ${collectionName}:`, err);
  }
};

// Seeding function
export const seedDatabase = () => {
  // 1. Seed Admin Config
  const adminConfig = readData("admin");
  if (adminConfig.length === 0) {
    writeData("admin", [
      {
        "_id": "admin_config_default",
        "banner": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070",
        "categories": ["Fashion", "Electronics", "Mobiles", "Groceries", "Sports Equipments"]
      }
    ]);
    console.log("Seeded default admin config.");
  }

  // 2. Seed Users
  const users = readData("users");
  if (users.length === 0) {
    const adminPasswordHash = bcrypt.hashSync("admin123", 10);
    const customerPasswordHash = bcrypt.hashSync("customer123", 10);
    writeData("users", [
      {
        "_id": "user_admin_default",
        "username": "Admin Shashank",
        "email": "admin@shopez.com",
        "password": adminPasswordHash,
        "usertype": "Admin"
      },
      {
        "_id": "user_customer_default",
        "username": "John Customer",
        "email": "customer@shopez.com",
        "password": customerPasswordHash,
        "usertype": "Customer"
      }
    ]);
    console.log("Seeded default admin and customer accounts.");
  }

  // 3. Seed Products
  const products = readData("products");
  if (products.length === 0) {
    writeData("products", [
      {
        "_id": "prod_fashion_1",
        "title": "Premium Slim-Fit Denim Jacket",
        "description": "Classic denim jacket crafted from organic cotton with a tailored, modern fit. Perfect for layering.",
        "mainImg": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600",
        "carousel": ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600"],
        "sizes": ["S", "M", "L", "XL"],
        "category": "Fashion",
        "gender": "Unisex",
        "price": 2499,
        "discount": 15
      },
      {
        "_id": "prod_fashion_2",
        "title": "Elegant Silk Evening Gown",
        "description": "Stunning floor-length dress made from 100% pure silk with a refined drape and beautiful flow.",
        "mainImg": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600",
        "carousel": ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600"],
        "sizes": ["S", "M", "L"],
        "category": "Fashion",
        "gender": "Women",
        "price": 4999,
        "discount": 20
      },
      {
        "_id": "prod_elec_1",
        "title": "AeroSound Pro ANC Headphones",
        "description": "Active noise-cancelling wireless headphones with 40-hour battery life and immersive acoustic sound.",
        "mainImg": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600",
        "carousel": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600"],
        "sizes": ["Standard"],
        "category": "Electronics",
        "gender": "Unisex",
        "price": 7999,
        "discount": 10
      },
      {
        "_id": "prod_elec_2",
        "title": "VividView 4K Smart Projector",
        "description": "Ultra-bright home theater projector supporting HDR10+, built-in Android TV, and dual Wi-Fi connectivity.",
        "mainImg": "https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=600",
        "carousel": ["https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=600"],
        "sizes": ["Standard"],
        "category": "Electronics",
        "gender": "Unisex",
        "price": 29999,
        "discount": 25
      },
      {
        "_id": "prod_mobile_1",
        "title": "Nexus 10 Ultra Smartphone",
        "description": "Flagship smartphone featuring a 200MP camera system, 120Hz AMOLED display, and supercharged performance.",
        "mainImg": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600",
        "carousel": ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600"],
        "sizes": ["256GB", "512GB"],
        "category": "Mobiles",
        "gender": "Unisex",
        "price": 64999,
        "discount": 12
      },
      {
        "_id": "prod_mobile_2",
        "title": "Horizon Flip Pro 5G",
        "description": "Next-generation foldable smartphone with custom zero-gap hinge, smart cover display, and premium armor shell.",
        "mainImg": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600",
        "carousel": ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600"],
        "sizes": ["256GB"],
        "category": "Mobiles",
        "gender": "Unisex",
        "price": 89999,
        "discount": 8
      },
      {
        "_id": "prod_groc_1",
        "title": "Organic Premium Cold-Pressed Olive Oil",
        "description": "Extra virgin olive oil sourced from organic handpicked olives in Tuscany, Italy. Rich in antioxidants.",
        "mainImg": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600",
        "carousel": ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600"],
        "sizes": ["500ml", "1L"],
        "category": "Groceries",
        "gender": "Unisex",
        "price": 1299,
        "discount": 5
      },
      {
        "_id": "prod_groc_2",
        "title": "Gourmet Exotic Fruit Selection Box",
        "description": "Premium assortment of hand-selected seasonal exotic fruits including dragon fruit, ripe mangoes, and passionfruit.",
        "mainImg": "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?q=80&w=600",
        "carousel": ["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?q=80&w=600"],
        "sizes": ["Medium Basket", "Large Basket"],
        "category": "Groceries",
        "gender": "Unisex",
        "price": 1599,
        "discount": 15
      },
      {
        "_id": "prod_sports_1",
        "title": "FitFlex Elite Kettlebell Set",
        "description": "Heavy-duty solid cast iron kettlebells with textured handle for a secure, comfortable grip during training.",
        "mainImg": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600",
        "carousel": ["https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600"],
        "sizes": ["12kg", "16kg", "20kg"],
        "category": "Sports Equipments",
        "gender": "Unisex",
        "price": 3499,
        "discount": 18
      },
      {
        "_id": "prod_sports_2",
        "title": "AeroCarbon Pro Tennis Racket",
        "description": "Ultra-lightweight carbon fiber structure engineered for explosive swings and extreme shot precision.",
        "mainImg": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600",
        "carousel": ["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600"],
        "sizes": ["G2 Grip", "G3 Grip"],
        "category": "Sports Equipments",
        "gender": "Unisex",
        "price": 9999,
        "discount": 20
      }
    ]);
    console.log("Seeded default premium products catalog.");
  }
};

// Chainable query helper to support Mongoose-like syntax: Model.find().sort().select()
class QueryChain {
  constructor(promise) {
    this.promise = promise;
  }

  sort(sortOption) {
    this.promise = this.promise.then(items => {
      if (!sortOption || !items) return items;
      return [...items].sort((a, b) => {
        for (const key of Object.keys(sortOption)) {
          const dir = sortOption[key];
          let valA = a[key];
          let valB = b[key];
          
          if (key === "_id") {
            valA = String(valA);
            valB = String(valB);
          }
          
          if (valA < valB) return -1 * dir;
          if (valA > valB) return 1 * dir;
        }
        return 0;
      });
    });
    return this;
  }

  select(selectOption) {
    this.promise = this.promise.then(items => {
      if (!items) return items;
      const selectFields = typeof selectOption === "string" ? selectOption.split(" ") : [];
      const isExclude = selectFields.every(f => f.startsWith("-"));
      
      const processItem = item => {
        if (!item) return item;
        const newItem = { ...item };
        if (isExclude) {
          selectFields.forEach(f => {
            const field = f.substring(1);
            delete newItem[field];
          });
        } else if (selectFields.length > 0) {
          const filtered = {};
          selectFields.forEach(f => {
            // Trim if there are + signs or space
            const cleaned = f.replace("+", "").trim();
            if (cleaned) {
              filtered[cleaned] = newItem[cleaned];
            }
          });
          return filtered;
        }
        return newItem;
      };

      if (Array.isArray(items)) {
        return items.map(processItem);
      }
      return processItem(items);
    });
    return this;
  }

  then(resolve, reject) {
    return this.promise.then(resolve, reject);
  }
}

// Database helper matching queries
const evaluateQuery = (item, query) => {
  for (const key of Object.keys(query)) {
    const queryVal = query[key];
    
    // Evaluate $or
    if (key === "$or") {
      const match = queryVal.some(cond => {
        return evaluateQuery(item, cond);
      });
      if (!match) return false;
      continue;
    }

    // Evaluate Mongoose/Mongo operators in query fields
    if (queryVal && typeof queryVal === "object" && !Array.isArray(queryVal) && !(queryVal instanceof RegExp)) {
      const itemVal = item[key];

      // Support $in
      if ("$in" in queryVal) {
        const list = queryVal.$in;
        if (!Array.isArray(list)) return false;
        const matched = list.some(target => {
          if (target instanceof RegExp) {
            return target.test(itemVal);
          }
          return String(target).toLowerCase() === String(itemVal).toLowerCase();
        });
        if (!matched) return false;
      }

      // Support $gte and $lte (Price range)
      if ("$gte" in queryVal) {
        if (Number(itemVal) < Number(queryVal.$gte)) return false;
      }
      if ("$lte" in queryVal) {
        if (Number(itemVal) > Number(queryVal.$lte)) return false;
      }
      
      // Support $regex
      if ("$regex" in queryVal) {
        const regexStr = queryVal.$regex;
        const options = queryVal.$options || "i";
        const regex = new RegExp(regexStr, options);
        if (!regex.test(itemVal)) return false;
      }
      
      continue;
    }

    // Evaluate exact field matching or Regex matching
    const itemVal = item[key];
    if (queryVal instanceof RegExp) {
      if (!queryVal.test(itemVal)) return false;
    } else {
      if (String(itemVal).toLowerCase() !== String(queryVal).toLowerCase()) {
        return false;
      }
    }
  }
  return true;
};

// Generic Class representing a Document
class LocalDocument {
  constructor(collectionName, data) {
    this._collectionName = collectionName;
    Object.assign(this, data);
    if (!this._id) {
      this._id = "mock_" + Math.random().toString(36).substring(2, 15);
    }
  }

  async save() {
    const list = readData(this._collectionName);
    const index = list.findIndex(item => item._id === this._id);
    
    // Convert this instance to plain object
    const plain = { ...this };
    delete plain._collectionName;
    
    if (index >= 0) {
      list[index] = plain;
    } else {
      list.push(plain);
    }
    writeData(this._collectionName, list);
    return this;
  }
}

// Factory to create a Mock Model
export const createMockModel = (collectionName) => {
  class MockModel extends LocalDocument {
    constructor(data) {
      super(collectionName, data);
    }

    static find(query = {}) {
      const list = readData(collectionName);
      const matched = list.filter(item => evaluateQuery(item, query));
      return new QueryChain(Promise.resolve(matched));
    }

    static findOne(query = {}) {
      const list = readData(collectionName);
      const matched = list.find(item => evaluateQuery(item, query));
      return new QueryChain(Promise.resolve(matched || null));
    }

    static findById(id) {
      const list = readData(collectionName);
      const matched = list.find(item => String(item._id) === String(id));
      return new QueryChain(Promise.resolve(matched || null));
    }

    static findByIdAndUpdate(id, update, options = {}) {
      const list = readData(collectionName);
      const index = list.findIndex(item => String(item._id) === String(id));
      if (index === -1) return new QueryChain(Promise.resolve(null));
      
      let updatedItem = { ...list[index], ...update };
      // Handle $set if present
      if (update.$set) {
        updatedItem = { ...updatedItem, ...update.$set };
        delete updatedItem.$set;
      }
      list[index] = updatedItem;
      writeData(collectionName, list);
      return new QueryChain(Promise.resolve(updatedItem));
    }

    static findByIdAndDelete(id) {
      const list = readData(collectionName);
      const index = list.findIndex(item => String(item._id) === String(id));
      if (index === -1) return new QueryChain(Promise.resolve(null));
      
      const removed = list.splice(index, 1)[0];
      writeData(collectionName, list);
      return new QueryChain(Promise.resolve(removed));
    }

    static findOneAndDelete(query = {}) {
      const list = readData(collectionName);
      const index = list.findIndex(item => evaluateQuery(item, query));
      if (index === -1) return new QueryChain(Promise.resolve(null));
      
      const removed = list.splice(index, 1)[0];
      writeData(collectionName, list);
      return new QueryChain(Promise.resolve(removed));
    }

    static deleteMany(query = {}) {
      const list = readData(collectionName);
      const remaining = list.filter(item => !evaluateQuery(item, query));
      writeData(collectionName, remaining);
      return Promise.resolve({ deletedCount: list.length - remaining.length });
    }

    static countDocuments(query = {}) {
      const list = readData(collectionName);
      const matched = list.filter(item => evaluateQuery(item, query));
      return Promise.resolve(matched.length);
    }
  }

  return MockModel;
};
