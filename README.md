# E-Market 🛒

Une plateforme e-commerce complète avec API REST (Node.js/Express) et interface utilisateur (React).

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API Documentation](#api-documentation)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Structure du projet](#structure-du-projet)
- [Contribution](#contribution)

## ✨ Fonctionnalités

- 🔐 **Authentification & Autorisation** (JWT)
- 👥 **Gestion des utilisateurs** (CRUD, rôles)
- 📦 **Gestion des produits** (CRUD, upload d'images)
- 🏷️ **Gestion des catégories**
- 🛒 **Panier d'achat** (authentifié et invité)
- 📝 **Système de commandes**
- ⭐ **Système d'avis et notes**
- 🎫 **Système de coupons de réduction**
- 🚀 **Cache Redis** pour les performances
- 📊 **Logging avancé** avec Winston
- 🔒 **Rate limiting** et sécurité
- 📚 **Documentation Swagger**
- ✅ **Tests unitaires et d'intégration** (Backend & Frontend)
- 🎨 **Interface utilisateur moderne** (React)
- 📱 **Design responsive** (Mobile-first)
- 🎯 **Dashboard Admin** complet avec statistiques
- 🏪 **Dashboard Seller** pour la gestion des produits

## 🛠️ Technologies utilisées

### Backend

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **Redis** - Cache en mémoire

### Frontend

- **React** - Bibliothèque UI
- **React Router** - Navigation
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **Axios** - Client HTTP
- **React Hook Form** - Gestion de formulaires
- **Recharts** - Graphiques et visualisations
- **React Icons** - Bibliothèque d'icônes
- **React Toastify** - Notifications toast

### Authentification & Sécurité

- **JWT** - JSON Web Tokens
- **bcryptjs** - Hachage des mots de passe
- **Rate limiting** - Protection contre les attaques

### Outils de développement

- **Nodemon** - Rechargement automatique
- **Swagger** - Documentation API
- **Winston** - Logging
- **Multer** - Upload de fichiers
- **Yup** - Validation des données

### Tests

**Backend:**
- **Mocha** - Framework de test
- **Chai** - Assertions
- **Supertest** - Tests HTTP
- **C8** - Couverture de code

**Frontend:**
- **Jest** - Framework de test
- **React Testing Library** - Tests de composants React
- **MSW** - Mock Service Worker pour mocker les APIs

## 📋 Prérequis

- Node.js (v16 ou supérieur)
- MongoDB (v4.4 ou supérieur)
- Redis (v6 ou supérieur)
- npm ou yarn

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/Ayoub-fetti/EmarketAPI.git
cd EmarketAPI
```

### 2. Installation Backend

```bash
cd backend
npm install
cp .env.example .env
```

### 3. Installation Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

## ⚙️ Configuration

### Backend (.env)

```env
# Server
PORT=3000

# Database (MongoDB)
DB_URI=mongodb://127.0.0.1:27017/emarket_db
DB_URI_TEST=mongodb://127.0.0.1:27017/emarket_test_db

# JWT
JWT_SECRET=votre_jwt_secret_super_securise

# Redis
REDIS_URL=redis://localhost:6379
```

### Frontend (.env)

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api

# Frontend URL
VITE_FRONTEND_URL=http://localhost:5173
```

### Services requis

MongoDB

```
# Installation sur Ubuntu/Debian
sudo apt-get install mongodb

# Démarrer MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

Redis

```
# Installation sur Ubuntu/Debian
sudo apt-get install redis-server

# Démarrer Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## 🎯 Utilisation

### Démarrer le Backend

```bash
cd backend
npm run dev
# ou
npm run devStart
```

### Démarrer le Frontend

```bash
cd frontend
npm run dev
```

### URLs d'accès

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000/api
- **Documentation Swagger** : http://localhost:3000/api/docs

### Initialiser les données

```bash
cd backend
npm run seed
```

## 🎨 Interface Utilisateur

### Page d'accueil - Hero Section

La page d'accueil présente une **Hero Section** moderne et attrayante avec une image inspirante :

![Hero Section - FastShop](frontend/public/image.png)

**Caractéristiques de la Hero Section :**

**Fichiers associés :**
- Image Hero : `frontend/public/image.png`
- Composant : `frontend/src/pages/Home.jsx`

## 📁 Structure du projet

```
E-Market/
├── backend/                    # API REST (Node.js/Express)
│   ├── config/                 # Configuration (DB, Logger, Swagger, etc.)
│   ├── controllers/            # Contrôleurs pour chaque ressource
│   ├── models/                 # Modèles Mongoose avec plugins
│   ├── routes/                 # Routes API
│   ├── services/               # Services métier
│   ├── middlewares/            # Middlewares (auth, validation, cache, etc.)
│   ├── validations/            # Schémas de validation Yup
│   ├── factories/              # Factories pour les tests
│   ├── events/                 # Event emitters/listeners
│   ├── jobs/                   # Tâches cron (notifications stock)
│   ├── seeders/                # Scripts de seeding
│   ├── test/                   # Tests (unitaires et intégration)
│   ├── uploads/                # Fichiers uploadés
│   └── server.js               # Point d'entrée
│
└── frontend/                   # Interface utilisateur (React)
    ├── src/
    │   ├── components/         # Composants réutilisables
    │   │   ├── admin/          # Composants Admin Dashboard
    │   │   ├── seller/         # Composants Seller Dashboard
    │   │   └── tools/          # Composants utilitaires
    │   ├── pages/              # Pages de l'application
    │   │   ├── admin/          # Pages Admin Dashboard
    │   │   └── seller/         # Pages Seller Dashboard
    │   ├── layouts/            # Layouts (Admin, Seller)
    │   ├── services/           # Services API
    │   │   └── admin/          # Services Admin
    │   ├── routes/             # Configuration des routes
    │   ├── context/            # Context API (Auth, Cart)
    │   ├── tests/              # Tests (unitaires et intégration)
    │   │   ├── admin/          # Tests Admin Dashboard
    │   │   ├── forms/          # Tests formulaires
    │   │   ├── hooks/          # Tests hooks
    │   │   └── logic/          # Tests logique métier
    │   └── main.jsx            # Point d'entrée
    └── package.json
```

## 🧪 Tests

### Backend Tests

```bash
cd backend

# Tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Tous les tests
npm run test:all

# Tests avec couverture de code
npm run coverage
```

### Frontend Tests

```bash
cd frontend

# Tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture de code
npm run test:coverage

# Tests spécifiques (ex: Admin Dashboard)
npm test -- --testPathPatterns="admin"

# Tests d'intégration
npm test -- --testPathPatterns="integration"
```

### Types de tests

**Backend:**
- Tests unitaires (Mocha + Chai)
- Tests d'intégration (Supertest)
- Couverture de code (C8)

**Frontend:**
- Tests unitaires (Jest + React Testing Library)
- Tests d'intégration (Admin Dashboard)
- Tests de composants
- Tests de hooks et logique métier

## 👥 Auteurs

- **Ibrahim Lmlilas**
- **Ayoub Fetti**
- **Mohamed Boukab**
