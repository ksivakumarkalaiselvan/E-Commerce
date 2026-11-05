import { sequelize, Product } from './models/index.js';
import { initialProducts } from './data/initialProducts.js';

async function syncProducts() {
  await sequelize.authenticate();
  console.log('Connected to SQLite database.');

  let inserted = 0;
  for (const item of initialProducts) {
    const existing = await Product.findOne({ where: { slug: item.slug } });
    if (!existing) {
      await Product.create(item);
      console.log(`+ Added product: [${item.category}] ${item.name} ($${item.price})`);
      inserted++;
    } else {
      console.log(`- Exists: ${item.name}`);
    }
  }

  const total = await Product.count();
  const electronicsCount = await Product.count({ where: { category: 'Electronics' } });
  console.log(`\n✔ Synchronization complete!`);
  console.log(`Newly inserted: ${inserted}`);
  console.log(`Total products in database: ${total}`);
  console.log(`Total Electronics products: ${electronicsCount}`);
  process.exit(0);
}

syncProducts().catch(err => {
  console.error('Failed to sync products:', err);
  process.exit(1);
});
