# Guide de Déploiement sur Vercel

## 📋 Prérequis

1. Compte Vercel (gratuit) : [https://vercel.com](https://vercel.com)
2. Repository GitHub connecté
3. Backend déployé (Azure ou autre)

## 🚀 Déploiement Manuel (Première fois)

### Étape 1 : Créer un projet sur Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Cliquez sur **"Add New Project"**
3. Importez votre repository GitHub
4. Configurez le projet :
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Étape 2 : Configurer les Variables d'Environnement

Dans Vercel Project Settings → Environment Variables, ajoutez :

```
VITE_BACKEND_URL=https://your-backend-api.azurewebsites.net/api
VITE_BACKEND_BASE_URL=https://your-backend-api.azurewebsites.net
VITE_ENV=production
```

### Étape 3 : Déployer

1. Cliquez sur **"Deploy"**
2. Attendez la fin du déploiement
3. Votre site sera disponible sur `https://your-project.vercel.app`

## 🔄 Déploiement Automatique (CI/CD)

### Configuration GitHub Secrets

Pour activer le déploiement automatique via GitHub Actions, ajoutez ces Secrets :

1. Allez sur GitHub → Settings → Secrets and variables → Actions
2. Ajoutez :
   - `VERCEL_TOKEN` : Vercel API Token
   - `VERCEL_ORG_ID` : Vercel Organization ID
   - `VERCEL_PROJECT_ID` : Vercel Project ID
   - `VITE_BACKEND_URL` : URL de votre backend
   - `VITE_BACKEND_BASE_URL` : URL de base de votre backend

### Comment obtenir les Secrets Vercel

1. **VERCEL_TOKEN** :
   - Vercel Dashboard → Settings → Tokens
   - Create Token → Copiez le token

2. **VERCEL_ORG_ID** :
   - Vercel Dashboard → Settings → General
   - Copiez "Organization ID"

3. **VERCEL_PROJECT_ID** :
   - Vercel Project → Settings → General
   - Copiez "Project ID"

## 📝 Fichiers de Configuration

- `vercel.json` : Configuration Vercel
- `.vercelignore` : Fichiers à ignorer lors du déploiement
- `.github/workflows/deploy.yml` : Workflow de déploiement automatique

## ✅ Vérification

Après le déploiement, vérifiez :

1. ✅ Le site est accessible
2. ✅ Les images se chargent correctement
3. ✅ L'API backend répond
4. ✅ L'authentification fonctionne
5. ✅ Le panier fonctionne

## 🔧 Dépannage

### Erreur : Build failed
- Vérifiez les variables d'environnement
- Vérifiez que `npm run build` fonctionne localement

### Erreur : API not found
- Vérifiez `VITE_BACKEND_URL` dans Vercel Environment Variables
- Vérifiez que le backend est accessible publiquement

### Erreur : Images not loading
- Vérifiez `VITE_BACKEND_BASE_URL` dans Vercel Environment Variables
- Vérifiez les CORS settings du backend

