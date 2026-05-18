'use strict';

const onIdle = window.requestIdleCallback
  ? (fn, t) => requestIdleCallback(fn, { timeout: t })
  : (fn, t) => setTimeout(fn, t);

/* ── COOKIE BANNER — haut de page, spacer dynamique ── */
onIdle(() => {
  const b       = document.getElementById('ckBanner');
  const spacer  = document.getElementById('ckSpacer');
  if (!b) return;

  const showBanner = () => {
    requestAnimationFrame(() => {
      b.classList.add('show');
      if (spacer) spacer.classList.add('active');
    });
  };
  const hideBanner = (v) => {
    localStorage.setItem('ckConsent', v);
    b.classList.remove('show');
    if (spacer) spacer.classList.remove('active');
  };

  if (!localStorage.getItem('ckConsent')) {
    setTimeout(showBanner, 500); // léger délai pour éviter flash au chargement
  }

  document.getElementById('ckAccept')?.addEventListener('click',  () => hideBanner('accepted'),  { once: true, passive: true });
  document.getElementById('ckDecline')?.addEventListener('click', () => hideBanner('declined'), { once: true, passive: true });
}, 600);

/* ── POPUP AUDIT GEO ── */
onIdle(() => {
  const overlay     = document.getElementById('popOverlay');
  const formOverlay = document.getElementById('auditFormOverlay');
  if (!overlay) return;

  const openMain = () => {
    if (sessionStorage.getItem('popSeen')) return;
    // Centre la popup dans la zone visible (viewport) actuelle — scroll-aware
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    sessionStorage.setItem('popSeen', '1');
  };
  const closeMain = () => {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
  };
  const openForm = () => {
    closeMain();
    if (!formOverlay) return;
    formOverlay.classList.add('active');
    formOverlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => document.getElementById('af-name')?.focus(), 100);
  };
  const closeForm = () => {
    if (!formOverlay) return;
    formOverlay.classList.remove('active');
    formOverlay.setAttribute('aria-hidden', 'true');
  };

  setTimeout(openMain, 4000);

  document.getElementById('closePop')?.addEventListener('click', closeMain, { passive: true });
  document.getElementById('skipPop')?.addEventListener('click', closeMain, { passive: true });
  document.getElementById('popCtaBtn')?.addEventListener('click', openForm, { passive: true });
  overlay.addEventListener('click', e => { if (e.target === overlay) closeMain(); }, { passive: true });
  document.getElementById('closeAuditForm')?.addEventListener('click', closeForm, { passive: true });
  formOverlay?.addEventListener('click', e => { if (e.target === formOverlay) closeForm(); }, { passive: true });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (overlay.classList.contains('active'))      closeMain();
    if (formOverlay?.classList.contains('active')) closeForm();
  }, { passive: true });

  /* ── Soumission formulaire → Netlify Forms ── */
  document.getElementById('auditSubmit')?.addEventListener('click', async () => {
    const name  = document.getElementById('af-name')?.value.trim();
    const tel   = document.getElementById('af-tel')?.value.trim();
    const email = document.getElementById('af-email')?.value.trim();
    const msgEl = document.getElementById('auditMsg');
    const btn   = document.getElementById('auditSubmit');

    if (!name || !tel || !email) {
      if (msgEl) { msgEl.style.color = '#ff6b6b'; msgEl.textContent = 'Veuillez remplir tous les champs.'; }
      return;
    }
    if (btn) { btn.disabled = true; btn.textContent = 'Envoi en cours…'; }

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'form-name':'audit-geo', name, tel, email }).toString(),
      });
      if (!res.ok) throw new Error();
      if (msgEl) { msgEl.style.color = '#4ade80'; msgEl.textContent = '✓ Demande envoyée ! Nous vous contactons sous 72h.'; }
      if (btn)   { btn.textContent = 'Envoyé ✓'; }
      ['af-name','af-tel','af-email'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
      setTimeout(closeForm, 3000);
    } catch {
      if (msgEl) { msgEl.style.color = '#ff6b6b'; msgEl.textContent = 'Erreur. Écrivez-nous à contact@geo503.com'; }
      if (btn)   { btn.disabled = false; btn.textContent = 'Réessayer →'; }
    }
  });
}, 300);

/* ── GLOSSAIRE accordion ── */
onIdle(() => {
  document.querySelectorAll('.glossary-item').forEach(item => {
    const toggle = () => {
      const isOpen = item.classList.toggle('open');
      item.setAttribute('aria-expanded', isOpen);
    };
    item.addEventListener('click', toggle, { passive: true });
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });
}, 400);

/* ── WEB VITALS ── */
if ('PerformanceObserver' in window) {
  try { new PerformanceObserver(l=>{const e=l.getEntries().at(-1);console.info('[LCP]',Math.round(e.startTime)+'ms',e.element?.tagName);}).observe({type:'largest-contentful-paint',buffered:true}); } catch(_){}
  try { let c=0; new PerformanceObserver(l=>{l.getEntries().forEach(e=>{if(!e.hadRecentInput)c+=e.value;});console.info('[CLS]',c.toFixed(4));}).observe({type:'layout-shift',buffered:true}); } catch(_){}
}
