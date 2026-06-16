import mongoose from "mongoose";
import { createMockModel } from "./localDb.js";

const userSchema = new mongoose.Schema({
  username: { type: String },
  password: { type: String },
  email: { type: String, unique: true },
  usertype: { type: String }
});

const adminSchema = new mongoose.Schema({
  banner: { type: String },
  categories: { type: Array }
});

const productSchema = new mongoose.Schema({
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
