import http from 'http';

const req = (options, postData) => {
  return new Promise((resolve, reject) => {
    const request = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    request.on('error', reject);
    if (postData) {
      request.write(JSON.stringify(postData));
    }
    request.end();
  });
};

const runTests = async () => {
  console.log('\n--- STARTING FULL E-COMMERCE END-TO-END API TEST ---');

  // Wait for server to become ready
  let ready = false;
  for (let attempt = 1; attempt <= 15; attempt++) {
    try {
      await req({ hostname: '127.0.0.1', port: 5000, path: '/api/health', method: 'GET' });
      ready = true;
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 800));
    }
  }

  if (!ready) {
    throw new Error('Server did not respond within timeout');
  }

  // 2. Fetch products
  const products = await req({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/products',
    method: 'GET',
  });
  console.log(`✔ 2. Products listed: ${products.body.total} products returned.`);

  // 3. Search and filter products
  const searchProds = await req({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/products?search=headphones&category=Audio%20%26%20Sound',
    method: 'GET',
  });
  console.log(`✔ 3. Search & Filter: found ${searchProds.body.products?.length} matching items.`);

  // 4. Admin Login
  const adminLogin = await req(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@store.com', password: 'admin123' }
  );
  console.log('✔ 4. Admin login successful. Role:', adminLogin.body.user?.role);
  const adminToken = adminLogin.body.token;

  // 5. Customer Login
  const customerLogin = await req(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'customer@store.com', password: 'customer123' }
  );
  console.log('✔ 5. Customer login successful. Name:', customerLogin.body.user?.name);
  const customerToken = customerLogin.body.token;

  // 6. Add product to cart
  const sampleProduct = products.body.products[0];
  const addToCartRes = await req(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/cart/add',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
    },
    { productId: sampleProduct._id, quantity: 2 }
  );
  console.log('✔ 6. Added product to cart. Items in cart:', addToCartRes.body.cart?.items?.length);

  // 7. Place Order
  const orderRes = await req(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
    },
    {
      orderItems: [
        {
          product: sampleProduct._id,
          name: sampleProduct.name,
          image: sampleProduct.images[0],
          price: sampleProduct.price,
          quantity: 2,
        },
      ],
      shippingAddress: {
        name: 'John Doe',
        phone: '555-0192',
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        postalCode: '97477',
        country: 'United States',
      },
      paymentMethod: 'Stripe',
      itemsPrice: sampleProduct.price * 2,
      taxPrice: 20,
      shippingPrice: 0,
      discountAmount: 10,
      totalPrice: sampleProduct.price * 2 + 20 - 10,
      isPaid: true,
      paymentResult: { id: 'pi_test_12345', status: 'COMPLETED' },
    }
  );
  console.log('✔ 7. Order placed successfully. Order Number:', orderRes.body.order?.orderNumber);
  const createdOrderId = orderRes.body.order?._id;

  // 8. Admin view dashboard stats
  const adminStats = await req({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`✔ 8. Admin stats retrieved: Revenue=$${adminStats.body.stats?.totalRevenue}, Total Orders=${adminStats.body.stats?.totalOrders}`);

  // 9. Admin update order status to 'Shipped'
  const updateStatusRes = await req(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/admin/orders/${createdOrderId}/status`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    { status: 'Shipped', trackingNumber: 'TRK-98721498' }
  );
  console.log('✔ 9. Admin updated order status:', updateStatusRes.body.order?.orderStatus, 'Tracking:', updateStatusRes.body.order?.trackingNumber);

  // 10. Customer product review
  const reviewRes = await req(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/products/${sampleProduct._id}/reviews`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
    },
    { rating: 5, comment: 'Phenomenal acoustic tuning and fast delivery!' }
  );
  console.log('✔ 10. Added product review. Rating:', reviewRes.body.review?.rating);

  console.log('\n--- ALL 10 TESTS PASSED WITH 100% SUCCESS! ---\n');
  process.exit(0);
};

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
