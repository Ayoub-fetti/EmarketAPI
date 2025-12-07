# Tests E2E Cypress - Panier et Checkout

Ce dossier contient les tests end-to-end (E2E) pour l'application React, focalisés sur le panier et le processus de checkout.

## ⚠️ IMPORTANT - Avant de lancer les tests

**Vous DEVEZ démarrer le serveur frontend avant d'exécuter les tests !**

```bash
# Dans un terminal, démarrez le serveur frontend
npm run dev
```

Le serveur doit être accessible sur `http://localhost:5173` (port par défaut de Vite).

## Structure

```
cypress/
├── e2e/
│   └── cart-checkout.cy.js    # Tests principaux pour panier et checkout
├── fixtures/
│   └── testUser.json          # Données de test pour l'utilisateur
├── support/
│   ├── commands.js            # Commandes personnalisées Cypress
│   └── e2e.js                 # Configuration de support
└── README.md                  # Ce fichier
```

## Prérequis

1. **Cypress installé** : `npm install --save-dev cypress`
2. **Backend en cours d'exécution** : Le backend doit être démarré et accessible
3. **Frontend en cours d'exécution** : Lancer `npm run dev` (par défaut sur http://localhost:5173)

## Configuration

Le fichier `cypress.config.js` configure Cypress pour :
- Base URL : `http://localhost:5173` (port par défaut de Vite)
- Viewport : 1280x720
- Timeouts : 15 secondes pour les commandes et requêtes, 30 secondes pour le chargement de page

## Exécution des tests

### 1. Démarrer le serveur frontend (OBLIGATOIRE)

```bash
# Terminal 1 - Démarrer le serveur frontend
npm run dev
```

### 2. Lancer les tests

#### Mode interactif (recommandé pour le développement)
```bash
# Terminal 2 - Ouvrir Cypress
npm run cypress:open
```
Ouvre l'interface graphique de Cypress où vous pouvez sélectionner et exécuter les tests.

#### Mode headless (pour CI/CD)
```bash
# Terminal 2 - Exécuter les tests en mode headless
npm run cypress:run
# ou
npm run test:e2e
```

## Tests inclus

### 1. Navigation vers la page produits
- Vérifie que la page produits se charge correctement
- Vérifie l'affichage des produits

### 2. Ajout de produit au panier
- Teste l'ajout d'un produit depuis la page de détails
- Vérifie la notification de succès
- Vérifie la mise à jour du compteur du panier

### 3. Affichage du total et nombre d'articles
- Vérifie l'affichage du nombre d'articles dans le panier
- Vérifie l'affichage du sous-total et du total
- Teste le calcul avec plusieurs produits

### 4. Modification de la quantité
- Teste l'augmentation de la quantité
- Teste la diminution de la quantité
- Vérifie la mise à jour du total

### 5. Suppression de produit
- Teste la suppression d'un produit du panier
- Vérifie la mise à jour du total après suppression

### 6. Processus de checkout
- Teste la création d'une commande
- Vérifie la confirmation de commande
- Vérifie que le panier est vidé après checkout

### 7. Test complet du flux
- Teste le flux complet : produits → panier → checkout → confirmation

## Commandes personnalisées

Les commandes suivantes sont disponibles dans `cypress/support/commands.js` :

- `cy.login(email, password)` : Se connecter avec un email et mot de passe
- `cy.register(userData)` : Créer un nouveau compte
- `cy.clearCart()` : Vider le panier (localStorage)
- `cy.clearAuth()` : Supprimer les données d'authentification
- `cy.waitForProducts()` : Attendre que les produits soient chargés

## Données de test

Le fichier `cypress/fixtures/testUser.json` contient les données d'un utilisateur de test :
- Email : `testuser@example.com`
- Password : `Test123456!`
- Fullname : `Test User`
- Role : `user`

**Note** : Assurez-vous que cet utilisateur existe dans votre base de données de test, ou les tests créeront automatiquement un compte si nécessaire.

## Notes importantes

1. **Isolation des tests** : Chaque test nettoie le localStorage avant de commencer pour garantir l'indépendance.

2. **Sélecteurs** : Les tests utilisent des sélecteurs flexibles basés sur les classes CSS et le contenu textuel pour s'adapter aux changements de structure HTML.

3. **Timeouts** : Les timeouts sont configurés pour gérer les chargements asynchrones. Si vous rencontrez des erreurs de timeout, vous pouvez les ajuster dans `cypress.config.js`.

4. **Backend requis** : Les tests nécessitent que le backend soit en cours d'exécution et accessible. Assurez-vous que les variables d'environnement sont correctement configurées.

5. **Vérification du serveur** : Les tests vérifient automatiquement que le serveur frontend est accessible avant de commencer. Si le serveur n'est pas en cours d'exécution, vous obtiendrez un message d'erreur clair.

## Dépannage

### ❌ Erreur : "cy.visit() failed trying to load: http://localhost:5173/"

**Solution** : Le serveur frontend n'est pas en cours d'exécution.

1. Ouvrez un nouveau terminal
2. Naviguez vers le dossier frontend : `cd frontend`
3. Démarrez le serveur : `npm run dev`
4. Attendez que le serveur démarre (vous devriez voir "Local: http://localhost:5173")
5. Relancez les tests Cypress

### Les tests échouent avec "Cannot find module"
- Vérifiez que Cypress est installé : `npm install --save-dev cypress`
- Exécutez `npx cypress install` pour installer le binaire Cypress

### Les tests ne trouvent pas les éléments
- Vérifiez que l'application frontend est en cours d'exécution
- Vérifiez que vous êtes sur la bonne URL (http://localhost:5173 par défaut)
- Inspectez les sélecteurs dans les tests et ajustez-les si nécessaire

### Erreurs d'authentification
- Vérifiez que le backend est en cours d'exécution
- Vérifiez que l'utilisateur de test existe ou peut être créé
- Vérifiez les variables d'environnement pour l'URL du backend

## Améliorations futures

- [ ] Ajouter des tests pour les codes promo
- [ ] Ajouter des tests pour les erreurs de checkout
- [ ] Ajouter des tests pour le panier d'invité (sans connexion)
- [ ] Ajouter des tests de performance
- [ ] Ajouter des captures d'écran automatiques en cas d'échec
