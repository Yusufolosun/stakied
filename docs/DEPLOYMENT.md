# Stakied Protocol - Deployment Guide

## Overview
This guide covers deploying the Stakied Protocol frontend to various platforms.

## Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Deployed smart contracts on Stacks mainnet/testnet

## Build for Production

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Create `.env.production`:

```env
VITE_NETWORK=mainnet
VITE_CONTRACT_ADDRESS=SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193
VITE_SY_TOKEN_CONTRACT=sy-token
VITE_PT_YT_CORE_CONTRACT=pt-yt-core
VITE_PT_YT_AMM_CONTRACT=pt-yt-amm
VITE_EXPLORER_URL=https://explorer.stacks.co
```

### 3. Build
```bash
npm run build
```

Output directory: `dist/`

---

## Deployment Options

### Vercel (Recommended)

#### Option 1: Vercel CLI
```bash
npm install -g vercel
vercel
```

Follow the prompts to deploy.

#### Option 2: Git Integration
1. Push code to GitHub
2. Import project to Vercel
3. Configure build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables
5. Deploy

**Live URL**: `https://stakied.vercel.app`

---

### Netlify

#### Option 1: Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### Option 2: Git Integration
1. Push code to GitHub
2. New site from Git on Netlify
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables
5. Deploy

**Build Settings**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/stakied"
}
```

3. Update `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/stakied/',
  // ... other config
})
```

4. Deploy:
```bash
npm run deploy
```

---

### IPFS (Decentralized)

#### Using Fleek
1. Sign up at [fleek.co](https://fleek.co)
2. Connect GitHub repository
3. Configure build:
   - Framework: Vite
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy

#### Using Pinata
1. Build the project
2. Upload `dist/` folder to Pinata
3. Get IPFS hash
4. Access via: `https://gateway.pinata.cloud/ipfs/YOUR_HASH`

#### Using IPFS CLI
```bash
npm run build
ipfs add -r dist/
```

---

## Custom Domain

### Vercel
1. Go to Project Settings > Domains
2. Add your domain
3. Configure DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Netlify
1. Go to Domain Settings
2. Add custom domain
3. Configure DNS:
   ```
   Type: A
   Name: @
   Value: 75.2.60.5
   
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

---

## Environment-Specific Builds

### Development
```bash
npm run dev
```

### Staging
```bash
cp .env.staging .env
npm run build
```

### Production
```bash
cp .env.production .env
npm run build
```

---

## Performance Optimization

### Code Splitting
Vite automatically code-splits. For manual splitting:

```typescript
const Analytics = lazy(() => import('./pages/Analytics'))
```

### Asset Optimization
Images are automatically optimized. For additional optimization:

```bash
npm install -D vite-plugin-imagemin
```

### Bundle Analysis
```bash
npm run build -- --report
```

---

## Continuous Deployment

### GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/dist
```

---

## Monitoring

### Analytics
Add to `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
```

### Error Tracking
Install Sentry:

```bash
npm install @sentry/react
```

Configure in `main.tsx`:

```typescript
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN'
})
```

---

## Troubleshooting

### Build Fails
- Clear cache: `rm -rf node_modules .vite && npm install`
- Check Node version: `node --version`
- Verify env variables are set

### Routing Issues (404)
Add redirect rules for SPA:

**Netlify** (`_redirects` in `public/`):
```
/* /index.html 200
```

**Vercel** (`vercel.json`):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### Environment Variables Not Loading
- Prefix with `VITE_`
- Restart dev server after changes
- Check `.env` is in correct directory

---

## Security

### HTTPS
All platforms provide automatic HTTPS. Ensure:
- Force HTTPS redirects
- Update CSP headers
- Use secure cookies

### Content Security Policy
Add to `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline';">
```

---

## Post-Deployment Checklist

- [ ] Test all routes
- [ ] Verify wallet connection works
- [ ] Test contract interactions
- [ ] Check analytics tracking
- [ ] Verify mobile responsiveness
- [ ] Test dark mode
- [ ] Check load times
- [ ] Verify SSL certificate
- [ ] Test error pages
- [ ] Check SEO meta tags

---

## Support

For deployment issues:
- Check logs in platform dashboard
- Review [frontend documentation](./FRONTEND_GUIDE.md)
- Open issue on GitHub
