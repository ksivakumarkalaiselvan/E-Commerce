import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  sequelize,
  User,
  Category,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Review,
  Payment,
} from '../models/index.js';
import { initialCategories, initialProducts, initialReviews } from '../data/initialProducts.js';

// Format helper to standardize output objects and provide both id and _id
const toJSON = (doc) => {
  if (!doc) return null;
  const json = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc };
  if (json.id !== undefined && json._id === undefined) {
    json._id = json.id;
  }
  return json;
};

export const seedDatabase = async () => {
  try {
    // Synchronize SQL schema and create tables if they do not exist
    await sequelize.sync();
    console.log('\x1b[32m✔ SQL Tables Synchronized (Users, Categories, Products, Carts, Orders, Reviews, Payments).\x1b[0m');

    const userCount = await User.count();
    if (userCount === 0) {
      console.log('Seeding initial records into SQL database...');

      const adminPassword = await bcrypt.hash('admin123', 10);
      const customerPassword = await bcrypt.hash('customer123', 10);

      const admin = await User.create({
        name: 'Store Admin',
        email: 'admin@store.com',
        password: adminPassword,
        role: 'admin',
        phone: '+1 555-0199',
        addresses: [
          {
            _id: 'addr_1',
            street: '100 Silicon Blvd, Suite 400',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94107',
            country: 'USA',
            isDefault: true,
          },
        ],
      });

      const customer = await User.create({
        name: 'John Doe',
        email: 'customer@store.com',
        password: customerPassword,
        role: 'user',
        phone: '+1 555-0142',
        addresses: [
          {
            _id: 'addr_2',
            street: '742 Evergreen Terrace',
            city: 'Springfield',
            state: 'OR',
            postalCode: '97477',
            country: 'USA',
            isDefault: true,
          },
        ],
      });

      // Categories
      for (const cat of initialCategories) {
        await Category.create(cat);
      }

      // Products
      const createdProducts = [];
      for (const prod of initialProducts) {
        const p = await Product.create(prod);
        createdProducts.push(p);
      }

      // Reviews
      if (createdProducts.length > 0) {
        for (let i = 0; i < Math.min(initialReviews.length, createdProducts.length); i++) {
          await Review.create({
            userId: customer.id,
            userName: initialReviews[i].userName,
            productId: createdProducts[i].id,
            rating: initialReviews[i].rating,
            comment: initialReviews[i].comment,
            verifiedPurchase: true,
          });
        }
      }

      console.log('\x1b[32m✔ SQL Database seeded with initial products, categories, reviews, and test accounts.\x1b[0m');
    }
  } catch (err) {
    console.error('Error synchronizing/seeding SQL database:', err.message);
  }
};

// ================= USER SERVICES =================
export const findUserByEmail = async (email) => {
  const user = await User.findOne({
    where: { email: email.toLowerCase().trim() },
  });
  return user ? user.toJSON() : null;
};

export const findUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] },
  });
  return user ? user.toJSON() : null;
};

export const createUser = async ({ name, email, password, role = 'user', phone = '' }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role,
    phone,
    addresses: [],
  });

  const raw = user.toJSON();
  delete raw.password;
  return raw;
};

export const updateUser = async (id, updateData) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.update(updateData);
  const raw = user.toJSON();
  delete raw.password;
  return raw;
};

export const getAllUsers = async () => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
  });
  return users.map(toJSON);
};

export const comparePassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id || user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'aura_super_secure_jwt_secret_key_2026_!@#$',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// ================= PRODUCT SERVICES =================
export const getProducts = async ({
  search = '',
  category = '',
  brand = '',
  minPrice = 0,
  maxPrice = 100000,
  rating = 0,
  sort = 'newest',
  page = 1,
  limit = 12,
  isFeatured,
}) => {
  page = Number(page) || 1;
  limit = Number(limit) || 12;

  const where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
      { brand: { [Op.like]: `%${search}%` } },
    ];
  }

  if (category && category !== 'All') {
    where.category = category;
  }

  if (brand && brand !== 'All') {
    where.brand = brand;
  }

  where.price = {
    [Op.gte]: Number(minPrice) || 0,
    [Op.lte]: Number(maxPrice) || 100000,
  };

  if (rating > 0) {
    where.rating = { [Op.gte]: Number(rating) };
  }

  if (typeof isFeatured === 'boolean') {
    where.isFeatured = isFeatured;
  }

  let order = [['createdAt', 'DESC']];
  if (sort === 'price-asc') order = [['price', 'ASC']];
  if (sort === 'price-desc') order = [['price', 'DESC']];
  if (sort === 'rating') order = [['rating', 'DESC'], ['numReviews', 'DESC']];
  if (sort === 'popular') order = [['numReviews', 'DESC']];

  const { count, rows } = await Product.findAndCountAll({
    where,
    order,
    limit,
    offset: (page - 1) * limit,
  });

  return {
    products: rows.map(toJSON),
    page,
    pages: Math.ceil(count / limit) || 1,
    total: count,
  };
};

export const getProductById = async (id) => {
  const where = isNaN(Number(id)) ? { slug: id } : { id: Number(id) };
  const product = await Product.findOne({ where });
  return toJSON(product);
};

export const createProduct = async (productData) => {
  const product = await Product.create(productData);
  return toJSON(product);
};

export const updateProduct = async (id, updateData) => {
  const product = await Product.findByPk(id);
  if (!product) return null;
  await product.update(updateData);
  return toJSON(product);
};

export const deleteProduct = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) return null;
  await product.destroy();
  return toJSON(product);
};

export const getBrands = async () => {
  const products = await Product.findAll({
    attributes: ['brand'],
    group: ['brand'],
  });
  return products.map((p) => p.brand).filter(Boolean);
};

// ================= CATEGORY SERVICES =================
export const getAllCategories = async () => {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  return categories.map(toJSON);
};

export const getCategoryById = async (id) => {
  const where = isNaN(Number(id)) ? { slug: id } : { id: Number(id) };
  const cat = await Category.findOne({ where });
  return toJSON(cat);
};

export const createCategory = async (data) => {
  const cat = await Category.create(data);
  return toJSON(cat);
};

export const updateCategory = async (id, data) => {
  const cat = await Category.findByPk(id);
  if (!cat) return null;
  await cat.update(data);
  return toJSON(cat);
};

export const deleteCategory = async (id) => {
  const cat = await Category.findByPk(id);
  if (!cat) return null;
  await cat.destroy();
  return toJSON(cat);
};

// ================= REVIEW SERVICES =================
export const getProductReviews = async (productId) => {
  const reviews = await Review.findAll({
    where: { productId: Number(productId) },
    order: [['createdAt', 'DESC']],
  });
  return reviews.map(toJSON);
};

export const addReview = async ({ userId, userName, userAvatar, productId, rating, comment }) => {
  const review = await Review.create({
    userId,
    userName,
    userAvatar: userAvatar || '',
    productId: Number(productId),
    rating: Number(rating),
    comment,
    verifiedPurchase: true,
  });

  // Recalculate product rating
  const reviews = await Review.findAll({ where: { productId: Number(productId) } });
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const product = await Product.findByPk(productId);
  if (product) {
    await product.update({
      rating: Number(avg.toFixed(1)),
      numReviews: reviews.length,
    });
  }

  return toJSON(review);
};

// ================= CART SERVICES =================
export const getCart = async (userId) => {
  let [cart] = await Cart.findOrCreate({
    where: { userId: Number(userId) },
    include: [{ model: CartItem, as: 'items' }],
  });

  cart = await Cart.findByPk(cart.id, {
    include: [{ model: CartItem, as: 'items' }],
  });

  const raw = toJSON(cart);
  if (raw && raw.items) {
    raw.items = raw.items.map((it) => {
      const itemJson = toJSON(it);
      itemJson._id = itemJson.id;
      itemJson.product = itemJson.productId;
      return itemJson;
    });
  }
  return raw;
};

export const addToCart = async (userId, { productId, quantity = 1 }) => {
  quantity = Number(quantity) || 1;
  const product = await Product.findByPk(productId);
  if (!product) throw new Error('Product not found');

  const [cart] = await Cart.findOrCreate({
    where: { userId: Number(userId) },
  });

  const existingItem = await CartItem.findOne({
    where: { cartId: cart.id, productId: Number(productId) },
  });

  if (existingItem) {
    await existingItem.update({ quantity: existingItem.quantity + quantity });
  } else {
    const images = product.images;
    await CartItem.create({
      cartId: cart.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: Array.isArray(images) && images.length ? images[0] : '',
      quantity,
    });
  }

  return await getCart(userId);
};

export const updateCartItemQuantity = async (userId, productId, quantity) => {
  quantity = Number(quantity);
  const cart = await Cart.findOne({ where: { userId: Number(userId) } });
  if (!cart) throw new Error('Cart not found');

  if (quantity <= 0) {
    await CartItem.destroy({ where: { cartId: cart.id, productId: Number(productId) } });
  } else {
    const item = await CartItem.findOne({ where: { cartId: cart.id, productId: Number(productId) } });
    if (item) {
      await item.update({ quantity });
    }
  }

  return await getCart(userId);
};

export const removeFromCart = async (userId, productId) => {
  return await updateCartItemQuantity(userId, productId, 0);
};

export const clearCart = async (userId) => {
  const cart = await Cart.findOne({ where: { userId: Number(userId) } });
  if (cart) {
    await CartItem.destroy({ where: { cartId: cart.id } });
  }
  return await getCart(userId);
};

export const syncCart = async (userId, guestItems = []) => {
  for (const item of guestItems) {
    await addToCart(userId, {
      productId: item.productId || item.product || item.id,
      quantity: item.quantity || 1,
    });
  }
  return await getCart(userId);
};

// ================= ORDER SERVICES =================
export const createOrder = async (orderData) => {
  const orderNumber = 'AUR-' + Date.now().toString().slice(-6) + '-' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date();

  const timeline = [
    {
      status: 'Pending',
      timestamp: now.toISOString(),
      note: 'Order placed successfully and awaiting fulfillment.',
    },
  ];

  let orderStatus = 'Pending';
  let paidAt = null;

  if (orderData.isPaid) {
    orderStatus = 'Confirmed';
    paidAt = now;
    timeline.push({
      status: 'Confirmed',
      timestamp: now.toISOString(),
      note: 'Payment received. Order confirmed.',
    });
  }

  const order = await Order.create({
    orderNumber,
    userId: Number(orderData.userId || orderData.user),
    shippingAddress: orderData.shippingAddress,
    paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
    paymentResult: orderData.paymentResult || {},
    itemsPrice: Number(orderData.itemsPrice) || 0,
    taxPrice: Number(orderData.taxPrice) || 0,
    shippingPrice: Number(orderData.shippingPrice) || 0,
    discountAmount: Number(orderData.discountAmount) || 0,
    totalPrice: Number(orderData.totalPrice) || 0,
    isPaid: Boolean(orderData.isPaid),
    paidAt,
    orderStatus,
    statusTimeline: timeline,
  });

  // Create Order Items & Deduct Stock
  for (const item of orderData.orderItems || []) {
    const prodId = Number(item.product || item.productId || item.id);
    await OrderItem.create({
      orderId: order.id,
      productId: prodId,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    });

    const product = await Product.findByPk(prodId);
    if (product && product.stock >= item.quantity) {
      await product.update({ stock: product.stock - item.quantity });
    }
  }

  return await getOrderById(order.id);
};

export const getOrderById = async (id) => {
  const where = isNaN(Number(id)) ? { orderNumber: id } : { id: Number(id) };
  const order = await Order.findOne({
    where,
    include: [
      { model: OrderItem, as: 'orderItems' },
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
    ],
  });
  const raw = toJSON(order);
  if (raw && raw.orderItems) {
    raw.orderItems = raw.orderItems.map((it) => {
      const itemJson = toJSON(it);
      itemJson._id = itemJson.id;
      itemJson.product = itemJson.productId;
      return itemJson;
    });
  }
  return raw;
};

export const getOrdersByUser = async (userId) => {
  const orders = await Order.findAll({
    where: { userId: Number(userId) },
    include: [{ model: OrderItem, as: 'orderItems' }],
    order: [['createdAt', 'DESC']],
  });
  return orders.map((o) => {
    const raw = toJSON(o);
    if (raw && raw.orderItems) {
      raw.orderItems = raw.orderItems.map((it) => {
        const itemJson = toJSON(it);
        itemJson._id = itemJson.id;
        itemJson.product = itemJson.productId;
        return itemJson;
      });
    }
    return raw;
  });
};

export const getAllOrders = async ({ status = '', page = 1, limit = 20 }) => {
  page = Number(page) || 1;
  limit = Number(limit) || 20;

  const where = status && status !== 'All' ? { orderStatus: status } : {};

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      { model: OrderItem, as: 'orderItems' },
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });

  return {
    orders: rows.map((o) => {
      const raw = toJSON(o);
      if (raw && raw.orderItems) {
        raw.orderItems = raw.orderItems.map((it) => {
          const itemJson = toJSON(it);
          itemJson._id = itemJson.id;
          itemJson.product = itemJson.productId;
          return itemJson;
        });
      }
      return raw;
    }),
    total: count,
    page,
    pages: Math.ceil(count / limit) || 1,
  };
};

export const updateOrderStatus = async (id, { status, trackingNumber, note }) => {
  const order = await Order.findByPk(id);
  if (!order) throw new Error('Order not found');

  const now = new Date();
  const timeline = order.statusTimeline || [];
  timeline.push({
    status,
    timestamp: now.toISOString(),
    note: note || `Order status marked as ${status}`,
  });

  const updateFields = {
    orderStatus: status,
    statusTimeline: timeline,
  };

  if (trackingNumber) updateFields.trackingNumber = trackingNumber;
  if (status === 'Delivered') updateFields.deliveredAt = now;

  await order.update(updateFields);
  return await getOrderById(order.id);
};

export const cancelOrder = async (id, userId, reason = 'Customer requested cancellation') => {
  const order = await Order.findByPk(id, {
    include: [{ model: OrderItem, as: 'orderItems' }],
  });
  if (!order) throw new Error('Order not found');

  if (Number(order.userId) !== Number(userId)) {
    throw new Error('Not authorized to cancel this order');
  }

  if (order.orderStatus === 'Delivered' || order.orderStatus === 'Shipped') {
    throw new Error(`Cannot cancel order that is already ${order.orderStatus}`);
  }

  const now = new Date();
  const timeline = order.statusTimeline || [];
  timeline.push({
    status: 'Cancelled',
    timestamp: now.toISOString(),
    note: reason,
  });

  await order.update({
    orderStatus: 'Cancelled',
    cancelledAt: now,
    cancelReason: reason,
    statusTimeline: timeline,
  });

  // Restock items in SQL Product table
  for (const item of order.orderItems || []) {
    const product = await Product.findByPk(item.productId);
    if (product) {
      await product.update({ stock: product.stock + item.quantity });
    }
  }

  return await getOrderById(order.id);
};

// ================= PAYMENT SERVICES =================
export const createPaymentRecord = async (data) => {
  const payment = await Payment.create(data);
  return toJSON(payment);
};

// ================= DASHBOARD & STATS =================
export const getDashboardStats = async () => {
  const totalOrders = await Order.count();
  const totalUsers = await User.count();
  const totalProducts = await Product.count();

  const totalRevenue = (await Order.sum('totalPrice', {
    where: { orderStatus: { [Op.ne]: 'Cancelled' } },
  })) || 0;

  const recentOrders = await Order.findAll({
    limit: 6,
    order: [['createdAt', 'DESC']],
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
  });

  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const monthlySales = months.map((m, idx) => ({
    month: m,
    revenue: Math.round(totalRevenue * (0.12 + idx * 0.03)) + 1200,
    orders: Math.round(totalOrders * (0.11 + idx * 0.03)) + 15,
  }));

  return {
    totalRevenue: Number(Number(totalRevenue).toFixed(2)),
    totalOrders,
    totalUsers,
    totalProducts,
    recentOrders: recentOrders.map(toJSON),
    monthlySales,
  };
};
