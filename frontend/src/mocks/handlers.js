import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:3000/api';

export const handlers = [
  // Auth
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const { email, password } = await request.json();
    if (email === 'test@test.com' && password === 'password123') {
      return HttpResponse.json({
        success: true,
        data: {
          token: 'fake-token',
          user: { id: '1', email, fullname: 'Test User', role: 'user' }
        }
      });
    }
    return HttpResponse.json({ errors: { email: 'Invalid credentials' } }, { status: 401 });
  }),

  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        token: 'fake-token',
        user: { id: '1', ...data }
      }
    });
  }),

  http.patch(`${API_URL}/users/:id`, async ({ request }) => {
    return HttpResponse.json({
      success: true,
      data: {
        updatedUser: { id: '1', fullname: 'Updated Name', email: 'updated@test.com' }
      }
    });
  }),

  // Cart
  http.get(`${API_URL}/cart`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        items: [
          {
            productId: { _id: '1', title: 'Product 1', price: 100, primaryImage: '/img.jpg' },
            quantity: 2
          }
        ]
      }
    });
  }),

  http.post(`${API_URL}/cart`, async ({ request }) => {
    return HttpResponse.json({ success: true });
  }),

  http.put(`${API_URL}/cart`, async ({ request }) => {
    return HttpResponse.json({ success: true });
  }),

  http.delete(`${API_URL}/cart`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Coupons
  http.post(`${API_URL}/coupons/validate`, async ({ request }) => {
    const { code } = await request.json();
    if (code === 'VALID10') {
      return HttpResponse.json({
        valid: true,
        data: { code: 'VALID10', discountAmount: 10 }
      });
    }
    return HttpResponse.json({ error: 'Invalid coupon' }, { status: 400 });
  }),

  // Orders
  http.post(`${API_URL}/orders`, () => {
    return HttpResponse.json({
      success: true,
      data: { _id: 'order-123' }
    });
  }),

  http.get(`${API_URL}/orders/user/:userId`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          _id: 'order-1',
          status: 'pending',
          totalAmount: 200,
          finalAmount: 180,
          items: [{ productId: '1', quantity: 2, price: 100 }],
          createdAt: new Date().toISOString()
        }
      ]
    });
  })
];
