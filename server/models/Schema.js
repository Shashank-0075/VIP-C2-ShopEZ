import mongoose from "mongoose";
import { createMockModel } from "./localDb.js";

const userSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.Mixed, default: () => new mongoose.Types.ObjectId().toString() },
  username: { type: String },
  password: { type: String },
  email: { type: String, unique: true },
  usertype: { type: String }
});

const adminSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.Mixed, default: () => new mongoose.Types.ObjectId().toString() },
  banner: { type: String },
  categories: { type: Array }
});

const productSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.Mixed, default: () => new mongoose.Types.ObjectId().toString() },
  title: { type: String },
  description: { type: String },
  mainImg: { type: String },
  carousel: { type: Array },
  sizes: { type: Array },
  category: { type: String },
  gender: { type: String },
  price: { type: Number },
  discount: { type: Number }
});

const orderSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.Mixed, default: () => new mongoose.Types.ObjectId().toString() },
  userId: { type: String },
  name: { type: String },
  email: { type: String },
  mobile: { type: String },
  address: { type: String },
  pincode: { type: String },
  title: { type: String },
  description: { type: String },
  mainImg: { type: String },
  size: { type: String },
  quantity: { type: Number },
  price: { type: Number },
  discount: { type: Number },
  paymentMethod: { type: String },
  orderDate: { type: String },
  deliveryDate: { type: String },
  orderStatus: { type: String, default: 'order placed' }
});

const cartSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.Mixed, default: () => new mongoose.Types.ObjectId().toString() },
  userId: { type: String },
  title: { type: String },
  description: { type: String },
  mainImg: { type: String },
  size: { type: String },
  quantity: { type: String }, 
  price: { type: Number },
  discount: { type: Number }
});

const MongoUser = mongoose.model('users', userSchema);
const MongoAdmin = mongoose.model('admin', adminSchema);
const MongoProduct = mongoose.model('products', productSchema);
const MongoOrders = mongoose.model('orders', orderSchema);
const MongoCart = mongoose.model('cart', cartSchema);

// Helper to recursively cast 24-char hex strings in query objects to ObjectIds using $in
const castIds = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  
  for (const key of Object.keys(obj)) {
    if (key === "_id") {
      const val = obj[key];
      if (typeof val === "string" && val.length === 24 && /^[0-9a-fA-F]{24}$/.test(val)) {
        obj[key] = { $in: [val, new mongoose.Types.ObjectId(val)] };
      } else if (val && typeof val === "object") {
        for (const op of Object.keys(val)) {
          if (Array.isArray(val[op])) {
            val[op] = val[op].flatMap(item => {
              if (typeof item === "string" && item.length === 24 && /^[0-9a-fA-F]{24}$/.test(item)) {
                return [item, new mongoose.Types.ObjectId(item)];
              }
              return [item];
            });
          } else if (typeof val[op] === "string" && val[op].length === 24 && /^[0-9a-fA-F]{24}$/.test(val[op])) {
            val[op] = { $in: [val[op], new mongoose.Types.ObjectId(val[op])] };
          }
        }
      }
    } else {
      castIds(obj[key]);
    }
  }
  return obj;
};

const makeModelProxy = (collectionName, mongooseModel) => {
  const localMockModel = createMockModel(collectionName);

  // Constructor Proxy
  function ProxyConstructor(data) {
    if (global.USE_LOCAL_DB) {
      return new localMockModel(data);
    } else {
      return new mongooseModel(data);
    }
  }

  // Static Methods Proxy
  const staticMethods = [
    "find",
    "findOne",
    "findById",
    "findByIdAndUpdate",
    "findByIdAndDelete",
    "findOneAndDelete",
    "deleteMany",
    "countDocuments"
  ];

  staticMethods.forEach(method => {
    ProxyConstructor[method] = function(...args) {
      if (global.USE_LOCAL_DB) {
        return localMockModel[method](...args);
      } else {
        // Intercept and cast string ObjectId to mongoose.Types.ObjectId for true MongoDB
        if (args.length > 0) {
          if (method.startsWith("findById")) {
            let id = args[0];
            if (typeof id === "string" && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
              const query = { _id: { $in: [id, new mongoose.Types.ObjectId(id)] } };
              if (method === "findById") {
                return mongooseModel.findOne(query, ...args.slice(1));
              } else if (method === "findByIdAndUpdate") {
                return mongooseModel.findOneAndUpdate(query, ...args.slice(1));
              } else if (method === "findByIdAndDelete") {
                return mongooseModel.findOneAndDelete(query, ...args.slice(1));
              }
            }
          } else if (typeof args[0] === "object") {
            args[0] = castIds(args[0]);
          }
        }
        return mongooseModel[method](...args);
      }
    };
  });

  return ProxyConstructor;
};

export const User = makeModelProxy('users', MongoUser);
export const Admin = makeModelProxy('admin', MongoAdmin);
export const Product = makeModelProxy('products', MongoProduct);
export const Orders = makeModelProxy('orders', MongoOrders);
export const Cart = makeModelProxy('cart', MongoCart);
