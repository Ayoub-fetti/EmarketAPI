# Documentation CI/CD Pipeline

## Workflows

### 1. Pipeline CI (`ci.yml`)

Le pipeline CI s'exécute automatiquement lors de :
- Push vers les branches : `main`, `master`, `front`, `ibrahim`
- Pull Request vers les mêmes branches

**Étapes Frontend :**
1. ✅ Checkout du code
2. ✅ Configuration Node.js 20
3. ✅ Installation des dépendances (`npm ci`)
4. ✅ Exécution ESLint (`npm run lint`)
5. ✅ Exécution des tests (`npm run test:ci`)
6. ✅ Build (`npm run build`)
7. ✅ Upload du rapport de couverture en tant qu'artifact

**Étapes Backend :**
1. ✅ Checkout du code
2. ✅ Configuration Node.js 20
3. ✅ Installation des dépendances (`npm ci`)
4. ✅ Exécution ESLint (`npm run lint`)
5. ✅ Exécution des tests (`npm test`)
6. ✅ Upload du rapport de couverture en tant qu'artifact

### 2. Pipeline de Déploiement (`deploy.yml`)

Le pipeline de déploiement s'exécute lors de :
- Push vers `main`, `master`, `front`
- Ou manuellement depuis GitHub Actions

**Étapes :**
1. ✅ Checkout du code
2. ✅ Déploiement vers Vercel

## Secrets requis dans GitHub

Pour le déploiement, vous devez ajouter ces Secrets dans GitHub :
- `VERCEL_TOKEN` : Token API Vercel
- `VERCEL_ORG_ID` : ID de l'organisation Vercel
- `VERCEL_PROJECT_ID` : ID du projet Vercel

Pour les variables d'environnement :
- `VITE_BACKEND_URL` : URL de l'API Backend
- `VITE_BACKEND_BASE_URL` : URL de base du Backend

## Comment obtenir les Secrets Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Settings → Tokens → Create Token
3. Obtenez le `VERCEL_TOKEN`
4. Settings → General → Organization ID
5. Project Settings → General → Project ID

## Rapports de Couverture

Après chaque exécution CI, vous pouvez télécharger les rapports de couverture depuis :
- GitHub Actions → Artifacts → `coverage-report` (Frontend)
- GitHub Actions → Artifacts → `backend-coverage` (Backend)

