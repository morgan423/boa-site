# Déploiement — Bleu Océan Aquitaine

Site statique (HTML/CSS/JS vanilla). **Aucun build nécessaire.**

## Structure
```
.
├── index.html              landing « coming soon »
├── mentions-legales.html   page légale (RGPD/LCEN)
├── confidentialite.html    politique de confidentialité
├── styles.css              styles de la landing
├── main.js                 reveal scroll, parallaxe, soumission Brevo
├── robots.txt / sitemap.xml
├── vercel.json             headers cache + sécurité
└── assets/
    ├── logo-boa.png        logo / rose des vents (favicon + OG)
    ├── fonts.css           @font-face pour les pages légales
    └── fonts/*.woff2       Poppins 300/400/500/600 (self-hosted)
```

## 1. Déployer sur Vercel

### Option A — CLI
```bash
npm i -g vercel
cd BOA-Site
vercel            # déploiement de preview
vercel --prod     # mise en production
```
À la question « build command / output directory » : laisser vide (Other → static).

### Option B — Dashboard
1. vercel.com → **Add New… → Project**.
2. Importer le dossier (ou un repo Git le contenant).
3. Framework Preset : **Other**. Build Command : *(vide)*. Output Directory : *(vide / racine)*.
4. **Deploy**.

## 2. Domaine `bleuoceanaquitaine.fr`
Le `.fr` n'est pas vendu par Vercel → l'acheter chez **OVH** ou **Gandi**.
1. Acheter `bleuoceanaquitaine.fr` chez le registrar.
2. Vercel → projet → **Settings → Domains** → ajouter `bleuoceanaquitaine.fr` (+ `www` en redirection).
3. Chez le registrar, créer les enregistrements DNS indiqués par Vercel :
   - apex `@` → **A** `76.76.21.21`
   - `www` → **CNAME** `cname.vercel-dns.com`
   (Vercel affiche les valeurs exactes ; suivre celles-ci.)
4. HTTPS : certificat émis automatiquement par Vercel.

## 3. Formulaire Brevo — déjà câblé
- Formulaire sur-mesure aux couleurs BOA. Soumission en **JS (`fetch` + `FormData`,
  multipart/form-data)** vers l'endpoint Brevo `7a48fc85.sibforms.com/v2/serve/MUIF…`,
  qui répond en **JSON** `{ success, message }`. CORS autorisé pour le domaine.
  (⚠️ un POST `<form>` natif envoie de l'urlencoded → rejeté en 400 par Brevo ;
  c'est pourquoi l'envoi passe par `fetch`.)
- Champs envoyés : `NOM` (prénom), `EMAIL`, `locale=fr`, honeypot `email_address_check`.
- Le **double opt-in** et le RGPD restent gérés par Brevo.
- Pas de CAPTCHA activé côté Brevo → rien à autoriser. Si un CAPTCHA est ajouté
  plus tard, autoriser les domaines `sibforms.com` + `bleuoceanaquitaine.fr` côté Brevo.
- Lien direct (pour QR du stand) :
  `https://7a48fc85.sibforms.com/serve/MUIFAPKRAjIFcCsxDQTWoR3c6gM0JvXIkdXQOeiHetBb15kY2RN6Ll2O6EcyTDxDrtjCZ8KLLEbK-YHM70QzsXGbJou0abH31UlhG2bV_NY98f4gHldDnXzPg_SlS8miduPO81EG5LEw-9Jrp9eZ_lGOAQigcGwm5e69M2Ur7qz6KvqjOnJchU-jaPEP1fsTRY8bMcNae0cT17Kiwg==`

## 4. À faire AVANT de lancer la collecte
- [ ] **Remplir les `[À COMPLÉTER]`** des pages légales (identité éditeur, statut,
      SIRET, adresse, responsable de publication, e-mail de contact, durée de
      conservation). Les pages doivent être en ligne **avant** la collecte.
- [ ] Test d'inscription bout en bout : remplir le formulaire en prod →
      vérifier la réception de l'e-mail de confirmation Brevo → confirmer →
      vérifier l'apparition du contact dans la liste Brevo.
- [ ] Vérifier le rendu mobile (hero plein écran, formulaire, tags).
- [ ] (Optionnel) Remplacer `og:image` par un visuel marin de partage dédié si souhaité.
