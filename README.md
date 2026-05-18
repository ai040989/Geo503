# GEORANK MEDIA — Déploiement Netlify + Decap CMS

## Structure du projet

```
georank-media/
├── _articles/          ← Articles Markdown (gérés par Decap CMS)
│   └── mon-article.md
├── _data/
│   └── settings.json   ← Paramètres du site (gérés par Decap CMS)
├── admin/
│   ├── config.yml      ← Configuration Decap CMS
│   └── index.html      ← Interface back-office
├── css/
│   └── style.css       ← Design GEORANK MEDIA (identique à l'original)
├── js/
│   └── script.js       ← Interactions (cookie, popup, glossaire)
├── images/
│   └── uploads/        ← Images uploadées via le CMS
├── build.js            ← Script de build (Node.js, sans dépendances)
├── netlify.toml        ← Configuration Netlify
├── package.json        ← Métadonnées projet
└── README.md           ← Ce fichier
```

## Déploiement sur Netlify (étapes)

### 1. Pousser sur GitHub
```bash
git init
git add .
git commit -m "Initial commit — GEORANK MEDIA"
git remote add origin https://github.com/VOTRE-USER/georank-media.git
git push -u origin main
```

### 2. Connecter à Netlify
1. Allez sur [app.netlify.com](https://app.netlify.com)
2. Cliquez **Add new site → Import an existing project**
3. Sélectionnez votre repo GitHub
4. Netlify détecte automatiquement `netlify.toml`
5. Cliquez **Deploy site**

### 3. Activer Netlify Identity (pour le CMS)
1. Dans votre dashboard Netlify → **Identity** → **Enable Identity**
2. Allez dans **Settings → Registration** → choisissez **Invite only**
3. Cliquez **Invite users** et entrez votre e-mail
4. Activez **Git Gateway** dans Identity → **Services**

### 4. Accéder au back-office
- URL : `https://votre-site.netlify.app/admin/`
- Acceptez l'invitation reçue par e-mail
- Créez vos articles directement depuis l'interface

## Créer un article depuis le CMS

1. Allez sur `/admin/`
2. Cliquez **Articles → New Article**
3. Remplissez : Titre, Date, Catégorie, Résumé, Image, Contenu (Markdown)
4. Cochez **Article vedette** pour l'afficher en "À la une"
5. Cliquez **Publish** → le build se déclenche automatiquement (~30s)

## Format d'un article Markdown (manuel)

Si vous préférez créer des articles directement dans `_articles/` :

```markdown
---
title: Mon titre d'article
date: 2025-04-19
category: GEO
reading_time: 8 min
excerpt: Un résumé accrocheur de 1-2 phrases.
cover_image: https://images.unsplash.com/...
cover_alt: Description de l'image
featured: false
tags: [GEO, SEO IA, Stratégie]
---

## Mon premier titre

Contenu en Markdown...
```

## Variables disponibles dans settings.json

- `site_name` : nom affiché dans le header
- `hero_stats.articles_count` : compteur "Articles publiés"
- `hero_stats.professionals_count` : compteur "Professionnels"
- `hero_stats.engines_count` : compteur "Moteurs couverts"

## Build local (optionnel)

```bash
node build.js
# Ouvre ensuite index.html dans votre navigateur
```

Aucune dépendance npm requise — le build script est 100% Node.js natif.
