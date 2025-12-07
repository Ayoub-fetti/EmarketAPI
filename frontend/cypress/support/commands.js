// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Login helper command
 * @param {string} email - User email
 * @param {string} password - User password
 */
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[type="email"], input[placeholder*="email" i], input[placeholder*="Email" i]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('form').submit();
  // Wait for navigation after login
  cy.url().should('not.include', '/login');
});

/**
 * Register helper command
 * @param {object} userData - User registration data
 */
Cypress.Commands.add('register', (userData) => {
  cy.visit('/register');
  cy.get('input[placeholder*="Fullname" i], input[placeholder*="fullname" i]').type(userData.fullname);
  cy.get('input[type="email"], input[placeholder*="email" i], input[placeholder*="Email" i]').type(userData.email);
  cy.get('input[type="password"]').first().type(userData.password);
  if (userData.role) {
    cy.get('select, input[type="radio"]').contains(userData.role).click();
  }
  cy.get('form').submit();
  // Wait for navigation after registration
  cy.url().should('not.include', '/register');
});

/**
 * Clear cart and localStorage
 */
Cypress.Commands.add('clearCart', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('cart');
    win.localStorage.removeItem('cart-session-id');
  });
});

/**
 * Clear auth data
 */
Cypress.Commands.add('clearAuth', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('token');
    win.localStorage.removeItem('userId');
    win.localStorage.removeItem('user');
  });
});

/**
 * Setup API mocks for products and categories
 * Utilise les fixtures pour mocker les réponses API
 */
Cypress.Commands.add('setupProductMocks', () => {
  cy.fixture('products').then((fixture) => {
    // Mock categories API
    cy.intercept('GET', '**/api/categories', { 
      statusCode: 200, 
      body: { categories: fixture.categories } 
    }).as('getCategories');
    
    // Mock published products API
    cy.intercept('GET', '**/api/products/published*', { 
      statusCode: 200, 
      body: { data: fixture.products, pages: 1 } 
    }).as('getPublishedProducts');
    
    // Mock product details API
    fixture.products.forEach((product) => {
      cy.intercept('GET', `**/api/products/${product._id}`, {
        statusCode: 200,
        body: { data: product }
      }).as(`getProduct-${product._id}`);
      
      // L'URL correcte est /reviews/product/{productId} avec des query params
      cy.intercept('GET', `**/api/reviews/product/${product._id}*`, {
        statusCode: 200,
        body: { data: [], total: 0, averageRating: 0 }
      }).as(`getReviews-${product._id}`);
    });
    
    // Mock cart API - pour utilisateurs authentifiés
    cy.intercept('POST', '**/api/cart', {
      statusCode: 200,
      body: { success: true, message: 'Produit ajouté au panier' }
    }).as('addToCart');
    
    cy.intercept('GET', '**/api/cart', {
      statusCode: 200,
      body: { success: true, data: { items: [] } }
    }).as('getCart');
    
    // Mock guest-cart API - pour utilisateurs non authentifiés
    cy.intercept('POST', '**/api/guest-cart', {
      statusCode: 200,
      body: { success: true, message: 'Produit ajouté au panier' }
    }).as('addToGuestCart');
    
    cy.intercept('GET', '**/api/guest-cart', {
      statusCode: 200,
      body: { success: true, data: { items: [] } }
    }).as('getGuestCart');
    
    cy.intercept('DELETE', '**/api/guest-cart', {
      statusCode: 200,
      body: { success: true, message: 'Produit retiré' }
    }).as('removeFromGuestCart');
    
    cy.intercept('PUT', '**/api/guest-cart', {
      statusCode: 200,
      body: { success: true, message: 'Quantité mise à jour' }
    }).as('updateGuestCartQuantity');
    
    // Mock cart API - pour utilisateurs authentifiés (DELETE et PUT)
    cy.intercept('DELETE', '**/api/cart', {
      statusCode: 200,
      body: { success: true, message: 'Produit retiré' }
    }).as('removeFromCart');
    
    cy.intercept('PUT', '**/api/cart', {
      statusCode: 200,
      body: { success: true, message: 'Quantité mise à jour' }
    }).as('updateCartQuantity');
    
    // Mock clear cart API
    cy.intercept('DELETE', '**/api/cart/clear', {
      statusCode: 200,
      body: { success: true, message: 'Panier vidé' }
    }).as('clearCart');
    
    // Mock order creation API
    cy.intercept('POST', '**/api/orders', {
      statusCode: 201,
      body: { 
        success: true, 
        message: 'Commande créée avec succès!', 
        data: { 
          order: { 
            _id: 'order-123', 
            items: [], 
            totalAmount: 100, 
            finalAmount: 100, 
            status: 'pending',
            createdAt: new Date().toISOString()
          } 
        } 
      }
    }).as('createOrder');
    
    // Mock user orders API - intercepte /orders/{userId}
    cy.intercept('GET', '**/api/orders/*', {
      statusCode: 200,
      body: { 
        success: true, 
        data: [{ 
          _id: 'order-123', 
          items: [{ 
            productId: 'test-product-1', 
            quantity: 1, 
            price: 100 
          }], 
          totalAmount: 100, 
          finalAmount: 100, 
          status: 'pending', 
          createdAt: new Date().toISOString() 
        }] 
      }
    }).as('getUserOrders');
  });
});

/**
 * Wait for products to load
 * Gère les cas où les produits peuvent ne pas se charger (erreurs API)
 * NOTE: setupProductMocks() doit être appelé avant cette commande
 */
Cypress.Commands.add('waitForProducts', () => {
  // Attendre que les requêtes API se terminent
  // Ces alias sont créés par setupProductMocks()
  cy.wait(['@getCategories', '@getPublishedProducts'], { timeout: 10000 });
  
  // Attendre que la page se charge (plus de loader)
  cy.get('body', { timeout: 15000 }).should('not.contain', 'Chargement...');
  
  // Attendre un peu pour que le rendu se termine
  cy.wait(500);
});

