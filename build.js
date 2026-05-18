/**
 * GEO503 — Build Script v3
 * Nouveautés : nouveau nom GEO503, sitemap.xml dynamique, robots.txt,
 * pages légales (mentions, confidentialité, cookies, CGU, contact),
 * nouveau popup audit, nouvelle bannière cookies flottante,
 * suppression "Newsletter" de la navbar, support CMS pages.
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const DOMAIN = 'https://geo503.com';
const SITE_NAME = 'GEO503';

// ── Front-matter parser ──
function parseFM(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, content: raw };
  const d = {};
  m[1].split('\n').forEach(line => {
    const i = line.indexOf(':');
    if (i < 0) return;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (v === 'true') v = true;
    else if (v === 'false') v = false;
    else if (typeof v === 'string' && v.startsWith('['))
      v = v.slice(1,-1).split(',').map(x => x.trim().replace(/^['"]|['"]$/g,''));
    d[k] = v;
  });
  return { data: d, content: m[2] };
}

// ── Markdown → HTML ──
function md2html(md) {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^([^<\n].+)$/gm, m => `<p>${m}</p>`)
    .replace(/<p><\/p>/g, '');
}

function fdate(s) {
  if (!s) return '';
  return new Date(s).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
}

function today() {
  return new Date().toISOString().split('T')[0];
}

// ── Settings ──
let cfg = { site_name: SITE_NAME, hero_stats: { articles_count:'340+', professionals_count:'22K', engines_count:'8 IA' } };
try { cfg = { ...cfg, ...JSON.parse(fs.readFileSync('_data/settings.json','utf8')) }; } catch(e) {}

// ── Articles ──
if (!fs.existsSync('_articles')) fs.mkdirSync('_articles', { recursive: true });
const arts = fs.readdirSync('_articles').filter(f => f.endsWith('.md')).map(file => {
  const { data: d, content: c } = parseFM(fs.readFileSync(path.join('_articles', file), 'utf8'));
  return {
    slug: file.replace('.md',''),
    title: d.title || 'Sans titre',
    date: d.date || '',
    category: d.category || 'GEO',
    reading_time: d.reading_time || '5 min',
    excerpt: d.excerpt || '',
    cover_image: d.cover_image || 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=700&q=72&fm=webp',
    cover_alt: d.cover_alt || d.title || '',
    featured: d.featured === true || d.featured === 'true',
    tags: Array.isArray(d.tags) ? d.tags : [],
    html: md2html(c),
    raw_date: d.date || '2025-01-01',
  };
}).sort((a,b) => new Date(b.raw_date) - new Date(a.raw_date));

// ── Pages légales ──
if (!fs.existsSync('_pages')) fs.mkdirSync('_pages', { recursive: true });
const legalPages = fs.existsSync('_pages')
  ? fs.readdirSync('_pages').filter(f => f.endsWith('.md')).map(file => {
      const { data: d, content: c } = parseFM(fs.readFileSync(path.join('_pages', file), 'utf8'));
      return { slug: d.slug || file.replace('.md',''), title: d.title || 'Page', html: md2html(c) };
    })
  : [];

// ══════════════════════════════════════════
// PARTIALS
// ══════════════════════════════════════════

const HEAD = (title, desc='', canonical='') => `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
  <meta name="description" content="${desc || `${SITE_NAME} — Le média de référence sur le GEO et le SEO pour les intelligences artificielles.`}"/>
  <meta name="robots" content="index, follow"/>
  ${canonical ? `<link rel="canonical" href="${canonical}"/>` : ''}
  <meta property="og:title" content="${title}"/>
  <meta property="og:description" content="${desc}"/>
  <meta property="og:type" content="website"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap" media="print" onload="this.media='all'"/>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" media="print" onload="this.media='all'"/>
  <link rel="stylesheet" href="/css/style.css"/>
  <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
</head>
<body>`;

// ── NAVBAR sans Newsletter ──
const NAVBAR = (active='') => `
<nav class="navbar navbar-expand-lg" role="navigation" aria-label="Navigation principale">
  <div class="container">
    <a class="brand" href="/" aria-label="${SITE_NAME} — Accueil">
      <div class="brand-icon" aria-hidden="true">G5</div>
      GEO<em>503</em>
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav"
            aria-controls="nav" aria-expanded="false" aria-label="Menu">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="nav">
      <ul class="navbar-nav ms-auto gap-lg-1" role="list">
        <li class="nav-item"><a class="nav-link${active==='geo'?' active':''}" href="/geo/">GEO <span class="nav-badge">NEW</span></a></li>
        <li class="nav-item"><a class="nav-link${active==='seo'?' active':''}" href="/seo/">SEO</a></li>
        <li class="nav-item"><a class="nav-link${active==='outils'?' active':''}" href="/outils/">Outils</a></li>
        <li class="nav-item"><a class="nav-link${active==='etudes-de-cas'?' active':''}" href="/etudes-de-cas/">Études de cas</a></li>
      </ul>
      <a href="/#newsletter" class="btn-nav ms-lg-3 mt-2 mt-lg-0">Newsletter GEO</a>
    </div>
  </div>
</nav>`;

const FOOTER = () => `
<footer class="site-footer pt-5 pb-0">
  <div class="container">
    <div class="row g-4 pb-5">
      <div class="col-lg-4">
        <div class="f-brand">GEO<em>503</em></div>
        <p class="f-desc">Le média de référence sur le GEO (Generative Engine Optimization) et le SEO pour maximiser votre visibilité dans les intelligences artificielles.</p>
        <div class="social-row">
          <a href="#" class="soc" aria-label="Twitter / X">𝕏</a>
          <a href="#" class="soc" aria-label="LinkedIn">in</a>
          <a href="#" class="soc" aria-label="YouTube">yt</a>
          <a href="#" class="soc" aria-label="RSS">⊞</a>
        </div>
      </div>
      <div class="col-6 col-lg-2">
        <div class="f-heading">Thématiques</div>
        <ul class="f-links">
          <li><a href="/geo/">GEO</a></li>
          <li><a href="/seo/">SEO</a></li>
          <li><a href="/outils/">Outils</a></li>
          <li><a href="/etudes-de-cas/">Études de cas</a></li>
        </ul>
      </div>
      <div class="col-6 col-lg-2">
        <div class="f-heading">Moteurs IA</div>
        <ul class="f-links">
          <li><a href="#">ChatGPT</a></li>
          <li><a href="#">Perplexity</a></li>
          <li><a href="#">Gemini / SGE</a></li>
          <li><a href="#">Claude</a></li>
          <li><a href="#">Grok</a></li>
        </ul>
      </div>
      <div class="col-lg-4">
        <div class="f-heading">Légal</div>
        <ul class="f-links">
          <li><a href="/mentions-legales/">Mentions légales</a></li>
          <li><a href="/politique-de-confidentialite/">Politique de confidentialité</a></li>
          <li><a href="/gestion-des-cookies/">Gestion des cookies</a></li>
          <li><a href="/cgu/">CGU</a></li>
          <li><a href="/contact/">Contact rédaction</a></li>
        </ul>
      </div>
    </div>
    <div class="f-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
      <span>© ${new Date().getFullYear()} GEO503. Tous droits réservés.</span>
      <span>Paris · Tunis · Montréal</span>
    </div>
  </div>
</footer>`;

const NL = () => `
<section class="nl-section" id="newsletter">
  <div class="container">
    <div class="row align-items-center g-4 nl-inner">
      <div class="col-lg-5">
        <div class="s-label" style="color:rgba(255,255,255,.5)">— Newsletter hebdomadaire</div>
        <div class="nl-title">La veille GEO &amp; SEO dans votre boîte mail</div>
        <p class="nl-sub">Chaque semaine : les dernières mises à jour des moteurs IA, les stratégies GEO qui marchent et les études de cas exclusives.</p>
      </div>
      <div class="col-lg-7">
        <div class="nl-form">
          <label for="nl-e" class="visually-hidden">E-mail</label>
          <input type="email" id="nl-e" class="nl-input" placeholder="Votre e-mail professionnel..." autocomplete="email"/>
          <button class="nl-btn" type="submit">Rejoindre →</button>
        </div>
        <p class="nl-notice">+22 000 professionnels abonnés · Désinscription en 1 clic · <a href="/politique-de-confidentialite/">Confidentialité</a></p>
      </div>
    </div>
  </div>
</section>`;

// ── NOUVEAU POPUP — Audit GEO ──
const POPUP = () => `
<div class="pop-overlay" id="popOverlay" role="dialog" aria-modal="true" aria-labelledby="popTitle" aria-hidden="true">
  <div class="pop-box pop-audit">
    <button class="pop-close" id="closePop" aria-label="Fermer la popup">✕</button>
    <div class="pop-audit-left">
      <div class="pop-audit-badge">🎯 Offre exclusive</div>
      <h2 id="popTitle" class="pop-audit-title">Obtenez votre audit GEO personnalisé</h2>
      <p class="pop-audit-desc">Réalisé par un expert sous <strong>72 heures</strong> — <span class="pop-audit-free">gratuitement</span></p>
      <ul class="pop-audit-list">
        <li>✓ Analyse de votre visibilité dans ChatGPT, Perplexity & Gemini</li>
        <li>✓ Recommandations GEO actionnables</li>
        <li>✓ Rapport personnalisé PDF</li>
      </ul>
      <button class="pop-cta-btn" id="popCtaBtn">Obtenir mon audit gratuit →</button>
      <button class="pop-skip" id="skipPop">Non merci, je refuse cet avantage</button>
    </div>
  </div>
</div>

<!-- FORMULAIRE AUDIT (page dédiée) -->
<div class="pop-overlay" id="auditFormOverlay" role="dialog" aria-modal="true" aria-labelledby="auditFormTitle" aria-hidden="true">
  <div class="pop-box" style="max-width:480px">
    <div class="pop-head">
      <h2 id="auditFormTitle" style="margin:0;font-family:var(--font-head);font-size:1rem;font-weight:800;color:var(--w)">
        📋 Votre audit GEO gratuit
      </h2>
      <button class="pop-close" id="closeAuditForm" aria-label="Fermer">✕</button>
    </div>
    <div class="pop-body">
      <p style="font-size:.83rem;color:var(--w3);margin-bottom:1.2rem">Remplissez ce formulaire — un expert vous contacte sous 72h.</p>
      <label for="af-name" style="font-size:.72rem;letter-spacing:1px;text-transform:uppercase;color:var(--w3);display:block;margin-bottom:.3rem">Nom et prénom *</label>
      <input type="text" id="af-name" class="pop-input" placeholder="Jean Dupont" autocomplete="name" required/>
      <label for="af-tel" style="font-size:.72rem;letter-spacing:1px;text-transform:uppercase;color:var(--w3);display:block;margin-bottom:.3rem">Téléphone *</label>
      <input type="tel" id="af-tel" class="pop-input" placeholder="+33 6 00 00 00 00" autocomplete="tel" required/>
      <label for="af-email" style="font-size:.72rem;letter-spacing:1px;text-transform:uppercase;color:var(--w3);display:block;margin-bottom:.3rem">E-mail *</label>
      <input type="email" id="af-email" class="pop-input" placeholder="vous@entreprise.com" autocomplete="email" required/>
    </div>
    <div class="pop-footer" style="flex-direction:column;gap:8px;align-items:stretch">
      <button class="btn-primary-r" id="auditSubmit" style="font-size:.8rem;padding:.75rem 1.5rem;text-align:center">
        Envoyer ma demande →
      </button>
      <p id="auditMsg" style="font-size:.72rem;color:var(--w3);text-align:center;margin:0;min-height:1.2em"></p>
    </div>
  </div>
</div>`;

// ── NOUVELLE BANNIÈRE COOKIES flottante ──
const COOKIE_BANNER = () => `
<div class="ck-banner" id="ckBanner" role="alertdialog" aria-live="polite" aria-label="Consentement aux cookies">
  <div class="ck-inner">
    <div class="ck-left">
      <div class="ck-title">
        <span class="ck-emoji">🍪</span>
        Nous respectons votre vie privée
      </div>
      <p class="ck-desc">
        GEO503 utilise des cookies analytiques pour améliorer votre expérience et mesurer notre audience.
        En cliquant "Tout accepter", vous consentez à leur utilisation.
        <a href="/gestion-des-cookies/" class="ck-link">En savoir plus</a>
      </p>
    </div>
    <div class="ck-actions">
      <button class="ck-decline" id="ckDecline">Refuser</button>
      <button class="ck-accept" id="ckAccept">Tout accepter</button>
    </div>
  </div>
</div>`;

// Formulaire caché — Netlify Forms détection
const NETLIFY_FORM_HIDDEN = () => `
<form name="audit-geo" netlify netlify-honeypot="bot-field" hidden>
  <input name="name" type="text"/>
  <input name="tel" type="tel"/>
  <input name="email" type="email"/>
</form>`;

const SCRIPTS = () => `
${NETLIFY_FORM_HIDDEN()}
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>
<script src="/js/script.js" defer></script>
<script>
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", u => {
      if (!u) window.netlifyIdentity.on("login", () => { document.location.href = "/admin/"; });
    });
  }
</script>
</body></html>`;

// ── Article cards ──
const ACARD = a => `
<article class="acard">
  <div class="acard-img">
    <img src="${a.cover_image}" alt="${a.cover_alt}" loading="lazy" decoding="async" width="500" height="281"/>
    <span class="acard-cat">${a.category}</span>
    <span class="acard-reading">${a.reading_time}</span>
  </div>
  <div class="acard-body">
    <div class="acard-meta"><span>${fdate(a.date)}</span></div>
    <h3 class="acard-title">${a.title}</h3>
    <p class="acard-excerpt">${a.excerpt}</p>
    <a href="/articles/${a.slug}" class="acard-link">Lire</a>
  </div>
</article>`;

const FCARD = a => `
<article class="fcard mb-4">
  <div class="fcard-img">
    <img src="${a.cover_image}" alt="${a.cover_alt}" loading="lazy" decoding="async" width="700" height="525"/>
  </div>
  <div class="fcard-body">
    <span class="fcard-cat">${a.category}</span>
    <div class="fcard-meta"><span>${fdate(a.date)}</span><span>${a.reading_time} de lecture</span></div>
    <h3 class="fcard-title">${a.title}</h3>
    <p class="fcard-excerpt">${a.excerpt}</p>
    <a href="/articles/${a.slug}" class="btn-primary-r" style="width:fit-content;font-size:.73rem;padding:.6rem 1.3rem">Lire →</a>
  </div>
</article>`;

// ── Sidebar ──
const cc = cat => arts.filter(a => a.category === cat).length;
const SIDEBAR = (all, slug='') => {
  const mini = all.filter(a => a.slug !== slug).slice(0,3);
  const tags = [...new Set(all.flatMap(a => a.tags))].slice(0,12);
  const dt = ['GEO','LLMO','SEO','ChatGPT','Perplexity','Schema.org','E-E-A-T','Gemini','AI Overviews','JSON-LD'];
  return `<aside class="col-lg-4" aria-label="Sidebar">
    <div class="widget">
      <div class="widget-title">Rechercher</div>
      <div class="s-box" role="search">
        <label for="s-inp" class="visually-hidden">Recherche</label>
        <input type="search" id="s-inp" placeholder="GEO, Perplexity, LLMO..."/>
        <button type="submit" aria-label="Rechercher">⌕</button>
      </div>
    </div>
    <div class="widget">
      <div class="widget-title">Catégories</div>
      <ul class="f-links" style="padding:0;list-style:none">
        <li style="padding:.4rem 0;border-bottom:1px solid rgba(255,255,255,.05)"><a href="/geo/" style="color:var(--w2);text-decoration:none;font-size:.85rem">GEO <span style="color:var(--w3)">(${cc('GEO')})</span></a></li>
        <li style="padding:.4rem 0;border-bottom:1px solid rgba(255,255,255,.05)"><a href="/seo/" style="color:var(--w2);text-decoration:none;font-size:.85rem">SEO <span style="color:var(--w3)">(${cc('SEO')})</span></a></li>
        <li style="padding:.4rem 0;border-bottom:1px solid rgba(255,255,255,.05)"><a href="/outils/" style="color:var(--w2);text-decoration:none;font-size:.85rem">Outils <span style="color:var(--w3)">(${cc('Outils')})</span></a></li>
        <li style="padding:.4rem 0"><a href="/etudes-de-cas/" style="color:var(--w2);text-decoration:none;font-size:.85rem">Études de cas <span style="color:var(--w3)">(${cc('Études de cas')})</span></a></li>
      </ul>
    </div>
    ${mini.length > 0 ? `<div class="widget"><div class="widget-title">Articles récents</div>${mini.map(a => `
    <div class="mini-post">
      <div class="mini-img"><img src="${a.cover_image}" alt="${a.cover_alt}" loading="lazy" decoding="async" width="58" height="58"/></div>
      <div>
        <div class="mini-cat">${a.category}</div>
        <a href="/articles/${a.slug}" style="text-decoration:none"><div class="mini-title">${a.title}</div></a>
        <div class="mini-date">${fdate(a.date)}</div>
      </div>
    </div>`).join('')}</div>` : ''}
    <div class="widget">
      <div class="widget-title">Tags</div>
      <div class="tag-cloud">${(tags.length > 0 ? tags : dt).map(t => `<a href="#" class="tag">${t}</a>`).join('')}</div>
    </div>
  </aside>`;
};

// ══════════════════════════════════════════
// PAGE LÉGALE GÉNÉRIQUE
// ══════════════════════════════════════════
function buildLegal(slug, title, htmlContent) {
  const breadcrumb = title;
  const html = `${HEAD(`${title} — ${SITE_NAME}`, title, `${DOMAIN}/${slug}/`)}
${NAVBAR()}
<section style="background:var(--n1);padding:3.5rem 0 2rem">
  <div class="container">
    <nav aria-label="Fil d'Ariane" style="margin-bottom:1rem">
      <a href="/" style="color:var(--r2);text-decoration:none;font-size:.72rem;letter-spacing:1px;text-transform:uppercase">Accueil</a>
      <span style="color:var(--w3);margin:0 .5rem">›</span>
      <span style="color:var(--w3);font-size:.72rem;letter-spacing:1px;text-transform:uppercase">${breadcrumb}</span>
    </nav>
    <h1 style="font-family:var(--font-head);font-weight:800;font-size:clamp(1.8rem,4vw,2.8rem);color:var(--w);line-height:1.1;margin:.5rem 0">${title}</h1>
    <p style="color:var(--w3);font-size:.75rem;letter-spacing:1px;text-transform:uppercase;margin-top:.5rem">Dernière mise à jour : ${fdate(today())}</p>
  </div>
</section>
<section style="padding:3rem 0;background:var(--n)">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="legal-body">
          ${htmlContent}
        </div>
      </div>
    </div>
  </div>
</section>
${FOOTER()}
${COOKIE_BANNER()}
${SCRIPTS()}`;

  const dir = slug;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/index.html`, html);
  console.log(`✅ ${dir}/index.html`);
  return `${DOMAIN}/${slug}/`;
}

// ══════════════════════════════════════════
// PAGE CATALOGUE
// ══════════════════════════════════════════
function buildCatalogue({ slug, pageTitle, desc, can, active, cf, intro, empty }) {
  const list = cf ? arts.filter(a => a.category === cf) : arts;
  const html = `${HEAD(pageTitle, desc, can)}
${NAVBAR(active)}
<section style="background:var(--n1);padding:4rem 0 2.5rem">
  <div class="container">
    <nav aria-label="Fil d'Ariane" style="margin-bottom:1.2rem">
      <a href="/" style="color:var(--r2);text-decoration:none;font-size:.72rem;letter-spacing:1px;text-transform:uppercase">Accueil</a>
      <span style="color:var(--w3);margin:0 .5rem">›</span>
      <span style="color:var(--w3);font-size:.72rem;letter-spacing:1px;text-transform:uppercase">${cf||'Articles'}</span>
    </nav>
    <div class="s-label">— Catalogue</div>
    <h1 style="font-family:var(--font-head);font-weight:800;font-size:clamp(2rem,5vw,3.5rem);color:var(--w);line-height:1.05;margin:.5rem 0 1rem;letter-spacing:-.5px">${cf||'Tous les articles'}</h1>
    <p style="font-size:.97rem;color:var(--w3);max-width:600px;line-height:1.75">${intro}</p>
    <div style="margin-top:1rem;font-size:.75rem;color:var(--w3);letter-spacing:1px;text-transform:uppercase">${list.length} article${list.length>1?'s':''} publié${list.length>1?'s':''}</div>
  </div>
</section>
<section style="padding:3rem 0;background:var(--n)">
  <div class="container">
    <div class="row g-4">
      <div class="col-lg-8">
        ${list.length > 0
          ? `<div class="row g-3">${list.map(a => `<div class="col-md-6">${ACARD(a)}</div>`).join('')}</div>`
          : `<div style="padding:3rem;text-align:center;background:var(--n1);border-radius:12px;border:1px solid rgba(255,255,255,.06)"><p style="color:var(--w3);font-size:.95rem;margin:0">${empty}</p></div>`}
      </div>
      ${SIDEBAR(arts)}
    </div>
  </div>
</section>
${NL()}${FOOTER()}${POPUP()}${COOKIE_BANNER()}${SCRIPTS()}`;

  if (!fs.existsSync(slug)) fs.mkdirSync(slug);
  fs.writeFileSync(`${slug}/index.html`, html);
  console.log(`✅ ${slug}/index.html`);
  return can;
}

// ══════════════════════════════════════════
// INDEX.HTML
// ══════════════════════════════════════════
const feat = arts.find(a => a.featured) || arts[0];
const rest = arts.filter(a => a !== feat).slice(0,5);
const mini = arts.slice(0,3);

const indexHtml = `${HEAD(`${SITE_NAME} — Expert GEO, SEO & Visibilité dans les IA`, `${SITE_NAME} est le média de référence sur le GEO (Generative Engine Optimization) et le SEO pour apparaître dans les réponses des intelligences artificielles.`, `${DOMAIN}/`)}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {"@type":"WebSite","@id":"${DOMAIN}/#website","name":"${SITE_NAME}","url":"${DOMAIN}/","inLanguage":"fr-FR"},
    {"@type":"Organization","@id":"${DOMAIN}/#org","name":"${SITE_NAME}","url":"${DOMAIN}/","foundingDate":"2024"}
  ]
}
</script>
${NAVBAR()}
<section class="hero" aria-label="Introduction">
  <div class="hero-left">
    <div class="hero-grid" aria-hidden="true"></div>
    <div class="hero-kicker"><span class="hero-kicker-dot" aria-hidden="true"></span>Le média de référence GEO &amp; SEO</div>
    <h1>Apparaissez dans<br/>les réponses des<br/><span class="highlight">IA génératives</span></h1>
    <p class="hero-desc">Le GEO (Generative Engine Optimization) redéfinit le référencement. Maîtrisez les stratégies pour être cité par ChatGPT, Perplexity, Gemini, Claude et tous les moteurs IA.</p>
    <div class="hero-cta">
      <a href="/geo/" class="btn-primary-r"><span>Explorer le GEO</span><span aria-hidden="true">→</span></a>
      <a href="/seo/" class="btn-ghost">Articles SEO</a>
    </div>
    <div class="hero-stats" aria-label="Statistiques">
      <div><div class="hstat-n">${cfg.hero_stats.articles_count}</div><div class="hstat-l">Articles publiés</div></div>
      <div><div class="hstat-n">${cfg.hero_stats.professionals_count}</div><div class="hstat-l">Professionnels</div></div>
      <div><div class="hstat-n">${cfg.hero_stats.engines_count}</div><div class="hstat-l">Moteurs couverts</div></div>
    </div>
  </div>
  <div class="hero-right">
    <img class="hero-img"
         src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=75&fm=webp"
         srcset="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=640&q=75&fm=webp 640w,https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1400&q=75&fm=webp 1400w"
         sizes="(max-width:991px)100vw,50vw" alt="Interface IA générative"
         fetchpriority="high" decoding="sync" loading="eager" width="1400" height="934"/>
    <div class="hero-img-overlay" aria-hidden="true"></div>
    <div class="hero-badge">
      <div class="hero-badge-tag">Tendance 2025</div>
      <div class="hero-badge-text">Le GEO dépasse le SEO dans 60% des requêtes informationnelles</div>
    </div>
  </div>
</section>
<div class="ticker-wrap" aria-hidden="true"><div class="ticker-inner">
  <span>GEO — Generative Engine Optimization</span><span>Apparaître dans ChatGPT</span><span>Perplexity SEO</span><span>Google AI Overviews</span><span>LLMO — LLM Optimization</span><span>Gemini Visibility</span><span>Claude Citations</span><span>Structured Data &amp; IA</span>
  <span>GEO — Generative Engine Optimization</span><span>Apparaître dans ChatGPT</span><span>Perplexity SEO</span><span>Google AI Overviews</span><span>LLMO — LLM Optimization</span><span>Gemini Visibility</span><span>Claude Citations</span><span>Structured Data &amp; IA</span>
</div></div>
<section class="geo-section" id="geo">
  <div class="container">
    <div class="s-label">— Comprendre le GEO</div>
    <h2 class="s-title">Qu'est-ce que le Generative Engine Optimization ?</h2>
    <div class="s-div"></div>
    <div class="row mb-4"><div class="col-lg-7"><p style="font-size:.92rem;color:var(--w3);line-height:1.75">Le <strong style="color:var(--w)">GEO</strong> est la discipline qui consiste à optimiser votre contenu pour être cité par les moteurs génératifs : ChatGPT, Perplexity, Gemini, Claude et Grok.</p></div></div>
    <div class="row g-3">
      <div class="col-sm-6 col-lg-3"><div class="geo-card"><div class="geo-card-icon">🧠</div><div class="geo-card-title">Autorité topique</div><p class="geo-card-text">Les LLMs favorisent les sources qui couvrent un sujet en profondeur et de façon exhaustive.</p></div></div>
      <div class="col-sm-6 col-lg-3"><div class="geo-card"><div class="geo-card-icon">📊</div><div class="geo-card-title">Données structurées</div><p class="geo-card-text">Schema.org, JSON-LD, FAQ : les IA extraient l'information depuis les balises sémantiques.</p></div></div>
      <div class="col-sm-6 col-lg-3"><div class="geo-card"><div class="geo-card-icon">🔗</div><div class="geo-card-title">E-E-A-T renforcé</div><p class="geo-card-text">Expérience, Expertise, Autorité et Fiabilité — les LLMs mesurent votre crédibilité.</p></div></div>
      <div class="col-sm-6 col-lg-3"><div class="geo-card"><div class="geo-card-icon">✍️</div><div class="geo-card-title">Contenu citable</div><p class="geo-card-text">Statistiques, définitions claires, listes formatées : les LLMs citent ce qui est facile à extraire.</p></div></div>
    </div>
    <div style="text-align:center;margin-top:2.5rem"><a href="/geo/" class="btn-primary-r">Tous les articles GEO →</a></div>
  </div>
</section>
<section style="padding:3rem 0;background:var(--n2)">
  <div class="container">
    <div class="s-label">— Moteurs IA suivis</div>
    <h2 class="s-title" style="margin-bottom:1.5rem">Les plateformes IA que nous couvrons</h2>
    <div class="ai-grid">
      <div class="ai-item"><div class="ai-logo" style="background:#10a37f">GPT</div><div class="ai-name">ChatGPT</div><div class="ai-stat">+200M users</div></div>
      <div class="ai-item"><div class="ai-logo" style="background:#1a73e8">GEM</div><div class="ai-name">Gemini</div><div class="ai-stat">Google SGE</div></div>
      <div class="ai-item"><div class="ai-logo" style="background:#6366f1">PPX</div><div class="ai-name">Perplexity</div><div class="ai-stat">Réponses web</div></div>
      <div class="ai-item"><div class="ai-logo" style="background:var(--r)">CLD</div><div class="ai-name">Claude</div><div class="ai-stat">Anthropic</div></div>
      <div class="ai-item"><div class="ai-logo" style="background:#ff6b35">GRK</div><div class="ai-name">Grok</div><div class="ai-stat">xAI / X</div></div>
      <div class="ai-item"><div class="ai-logo" style="background:#0f4c75">COP</div><div class="ai-name">Copilot</div><div class="ai-stat">Microsoft</div></div>
      <div class="ai-item"><div class="ai-logo" style="background:#2d6a4f">META</div><div class="ai-name">Meta AI</div><div class="ai-stat">Llama 3</div></div>
      <div class="ai-item"><div class="ai-logo" style="background:#7b2d8b">YOU</div><div class="ai-name">You.com</div><div class="ai-stat">IA Search</div></div>
    </div>
  </div>
</section>
<section id="articles" class="bg-n1">
  <div class="container">
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="s-label">— À la une</div>
        <h2 class="s-title">Article vedette</h2>
        <div class="s-div"></div>
        ${feat ? FCARD(feat) : '<p style="color:var(--w3)">Aucun article pour l\'instant.</p>'}
        <div class="s-label mt-4">— Articles récents</div>
        <h2 class="s-title">Dernières publications</h2>
        <div class="s-div"></div>
        ${rest.length > 0
          ? `<div class="row g-3">
               ${rest.slice(0,3).map(a=>`<div class="col-md-4">${ACARD(a)}</div>`).join('')}
               ${rest.slice(3,5).map(a=>`<div class="col-md-6">${ACARD(a)}</div>`).join('')}
             </div>`
          : '<p style="color:var(--w3);font-size:.88rem">Les articles récents apparaîtront ici.</p>'}
      </div>
      <aside class="col-lg-4" aria-label="Sidebar">
        <div class="widget mb-3" style="padding:0;overflow:hidden">
          <div class="stat-grid">
            <div class="stat-box"><div class="stat-num">68%</div><div class="stat-lbl">Requêtes avec réponse IA</div></div>
            <div class="stat-box"><div class="stat-num">3.2×</div><div class="stat-lbl">Plus de trafic via GEO</div></div>
            <div class="stat-box"><div class="stat-num">5 min</div><div class="stat-lbl">Audit GEO moyen</div></div>
            <div class="stat-box"><div class="stat-num">2024</div><div class="stat-lbl">Naissance du GEO</div></div>
          </div>
        </div>
        <div class="widget">
          <div class="widget-title">Catégories</div>
          <ul class="f-links" style="padding:0;list-style:none">
            <li style="padding:.4rem 0;border-bottom:1px solid rgba(255,255,255,.05)"><a href="/geo/" style="color:var(--w2);text-decoration:none;font-size:.85rem">GEO</a></li>
            <li style="padding:.4rem 0;border-bottom:1px solid rgba(255,255,255,.05)"><a href="/seo/" style="color:var(--w2);text-decoration:none;font-size:.85rem">SEO</a></li>
            <li style="padding:.4rem 0;border-bottom:1px solid rgba(255,255,255,.05)"><a href="/outils/" style="color:var(--w2);text-decoration:none;font-size:.85rem">Outils</a></li>
            <li style="padding:.4rem 0"><a href="/etudes-de-cas/" style="color:var(--w2);text-decoration:none;font-size:.85rem">Études de cas</a></li>
          </ul>
        </div>
        <div class="widget">
          <div class="widget-title">Glossaire GEO</div>
          <div class="glossary-item" tabindex="0" role="button" aria-expanded="false"><div class="glossary-term">GEO</div><div class="glossary-def">Generative Engine Optimization — optimisation du contenu pour apparaître dans les réponses des moteurs génératifs.</div></div>
          <div class="glossary-item" tabindex="0" role="button" aria-expanded="false"><div class="glossary-term">LLMO</div><div class="glossary-def">Large Language Model Optimization — terme alternatif au GEO.</div></div>
          <div class="glossary-item" tabindex="0" role="button" aria-expanded="false"><div class="glossary-term">E-E-A-T</div><div class="glossary-def">Experience, Expertise, Authoritativeness, Trustworthiness — critères de qualité pour les LLMs.</div></div>
          <div class="glossary-item" tabindex="0" role="button" aria-expanded="false"><div class="glossary-term">AI Overviews</div><div class="glossary-def">Fonctionnalité de Google (ex-SGE) qui génère une réponse IA en tête des résultats.</div></div>
        </div>
        ${mini.length > 0 ? `<div class="widget"><div class="widget-title">Articles populaires</div>${mini.map(a=>`<div class="mini-post"><div class="mini-img"><img src="${a.cover_image}" alt="${a.cover_alt}" loading="lazy" decoding="async" width="58" height="58"/></div><div><div class="mini-cat">${a.category}</div><div class="mini-title">${a.title}</div><div class="mini-date">${fdate(a.date)}</div></div></div>`).join('')}</div>` : ''}
        <div class="widget"><div class="widget-title">Tags</div><div class="tag-cloud">${[...new Set(arts.flatMap(a=>a.tags))].slice(0,12).map(t=>`<a href="#" class="tag">${t}</a>`).join('')||['GEO','LLMO','SEO','ChatGPT','Perplexity','Schema.org','E-E-A-T','Gemini'].map(t=>`<a href="#" class="tag">${t}</a>`).join('')}</div></div>
      </aside>
    </div>
  </div>
</section>
${NL()}${FOOTER()}${POPUP()}${COOKIE_BANNER()}${SCRIPTS()}`;

fs.writeFileSync('index.html', indexHtml);
console.log('✅ index.html');

// ══════════════════════════════════════════
// CATALOGUES
// ══════════════════════════════════════════
const sitemapUrls = [`${DOMAIN}/`];

sitemapUrls.push(buildCatalogue({ slug:'geo', pageTitle:`GEO — Generative Engine Optimization — ${SITE_NAME}`, desc:'Tous les articles GEO : stratégies et guides pour apparaître dans les réponses des moteurs IA.', can:`${DOMAIN}/geo/`, active:'geo', cf:'GEO', intro:"Tous nos articles dédiés au Generative Engine Optimization — pour être cité par ChatGPT, Perplexity, Gemini et les autres moteurs IA.", empty:'Les articles GEO arrivent bientôt. Créez votre premier article depuis le back-office en choisissant la catégorie "GEO".' }));
sitemapUrls.push(buildCatalogue({ slug:'seo', pageTitle:`SEO — Référencement naturel — ${SITE_NAME}`, desc:'Tous les articles SEO : référencement technique, optimisation on-page, link building et stratégies de visibilité.', can:`${DOMAIN}/seo/`, active:'seo', cf:'SEO', intro:"Nos articles sur le SEO traditionnel et avancé — du référencement technique aux stratégies de contenu.", empty:'Les articles SEO arrivent bientôt. Créez votre premier article depuis le back-office en choisissant la catégorie "SEO".' }));
sitemapUrls.push(buildCatalogue({ slug:'etudes-de-cas', pageTitle:`Études de cas — ${SITE_NAME}`, desc:"Études de cas GEO et SEO : analyses concrètes, résultats mesurés et recommandations actionnables.", can:`${DOMAIN}/etudes-de-cas/`, active:'etudes-de-cas', cf:'Études de cas', intro:"Des analyses concrètes et chiffrées de stratégies GEO et SEO — avec résultats et recommandations.", empty:'Les études de cas arrivent bientôt. Créez votre première étude depuis le back-office en choisissant la catégorie "Études de cas".' }));

// ── Outils ──
const outilsHtml = `${HEAD(`Outils GEO & SEO — ${SITE_NAME}`, 'Les meilleurs outils pour auditer votre visibilité GEO et analyser vos performances SEO.', `${DOMAIN}/outils/`)}
${NAVBAR('outils')}
<section style="background:var(--n1);padding:4rem 0 2.5rem">
  <div class="container">
    <nav aria-label="Fil d'Ariane" style="margin-bottom:1.2rem">
      <a href="/" style="color:var(--r2);text-decoration:none;font-size:.72rem;letter-spacing:1px;text-transform:uppercase">Accueil</a>
      <span style="color:var(--w3);margin:0 .5rem">›</span>
      <span style="color:var(--w3);font-size:.72rem;letter-spacing:1px;text-transform:uppercase">Outils</span>
    </nav>
    <div class="s-label">— Ressources</div>
    <h1 style="font-family:var(--font-head);font-weight:800;font-size:clamp(2rem,5vw,3.5rem);color:var(--w);line-height:1.05;margin:.5rem 0 1rem;letter-spacing:-.5px">Outils GEO &amp; SEO</h1>
    <p style="font-size:.97rem;color:var(--w3);max-width:600px;line-height:1.75">Les meilleurs outils pour auditer votre visibilité dans les moteurs IA, analyser vos performances SEO et optimiser votre contenu.</p>
  </div>
</section>
<section style="padding:3rem 0;background:var(--n)">
  <div class="container"><div class="row g-4">
    <div class="col-lg-8">
      <!-- ═══ ZONE PRINCIPALE — À compléter ═══ -->
      <div style="padding:3rem;text-align:center;background:var(--n1);border-radius:12px;border:1px solid rgba(255,255,255,.06)">
        <div style="font-size:2.5rem;margin-bottom:1rem">🛠️</div>
        <p style="color:var(--w3);font-size:.95rem;margin:0">Le catalogue d'outils est en cours de construction.</p>
      </div>
      <!-- ═══ FIN ZONE PRINCIPALE ═══ -->
    </div>
    ${SIDEBAR(arts)}
  </div></div>
</section>
${NL()}${FOOTER()}${POPUP()}${COOKIE_BANNER()}${SCRIPTS()}`;
if (!fs.existsSync('outils')) fs.mkdirSync('outils');
fs.writeFileSync('outils/index.html', outilsHtml);
console.log('✅ outils/index.html');
sitemapUrls.push(`${DOMAIN}/outils/`);

// ══════════════════════════════════════════
// PAGES LÉGALES
// ══════════════════════════════════════════
const legalData = [
  { slug:'mentions-legales', file:'_pages/mentions-legales.md' },
  { slug:'politique-de-confidentialite', file:'_pages/politique-de-confidentialite.md' },
  { slug:'gestion-des-cookies', file:'_pages/gestion-des-cookies.md' },
  { slug:'cgu', file:'_pages/cgu.md' },
  { slug:'contact', file:'_pages/contact.md' },
];

legalData.forEach(({ slug, file }) => {
  if (fs.existsSync(file)) {
    const { data, content } = parseFM(fs.readFileSync(file, 'utf8'));
    const url = buildLegal(slug, data.title || slug, md2html(content));
    sitemapUrls.push(url);
  }
});

// ══════════════════════════════════════════
// ARTICLES INDIVIDUELS
// ══════════════════════════════════════════
if (!fs.existsSync('articles')) fs.mkdirSync('articles');
const catPages = { 'GEO':'/geo/', 'SEO':'/seo/', 'Outils':'/outils/', 'Études de cas':'/etudes-de-cas/' };

arts.forEach(a => {
  const pg = catPages[a.category] || '/';
  const html = `${HEAD(`${a.title}`, a.excerpt, `${DOMAIN}/articles/${a.slug}/`)}
<script type="application/ld+json">
{
  "@context":"https://schema.org","@type":"Article",
  "headline":"${a.title.replace(/"/g,'&quot;')}",
  "description":"${a.excerpt.replace(/"/g,'&quot;')}",
  "datePublished":"${a.raw_date}",
  "image":"${a.cover_image}",
  "author":{"@type":"Organization","name":"${SITE_NAME}"},
  "publisher":{"@type":"Organization","name":"${SITE_NAME}","url":"${DOMAIN}/"}
}
</script>
${NAVBAR()}
<section style="background:var(--n1);padding:4rem 0 2rem">
  <div class="container"><div class="row justify-content-center"><div class="col-lg-10">
    <nav aria-label="Fil d'Ariane" style="margin-bottom:1.5rem">
      <a href="/" style="color:var(--r2);text-decoration:none;font-size:.72rem;letter-spacing:1px;text-transform:uppercase">Accueil</a>
      <span style="color:var(--w3);margin:0 .5rem">›</span>
      <a href="${pg}" style="color:var(--r2);text-decoration:none;font-size:.72rem;letter-spacing:1px;text-transform:uppercase">${a.category}</a>
      <span style="color:var(--w3);margin:0 .5rem">›</span>
      <span style="color:var(--w3);font-size:.72rem;letter-spacing:1px;text-transform:uppercase">${a.title.slice(0,40)}…</span>
    </nav>
    <span class="fcard-cat">${a.category}</span>
    <h1 style="font-family:var(--font-head);font-weight:800;font-size:clamp(1.8rem,4vw,3rem);color:var(--w);line-height:1.1;margin:1rem 0;letter-spacing:-.3px">${a.title}</h1>
    <p style="font-size:1rem;color:var(--w3);line-height:1.7;max-width:680px;margin-bottom:1.5rem">${a.excerpt}</p>
    <div style="display:flex;gap:1.5rem;font-size:.7rem;color:var(--w3);letter-spacing:1px;text-transform:uppercase;flex-wrap:wrap">
      <span>📅 ${fdate(a.date)}</span><span>⏱ ${a.reading_time} de lecture</span>
    </div>
  </div></div></div>
</section>
<div style="background:var(--n2);overflow:hidden;max-height:480px">
  <img src="${a.cover_image}" alt="${a.cover_alt}" style="width:100%;height:480px;object-fit:cover;display:block;opacity:.85" loading="lazy" decoding="async"/>
</div>
<section style="padding:4rem 0;background:var(--n)">
  <div class="container"><div class="row g-4">
    <div class="col-lg-8">
      <div class="article-body" style="font-size:.97rem;color:#111;line-height:1.8;background:#fff;padding:2rem;border-radius:4px">${a.html||'<p style="color:var(--w3)">Contenu à venir…</p>'}</div>
      ${a.tags.length>0?`<div style="margin-top:3rem;padding-top:2rem;border-top:1px solid rgba(255,255,255,.06)"><div class="widget-title" style="font-family:var(--font-head);font-size:.9rem;font-weight:700;color:var(--w);border-left:2px solid var(--r);padding-left:10px;margin-bottom:1rem">Tags</div><div class="tag-cloud">${a.tags.map(t=>`<a href="#" class="tag">${t}</a>`).join('')}</div></div>`:''}
      <div style="margin-top:2rem"><a href="${pg}" class="btn-ghost">← Retour à ${a.category}</a></div>
    </div>
    ${SIDEBAR(arts, a.slug)}
  </div></div>
</section>
${NL()}${FOOTER()}${POPUP()}${COOKIE_BANNER()}${SCRIPTS()}`;

  const dir = `articles/${a.slug}`;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/index.html`, html);
  console.log(`✅ articles/${a.slug}/index.html`);
  sitemapUrls.push(`${DOMAIN}/articles/${a.slug}/`);
});

// ══════════════════════════════════════════
// SITEMAP.XML DYNAMIQUE
// ══════════════════════════════════════════
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => {
  const isHome = url === `${DOMAIN}/`;
  const isCat  = ['/geo/','/seo/','/outils/','/etudes-de-cas/'].some(p => url.endsWith(p));
  const isArt  = url.includes('/articles/');
  const priority = isHome ? '1.0' : isCat ? '0.8' : isArt ? '0.7' : '0.5';
  const freq     = isHome ? 'daily' : isCat ? 'weekly' : isArt ? 'monthly' : 'yearly';
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${today()}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('\n')}
</urlset>`;

fs.writeFileSync('sitemap.xml', sitemap);
console.log('✅ sitemap.xml');

// ══════════════════════════════════════════
// ROBOTS.TXT
// ══════════════════════════════════════════
const robots = `User-agent: *
Allow: /

# Empêcher l'indexation du back-office et des assets
Disallow: /admin/
Disallow: /images/uploads/
Disallow: /_articles/
Disallow: /_data/
Disallow: /_pages/

# Sitemap
Sitemap: ${DOMAIN}/sitemap.xml

# Crawl-delay pour les bots secondaires
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10

User-agent: MJ12bot
Disallow: /
`;

fs.writeFileSync('robots.txt', robots);
console.log('✅ robots.txt');

console.log(`\n🚀 Build v3 terminé — ${arts.length} article(s) · 4 catalogues · 5 pages légales · sitemap · robots`);
