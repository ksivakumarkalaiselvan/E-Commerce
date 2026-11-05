import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
  getProductReviews,
  addReview,
} from '../services/storage.js';
import { protect, adminOnly, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all products with filtering, search, sorting & pagination
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      sort,
      page,
      limit,
      isFeatured,
    } = req.query;

    const data = await getProducts({
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      sort,
      page,
      limit,
      isFeatured: isFeatured === 'true' ? true : undefined,
    });

    res.json({
      success: true,
      ...data,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', async (req, res, next) => {
  try {
    const data = await getProducts({ isFeatured: true, limit: 8 });
    res.json({
      success: true,
      products: data.products,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get distinct brands list
// @route   GET /api/products/brands
// @access  Public
router.get('/brands', async (req, res, next) => {
  try {
    const brands = await getBrands();
    res.json({
      success: true,
      brands,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get single product by id or slug
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const reviews = await getProductReviews(req.params.id);
    res.json({
      success: true,
      reviews,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Add review to product
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both rating and review comment.',
      });
    }

    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const review = await addReview({
      userId: req.user.id || req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar || '',
      productId: product.id || product._id,
      rating: Number(rating),
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Review posted successfully',
      review,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { name, description, price, category, brand, images, stock } = req.body;

    if (!name || !price || !category || !brand || !images || !images.length) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, category, brand, and image are required.',
      });
    }

    const product = await createProduct(req.body);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await updateProduct(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const deleted = await deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({
      success: true,
      message: 'Product removed successfully',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
