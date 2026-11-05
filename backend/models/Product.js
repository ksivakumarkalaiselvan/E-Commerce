import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true,
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please enter product description'],
  },
  shortDescription: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    min: 0,
  },
  originalPrice: {
    type: Number,
    default: 0,
  },
  discountPercent: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: [true, 'Please select category for this product'],
  },
  brand: {
    type: String,
    required: [true, 'Please enter product brand'],
    trim: true,
  },
  images: {
    type: [String],
    required: [true, 'Please provide at least one product image'],
    validate: [val => val.length > 0, 'At least one image is required'],
  },
  stock: {
    type: Number,
    required: [true, 'Please enter product stock count'],
    min: 0,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isNewArrival: {
    type: Boolean,
    default: false,
  },
  specifications: [{
    key: { type: String, required: true },
    value: { type: String, required: true }
  }],
  features: [String],
  tags: [String],
}, {
  timestamps: true,
});

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  if (this.originalPrice > this.price) {
    this.discountPercent = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);
