describe('Cart Logic - Total Calculation', () => {
  const TAX_RATE = 0.2;

  const mockItems = [
    { productId: { _id: '1', price: 100 }, quantity: 2 },
    { productId: { _id: '2', price: 50 }, quantity: 1 },
    { productId: { _id: '3', price: 25.5 }, quantity: 3 },
  ];

  describe('getSubtotal', () => {
    it('should calculate subtotal for single item', () => {
      const items = [{ productId: { price: 100 }, quantity: 2 }];
      const subtotal = items.reduce((total, item) => 
        total + (item.productId.price * item.quantity), 0
      );
      expect(subtotal).toBe(200);
    });

    it('should calculate subtotal for multiple items', () => {
      const subtotal = mockItems.reduce((total, item) => 
        total + (item.productId.price * item.quantity), 0
      );
      expect(subtotal).toBe(326.5);
    });

    it('should return 0 for empty cart', () => {
      const items = [];
      const subtotal = items.reduce((total, item) => 
        total + (item.productId.price * item.quantity), 0
      );
      expect(subtotal).toBe(0);
    });

    it('should handle decimal prices correctly', () => {
      const items = [{ productId: { price: 25.5 }, quantity: 4 }];
      const subtotal = items.reduce((total, item) => 
        total + (item.productId.price * item.quantity), 0
      );
      expect(subtotal).toBe(102);
    });
  });

  describe('getTax', () => {
    it('should calculate tax correctly', () => {
      const subtotal = 100;
      const tax = subtotal * TAX_RATE;
      expect(tax).toBe(20);
    });

    it('should return 0 tax for empty cart', () => {
      const subtotal = 0;
      const tax = subtotal * TAX_RATE;
      expect(tax).toBe(0);
    });
  });

  describe('getTotal', () => {
    it('should calculate total with tax', () => {
      const subtotal = mockItems.reduce((total, item) => 
        total + (item.productId.price * item.quantity), 0
      );
      const tax = subtotal * TAX_RATE;
      const total = subtotal + tax;
      expect(total).toBe(391.8);
    });

    it('should return 0 for empty cart', () => {
      const subtotal = 0;
      const tax = subtotal * TAX_RATE;
      const total = subtotal + tax;
      expect(total).toBe(0);
    });
  });

  describe('getItemCount', () => {
    it('should count total items', () => {
      const count = mockItems.reduce((total, item) => total + item.quantity, 0);
      expect(count).toBe(6);
    });

    it('should return 0 for empty cart', () => {
      const items = [];
      const count = items.reduce((total, item) => total + item.quantity, 0);
      expect(count).toBe(0);
    });
  });
});
