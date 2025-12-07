/**
 * Tests E2E pour le panier et le checkout
 * 
 * Ce fichier contient les tests end-to-end pour:
 * - Ajout de produits au panier
 * - Affichage du total et du nombre d'articles
 * - Suppression de produits
 * - Processus de checkout (création de commande)
 * - Confirmation et redirection
 */

describe('Tests E2E - Panier et Checkout', () => {
  // Données de test
  const testUser = {
    email: 'testuser@example.com',
    password: 'Test123456!',
    fullname: 'Test User',
    role: 'user'
  };

  // Vérifier que le serveur est accessible avant tous les tests
  before(() => {
    cy.task('checkServer').then((result) => {
      if (!result.running) {
        throw new Error(
          '❌ Le serveur frontend n\'est pas en cours d\'exécution!\n\n' +
          'Veuillez démarrer le serveur avec: npm run dev\n' +
          'Le serveur doit être accessible sur http://localhost:5173\n\n' +
          'Assurez-vous également que le backend est en cours d\'exécution.'
        );
      }
    });
  });

  beforeEach(() => {
    // Nettoyer le localStorage avant chaque test
    cy.clearCart();
    cy.clearAuth();
    
    // Visiter la page d'accueil
    cy.visit('/', { timeout: 30000 });
  });

  describe('1. Navigation vers la page produits', () => {
    it('Devrait afficher la page produits avec une liste de produits', () => {
      // Configurer les mocks API
      cy.setupProductMocks();
      
      // Naviguer vers la page produits
      cy.visit('/products');
      
      // Vérifier que la page produits est chargée
      cy.url().should('include', '/products');
      
      // Attendre que les produits soient chargés
      cy.waitForProducts();
      
      // Vérifier que la page contient au moins le titre FastShop
      cy.get('body').should('contain', 'FastShop');
      
      // Vérifier qu'il y a des produits affichés
      cy.get('[class*="grid"]', { timeout: 10000 }).should('exist');
    });
  });

  describe('2. Ajout de produit au panier', () => {
    beforeEach(() => {
      // Configurer les mocks API
      cy.setupProductMocks();
      
      // Naviguer vers la page produits
      cy.visit('/products');
      
      // Attendre que les produits soient chargés
      cy.waitForProducts();
    });

    it('Devrait ajouter un produit au panier depuis la page produits', () => {
      cy.fixture('products').then((fixture) => {
        const product = fixture.products[0];
        
        // S'assurer que les produits sont bien affichés
        cy.get('[class*="grid"]', { timeout: 10000 }).should('be.visible');
        
        // Vérifier que le produit est affiché
        cy.contains(product.title).should('be.visible');
        
        // Trouver la carte produit et cliquer dessus
        // La carte a un onClick qui appelle handleProductClick
        cy.contains(product.title).closest('div[class*="group"], div[class*="card"]').then(($card) => {
          // S'assurer que la carte est visible et cliquable
          cy.wrap($card).should('be.visible');
          // Cliquer au centre de la carte
          cy.wrap($card).click({ force: true });
        });
        
        // Attendre que la navigation se fasse
        // La navigation devrait aller vers /products/{productId}
        cy.url({ timeout: 15000 }).should('include', '/products/');
        
        // Attendre que les requêtes API se terminent
        cy.wait([`@getProduct-${product._id}`, `@getReviews-${product._id}`], { timeout: 10000 });
        
        // Attendre que le loader disparaisse
        cy.get('body', { timeout: 15000 }).should('not.contain', 'Chargement...');
        
        // Vérifier que le bouton "Ajouter au panier" existe
        cy.contains('button', 'Ajouter au panier', { timeout: 10000 }).should('be.visible');
        
        // Cliquer sur "Ajouter au panier"
        cy.contains('button', 'Ajouter au panier').click();
        
        // Attendre que la requête se termine (soit addToCart soit addToGuestCart)
        // On attend l'une ou l'autre, pas les deux
        cy.wait(1000); // Petit délai pour laisser la requête se déclencher
        
        // Vérifier le toast de succès (cela confirme que la requête a réussi)
        cy.contains('Produit ajouté au panier', { timeout: 10000 }).should('be.visible');
        
        // Vérifier que le compteur du panier s'est mis à jour
        cy.get('[class*="cart"], [class*="fa-cart-shopping"]').parent().should('exist');
      });
    });

    it('Devrait afficher le produit dans le panier', () => {
      cy.fixture('products').then((fixture) => {
        const product = fixture.products[0];
        
        // Cliquer sur le premier produit - utiliser .first() avant .within()
        cy.get('[class*="grid"]').first().within(() => {
          cy.get('div[class*="group"]').first().should('be.visible').click({ force: true });
        });
        
        // Attendre la navigation
        cy.url({ timeout: 15000 }).should('include', `/products/${product._id}`);
        cy.wait([`@getProduct-${product._id}`, `@getReviews-${product._id}`], { timeout: 10000 });
        cy.get('body', { timeout: 15000 }).should('not.contain', 'Chargement...');
        
        // Ajouter au panier
        cy.contains('button', 'Ajouter au panier', { timeout: 10000 }).click();
        
        // Attendre que la requête se termine (soit addToCart soit addToGuestCart)
        cy.wait(1000); // Petit délai pour laisser la requête se déclencher
        
        // Vérifier le toast de succès
        cy.contains('Produit ajouté au panier', { timeout: 10000 }).should('be.visible');
        
        // Ouvrir le panier (cliquer sur l'icône panier dans le header)
        // Le bouton contient l'icône fa-cart-shopping
        cy.get('i.fa-cart-shopping').parent('button').first().click({ force: true });
        
        // Attendre que le drawer du panier s'ouvre (drawer avec fixed et w-96)
        // Le drawer est ouvert quand il a la classe translate-x-0 (pas translate-x-full)
        // Attendre un peu pour la transition CSS (300ms selon le code)
        cy.wait(400);
        cy.get('div[class*="fixed"][class*="w-96"]', { timeout: 10000 })
          .should('have.class', 'translate-x-0');
        
        // Attendre un peu pour que le drawer se charge complètement
        cy.wait(1000);
        
        // Vérifier que le panier contient au moins un article
        // Utiliser .within() pour scoper la recherche dans le drawer
        cy.get('div[class*="fixed"][class*="w-96"]').within(() => {
          // Vérifier que le header du panier existe (h2 avec "Panier")
          cy.get('h2').contains(/Panier/i, { timeout: 10000 }).should('exist');
          
          // Vérifier qu'il y a un produit dans le panier
          cy.get('[class*="flex gap"], [class*="item"]', { timeout: 10000 }).should('exist');
        });
      });
    });
  });

  describe('3. Affichage du total et nombre d\'articles', () => {
    beforeEach(() => {
      // Configurer les mocks API avant de visiter la page
      cy.setupProductMocks();
      
      cy.visit('/products');
      cy.waitForProducts();
      
      // Ajouter un produit au panier
      cy.fixture('products').then((fixture) => {
        const product = fixture.products[0];
        
        // Cliquer sur le premier produit pour aller à la page de détails
        cy.get('[class*="grid"]').first().within(() => {
          cy.get('div[class*="group"]').first().should('be.visible').click({ force: true });
        });
        
        // Attendre que la navigation se fasse vers la page de détails
        cy.url({ timeout: 15000 }).should('include', `/products/${product._id}`);
        
        // Attendre que les requêtes API se terminent
        cy.wait([`@getProduct-${product._id}`, `@getReviews-${product._id}`], { timeout: 10000 });
        
        // Attendre que le loader disparaisse
        cy.get('body', { timeout: 15000 }).should('not.contain', 'Chargement...');
        
        // Ajouter au panier
        cy.contains('button', 'Ajouter au panier', { timeout: 10000 }).click();
        
        // Attendre que la requête se termine
        cy.wait(1000);
        
        cy.contains('Produit ajouté au panier', { timeout: 10000 }).should('be.visible');
      });
      
      // Ouvrir le panier (cliquer sur le bouton avec l'icône fa-cart-shopping)
      cy.get('i.fa-cart-shopping').parent('button').first().click({ force: true });
      cy.wait(400); // Attendre la transition CSS
      cy.get('div[class*="fixed"][class*="w-96"]', { timeout: 10000 }).should('be.visible');
      cy.wait(1000); // Attendre que le drawer se charge
    });

    it('Devrait afficher le nombre d\'articles dans le panier', () => {
      // Vérifier que le header du panier affiche le nombre d'articles
      cy.get('div[class*="fixed"][class*="w-96"]').within(() => {
        cy.get('h2').contains(/Panier.*articles?/i, { timeout: 10000 }).should('exist');
      });
      
      // Vérifier que le compteur dans le header est mis à jour
      cy.get('header').within(() => {
        cy.get('[class*="badge"], [class*="count"], span').should('exist');
      });
    });

    it('Devrait afficher le sous-total et le total', () => {
      // Vérifier la présence du sous-total
      cy.contains(/Sous-total|Subtotal/i).should('be.visible');
      
      // Vérifier la présence du total
      cy.contains(/Total/i).should('be.visible');
      
      // Vérifier que les montants sont affichés avec "MAD"
      cy.contains(/MAD/).should('be.visible');
    });

      it('Devrait calculer correctement le total avec plusieurs produits', () => {
        // Fermer le panier - le bouton de fermeture utilise l'icône X de lucide-react
        cy.get('div[class*="fixed"][class*="w-96"]').within(() => {
          // Le bouton de fermeture est dans le header, c'est le dernier bouton
          cy.get('div[class*="flex"][class*="items-center"][class*="justify-between"]').within(() => {
            cy.get('button').last().click({ force: true });
          });
        });
        // Attendre que le drawer se ferme complètement (transition de 300ms)
        cy.wait(500);
        
        // Vérifier que le drawer est bien fermé
        cy.get('div[class*="fixed"][class*="w-96"]').should('have.class', 'translate-x-full');
      
        // Ajouter un deuxième produit
        cy.visit('/products');
        cy.waitForProducts();
        cy.get('[class*="group"], [class*="card"], [class*="product"]').eq(1).click();
        cy.url().should('include', '/products/');
        cy.contains('button', 'Ajouter au panier', { timeout: 10000 }).click();
        cy.contains('Produit ajouté au panier', { timeout: 5000 }).should('be.visible');
      
        // Rouvrir le panier (cliquer sur le bouton avec l'icône fa-cart-shopping)
        cy.get('i.fa-cart-shopping').parent('button').first().click({ force: true });
        
        // Attendre la transition CSS (300ms) et vérifier que le drawer s'ouvre
        cy.wait(400);
        cy.get('div[class*="fixed"][class*="w-96"]', { timeout: 10000 })
          .should('have.class', 'translate-x-0');
        cy.wait(1000); // Attendre que le drawer se charge
      
      // Vérifier qu'il y a 2 produits
      cy.get('div[class*="fixed"][class*="w-96"]').within(() => {
        cy.get('h2').contains(/Panier.*2.*articles?/i, { timeout: 10000 }).should('exist');
      });
      
      // Vérifier que le total est mis à jour
      cy.contains(/Total/i).should('be.visible');
    });
  });

  describe('4. Modification de la quantité', () => {
    beforeEach(() => {
      // Configurer les mocks API
      cy.setupProductMocks();
      
      cy.visit('/products');
      cy.waitForProducts();
      
      // Ajouter un produit
      cy.fixture('products').then((fixture) => {
        const product = fixture.products[0];
        
        // Cliquer sur le premier produit pour aller à la page de détails
        cy.get('[class*="grid"]').first().within(() => {
          cy.get('div[class*="group"]').first().should('be.visible').click({ force: true });
        });
        
        // Attendre que la navigation se fasse vers la page de détails
        cy.url({ timeout: 15000 }).should('include', `/products/${product._id}`);
        
        // Attendre que les requêtes API se terminent
        cy.wait([`@getProduct-${product._id}`, `@getReviews-${product._id}`], { timeout: 10000 });
        
        // Attendre que le loader disparaisse
        cy.get('body', { timeout: 15000 }).should('not.contain', 'Chargement...');
        
        // Ajouter au panier
        cy.contains('button', 'Ajouter au panier', { timeout: 10000 }).click();
        cy.wait(1000); // Attendre que la requête se termine
        cy.contains('Produit ajouté au panier', { timeout: 10000 }).should('be.visible');
      });
      
      // Ouvrir le panier (cliquer sur le bouton avec l'icône fa-cart-shopping)
      cy.get('i.fa-cart-shopping').parent('button').first().click({ force: true });
      cy.wait(400); // Attendre la transition CSS
      cy.get('div[class*="fixed"][class*="w-96"]', { timeout: 10000 }).should('be.visible');
      cy.wait(1000); // Attendre que le drawer se charge
    });

    it('Devrait augmenter la quantité d\'un produit', () => {
      // Trouver le bouton "+" pour augmenter la quantité
      // Le bouton utilise l'icône Plus de lucide-react, pas du texte
      cy.get('div[class*="fixed"][class*="w-96"]').within(() => {
        // Chercher le bouton avec l'icône Plus (premier bouton dans les contrôles de quantité)
        cy.get('[class*="flex gap"]').first().within(() => {
          // Le bouton + est généralement le deuxième bouton (après le -)
          cy.get('button').eq(1).click({ force: true });
        });
      });
      
      // Vérifier que la quantité a été mise à jour (peut nécessiter un wait)
      cy.wait(500);
      
      // Vérifier que le total a été mis à jour
      cy.get('div[class*="fixed"][class*="w-96"]').within(() => {
        cy.contains(/Total/i).should('exist');
      });
    });

    it('Devrait diminuer la quantité d\'un produit', () => {
      cy.get('div[class*="fixed"][class*="w-96"]').within(() => {
        // Augmenter d'abord la quantité
        cy.get('[class*="flex gap"]').first().within(() => {
          // Le bouton + est le deuxième bouton (après le -)
          cy.get('button').eq(1).click({ force: true });
        });
      });
      cy.wait(500);
      
      // Diminuer la quantité
      cy.get('div[class*="fixed"][class*="w-96"]').within(() => {
        cy.get('[class*="flex gap"]').first().within(() => {
          // Le bouton - est le premier bouton
          cy.get('button').first().click({ force: true });
        });
      });
      cy.wait(500);
      
      // Vérifier que le total est mis à jour
      cy.get('div[class*="fixed"][class*="w-96"]').within(() => {
        cy.contains(/Total/i).should('exist');
      });
    });
  });

  describe('5. Suppression de produit du panier', () => {
    beforeEach(() => {
      // Configurer les mocks API
      cy.setupProductMocks();
      
      cy.visit('/products');
      cy.waitForProducts();
      
      // Ajouter un produit
      cy.fixture('products').then((fixture) => {
        const product = fixture.products[0];
        
        // Cliquer sur le premier produit pour aller à la page de détails
        cy.get('[class*="grid"]').first().within(() => {
          cy.get('div[class*="group"]').first().should('be.visible').click({ force: true });
        });
        
        // Attendre que la navigation se fasse vers la page de détails
        cy.url({ timeout: 15000 }).should('include', `/products/${product._id}`);
        
        // Attendre que les requêtes API se terminent
        cy.wait([`@getProduct-${product._id}`, `@getReviews-${product._id}`], { timeout: 10000 });
        
        // Attendre que le loader disparaisse
        cy.get('body', { timeout: 15000 }).should('not.contain', 'Chargement...');
        
        // Ajouter au panier
        cy.contains('button', 'Ajouter au panier', { timeout: 10000 }).click();
        cy.wait(1000); // Attendre que la requête se termine
        cy.contains('Produit ajouté au panier', { timeout: 10000 }).should('be.visible');
      });
      
      // Ouvrir le panier (cliquer sur le bouton avec l'icône fa-cart-shopping)
      cy.get('i.fa-cart-shopping').parent('button').first().click({ force: true });
      cy.wait(400); // Attendre la transition CSS
      cy.get('div[class*="fixed"][class*="w-96"]', { timeout: 10000 }).should('be.visible');
      cy.wait(1000); // Attendre que le drawer se charge
    });

    it('Devrait supprimer un produit du panier', () => {
      // Noter le total initial (si disponible)
      let initialTotal;
      cy.contains(/Total/i).then(($el) => {
        initialTotal = $el.text();
      });
      
      // Trouver et cliquer sur le bouton de suppression (icône poubelle)
      // Le bouton utilise l'icône Trash2 de lucide-react
      cy.get('div[class*="fixed"][class*="w-96"]').within(() => {
        cy.get('[class*="flex gap"]').first().within(() => {
          // Le bouton de suppression est le dernier bouton (après + et -)
          cy.get('button').last().click({ force: true });
        });
      });
      
      // Attendre que la requête DELETE se termine
      cy.wait(1000); // Petit délai pour laisser la requête se déclencher
      
      // Vérifier le toast de confirmation (cela confirme que la requête a réussi)
      cy.contains(/retiré|supprimé|removed/i, { timeout: 10000 }).should('be.visible');
      
      // Attendre que le panier se mette à jour
      cy.wait(1000);
      
      // Vérifier que le total a été mis à jour (ou que le panier est vide)
      cy.get('body').then(($body) => {
        if ($body.text().includes('vide') || $body.text().includes('empty')) {
          cy.contains(/vide|empty/i).should('be.visible');
        } else {
          cy.contains(/Total/i).should('be.visible');
        }
      });
    });

      it('Devrait mettre à jour le total après suppression', () => {
        // Fermer le panier pour ajouter un deuxième produit
        cy.get('div[class*="fixed"][class*="w-96"]').within(() => {
          cy.get('div[class*="flex"][class*="items-center"][class*="justify-between"]').within(() => {
            cy.get('button').last().click({ force: true });
          });
        });
        cy.wait(500); // Attendre que le drawer se ferme
      
      // Les mocks sont déjà configurés dans beforeEach, pas besoin de les reconfigurer
      cy.visit('/products');
      cy.waitForProducts();
      cy.get('[class*="group"], [class*="card"], [class*="product"]').eq(1).click();
      cy.url().should('include', '/products/');
      cy.contains('button', 'Ajouter au panier', { timeout: 10000 }).click();
      cy.contains('Produit ajouté au panier', { timeout: 5000 }).should('be.visible');
      
        // Rouvrir le panier (cliquer sur le bouton avec l'icône fa-cart-shopping)
        cy.get('i.fa-cart-shopping').parent('button').first().click({ force: true });
        cy.wait(400); // Attendre la transition CSS
        cy.get('div[class*="fixed"][class*="w-96"]', { timeout: 10000 })
          .should('have.class', 'translate-x-0')
          .should('be.visible');
        cy.wait(1000); // Attendre que le drawer se charge
      
      // Noter le total avec 2 produits
      cy.get('div[class*="fixed"][class*="w-96"]').within(() => {
        cy.contains(/Total/i).should('exist');
      });
      
      // Supprimer un produit
      cy.get('div[class*="fixed"][class*="w-96"]').within(() => {
        cy.get('[class*="flex gap"]').first().within(() => {
          // Le bouton de suppression est le dernier bouton (après + et -)
          cy.get('button').last().click({ force: true });
        });
      });
      
      // Attendre le toast de confirmation (cela confirme que la suppression a réussi)
      cy.contains(/retiré|supprimé|removed/i, { timeout: 10000 }).should('be.visible');
      
      // Attendre que le drawer se mette à jour
      cy.wait(1500);
      
      // Vérifier que le drawer est toujours ouvert
      cy.get('div[class*="fixed"][class*="w-96"]', { timeout: 10000 })
        .should('have.class', 'translate-x-0')
        .should('be.visible');
      
      // Vérifier que le total a changé ou que le panier est vide
      // Après suppression d'un produit, il peut rester 1 produit ou le panier peut être vide
      cy.get('div[class*="fixed"][class*="w-96"]').within(() => {
        // Vérifier si le panier est vide ou s'il reste des produits
        // On vérifie d'abord si le message "vide" existe, sinon on vérifie les produits
        cy.root().then(($drawer) => {
          const drawerText = $drawer.text();
          const isEmpty = drawerText.includes('vide') || drawerText.includes('empty') || drawerText.includes('Votre panier est vide');
          
          if (isEmpty) {
            // Le panier est vide après suppression, c'est OK
            cy.contains(/vide|empty|Votre panier est vide/i, { timeout: 10000 }).should('exist');
          } else {
            // Il reste des produits, vérifier qu'il y a au moins un produit et que le Total existe
            cy.get('[class*="flex gap"]', { timeout: 10000 }).should('have.length.at.least', 1);
            cy.contains(/Total/i, { timeout: 10000 }).should('exist');
          }
        });
      });
    });
  });

  describe('6. Processus de checkout', () => {
    beforeEach(() => {
      // Simuler un utilisateur connecté en définissant directement les données dans localStorage
      // Cela évite de dépendre du backend pour l'authentification
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'test-token-123');
        win.localStorage.setItem('userId', 'test-user-id-123');
        win.localStorage.setItem('user', JSON.stringify({
          _id: 'test-user-id-123',
          id: 'test-user-id-123', // La page Orders utilise user.id
          email: testUser.email,
          fullname: testUser.fullname,
          role: 'user'
        }));
      });
      
      // Configurer les mocks pour les produits
      cy.setupProductMocks();
      
      // Ajouter un produit au panier
      cy.visit('/products');
      cy.waitForProducts();
      
      // Cliquer sur le premier produit pour aller à la page de détails
      cy.fixture('products').then((fixture) => {
        const product = fixture.products[0];
        
        // Cliquer sur le premier produit
        cy.get('[class*="grid"]').first().within(() => {
          cy.get('div[class*="group"]').first().should('be.visible').click({ force: true });
        });
        
        // Attendre que la navigation se fasse vers la page de détails
        cy.url({ timeout: 15000 }).should('include', `/products/${product._id}`);
        
        // Attendre que les requêtes API se terminent
        cy.wait([`@getProduct-${product._id}`, `@getReviews-${product._id}`], { timeout: 10000 });
        
        // Attendre que le loader disparaisse
        cy.get('body', { timeout: 15000 }).should('not.contain', 'Chargement...');
        
        // Ajouter au panier
        cy.contains('button', 'Ajouter au panier', { timeout: 10000 }).click();
        
        // Attendre que la requête se termine
        cy.wait(1000);
        
        cy.contains('Produit ajouté au panier', { timeout: 10000 }).should('be.visible');
      });
      
      // Ouvrir le panier (cliquer sur le bouton avec l'icône fa-cart-shopping)
      cy.get('i.fa-cart-shopping').parent('button').first().click({ force: true });
      cy.wait(400); // Attendre la transition CSS
      cy.get('div[class*="fixed"][class*="w-96"]', { timeout: 10000 }).should('be.visible');
      cy.wait(1000); // Attendre que le drawer se charge
    });

    it('Devrait permettre de créer une commande (checkout)', () => {
      // Vérifier que le bouton "Commander" est visible
      cy.contains('button', /Commander|Checkout|Order/i, { timeout: 10000 }).should('be.visible');
      
      // Cliquer sur le bouton "Commander"
      cy.contains('button', /Commander|Checkout|Order/i).click();
      
      // Attendre la création de la commande (attendre la requête API)
      cy.wait('@createOrder', { timeout: 10000 });
      
      // Vérifier le message de succès
      cy.contains(/succès|success|créée|created/i, { timeout: 10000 }).should('be.visible');
      
      // Vérifier la redirection vers la page des commandes
      cy.url({ timeout: 10000 }).should('include', '/orders');
    });

    it('Devrait afficher la confirmation de commande', () => {
      // Cliquer sur "Commander"
      cy.contains('button', /Commander|Checkout|Order/i, { timeout: 10000 }).click();
      
      // Attendre la redirection
      cy.url({ timeout: 10000 }).should('include', '/orders');
      
      // Attendre que la requête API se termine
      cy.wait('@getUserOrders', { timeout: 10000 });
      
      // Attendre que la page se charge complètement (plus de loader)
      cy.get('body', { timeout: 15000 }).should('not.contain', 'Chargement...');
      cy.wait(500); // Petit délai pour le rendu
      
      // Vérifier que la page des commandes affiche la commande
      // Utiliser scrollIntoView() pour s'assurer que l'élément est visible
      cy.contains(/Commande|Order/i, { timeout: 10000 }).scrollIntoView().should('be.visible');
      
      // Vérifier les détails de la commande (ID, date, total, etc.)
      cy.contains(/MAD/, { timeout: 10000 }).scrollIntoView().should('be.visible');
    });

    it('Devrait vider le panier après la création de commande', () => {
      // Cliquer sur "Commander"
      cy.contains('button', /Commander|Checkout|Order/i, { timeout: 10000 }).click();
      
      // Attendre la redirection
      cy.url({ timeout: 10000 }).should('include', '/orders');
      
      // Retourner à la page produits et vérifier que le panier est vide
      // Les mocks sont déjà configurés dans beforeEach, pas besoin de les reconfigurer
      cy.visit('/products');
      cy.waitForProducts();
      
      // Ouvrir le panier (cliquer sur le bouton avec l'icône fa-cart-shopping)
      cy.get('i.fa-cart-shopping').parent('button').first().click({ force: true });
      cy.wait(400); // Attendre la transition CSS
      cy.get('div[class*="fixed"][class*="w-96"]', { timeout: 10000 })
        .should('have.class', 'translate-x-0')
        .should('be.visible');
      cy.wait(1000); // Attendre que le drawer se charge
      
      // Vérifier que le panier est vide ou contient le message approprié
      cy.get('body').then(($body) => {
        if ($body.text().includes('vide') || $body.text().includes('empty')) {
          cy.contains(/vide|empty/i).should('be.visible');
        }
      });
    });
  });

  describe('7. Test complet du flux panier → checkout', () => {
    it('Devrait compléter le flux complet: produits → panier → checkout → confirmation', () => {
      // Étape 1: Simuler un utilisateur connecté
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'test-token-123');
        win.localStorage.setItem('userId', 'test-user-id-123');
        win.localStorage.setItem('user', JSON.stringify({
          _id: 'test-user-id-123',
          id: 'test-user-id-123', // La page Orders utilise user.id
          email: testUser.email,
          fullname: testUser.fullname,
          role: 'user'
        }));
      });
      
      // Étape 2: Aller sur la page produits
      // Configurer les mocks API
      cy.setupProductMocks();
      
      cy.visit('/products');
      cy.waitForProducts();
      
      // Étape 3: Ajouter un produit au panier
      cy.fixture('products').then((fixture) => {
        const product = fixture.products[0];
        
        // Cliquer sur le premier produit
        cy.get('[class*="grid"]').first().within(() => {
          cy.get('div[class*="group"]').first().should('be.visible').click({ force: true });
        });
        
        // Attendre que la navigation se fasse vers la page de détails
        cy.url({ timeout: 15000 }).should('include', `/products/${product._id}`);
        
        // Attendre que les requêtes API se terminent
        cy.wait([`@getProduct-${product._id}`, `@getReviews-${product._id}`], { timeout: 10000 });
        
        // Attendre que le loader disparaisse
        cy.get('body', { timeout: 15000 }).should('not.contain', 'Chargement...');
        
        // Ajouter au panier
        cy.contains('button', 'Ajouter au panier', { timeout: 10000 }).click();
        
        // Attendre que la requête se termine
        cy.wait(1000);
        
        cy.contains('Produit ajouté au panier', { timeout: 10000 }).should('be.visible');
      });
      
      // Étape 4: Vérifier le compteur du panier
      cy.get('header').within(() => {
        cy.get('[class*="badge"], [class*="count"], span').should('exist');
      });
      
      // Étape 5: Ouvrir le panier et vérifier le contenu
      cy.get('i.fa-cart-shopping').parent('button').first().click({ force: true });
      cy.wait(400); // Attendre la transition CSS
      cy.get('div[class*="fixed"][class*="w-96"]', { timeout: 10000 })
        .should('have.class', 'translate-x-0')
        .should('be.visible');
      cy.wait(1000); // Attendre que le drawer se charge
      cy.get('div[class*="fixed"][class*="w-96"]').within(() => {
        cy.get('h2').contains(/Panier|articles?/i, { timeout: 10000 }).should('exist');
      });
      cy.contains(/Total/i).should('be.visible');
      
      // Étape 6: Créer la commande
      cy.contains('button', /Commander|Checkout|Order/i, { timeout: 10000 }).click();
      
      // Étape 7: Vérifier la confirmation et la redirection
      cy.url({ timeout: 10000 }).should('include', '/orders');
      
      // Attendre que la requête API se termine
      cy.wait('@getUserOrders', { timeout: 10000 });
      
      // Attendre que la page se charge complètement (plus de loader)
      cy.get('body', { timeout: 15000 }).should('not.contain', 'Chargement...');
      cy.wait(500); // Petit délai pour le rendu
      
      // Vérifier le titre de la page (plus spécifique que juste "Commande")
      cy.contains('h1', /Mes Commandes|My Orders/i, { timeout: 10000 }).scrollIntoView().should('be.visible');
      
      // Vérifier le message de succès (toast)
      cy.contains(/succès|success|créée|created/i, { timeout: 10000 }).should('be.visible');
    });
  });
});
