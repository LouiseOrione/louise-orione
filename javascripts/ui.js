/* ============================================================================
   ui.js — Interactions transversales : curseur, dark mode, langue
   Présent sur toutes les pages (index, archives, about).
   ============================================================================ */


/* ─────────────────────────────────────────────────────────────────────────────
   CURSEUR PERSONNALISÉ — Petit soleil jaune-moutarde
   On positionne le div #customCursor à la position exacte de la souris.
   La propriété CSS transform: translate(-50%, -50%) dans le CSS centre
   le soleil sur le pointeur.
───────────────────────────────────────────────────────────────────────────── */
(function initCursor() {
  const cursor = document.getElementById('customCursor');
  if (!cursor) return;

  /* Coordonnées courantes de la souris */
  let mouseX = -100, mouseY = -100;

  /* Suivi de la souris : on met à jour la position directement (pas de lerp
     pour le curseur, pour éviter le décalage perceptible) */
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
    cursor.classList.add('is-visible'); // Rend le curseur visible dès le premier mouvement
  });

  /* Masque le curseur quand la souris quitte la fenêtre */
  document.addEventListener('mouseleave', () => {
    cursor.classList.remove('is-visible');
  });

  /* Grossit légèrement sur les éléments interactifs (liens, boutons, clips) */
  const interactives = 'a, button, .project-clip, .nav-link, .top-bar-toggle';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactives)) {
      cursor.classList.add('is-hovering');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactives)) {
      cursor.classList.remove('is-hovering');
    }
  });
})();


/* ─────────────────────────────────────────────────────────────────────────────
   DARK MODE
   On stocke la préférence dans localStorage pour qu'elle persiste entre pages.
   Le thème est appliqué via data-theme="dark" sur <html>.
   Les couleurs sont définies dans style.css avec des variables CSS
   qui changent selon [data-theme="dark"].
───────────────────────────────────────────────────────────────────────────── */
(function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const html   = document.documentElement;

  /* Restaure la préférence sauvegardée (ou "light" par défaut) */
  const saved = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-theme', saved);

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    /* Bascule entre light et dark */
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next); // Mémorise pour les prochaines pages
  });
})();


/* ─────────────────────────────────────────────────────────────────────────────
   SWITCH DE LANGUE — FR / EN
   Stocké dans localStorage. On switche tous les éléments portant data-fr / data-en.
   Les clips de la timeline aussi sont mis à jour via leurs data-title-fr / data-title-en.
───────────────────────────────────────────────────────────────────────────── */
(function initLang() {
  const toggle = document.getElementById('langToggle');
  const html   = document.documentElement;

  /* Restaure la langue sauvegardée */
  const saved = localStorage.getItem('lang') || 'fr';
  applyLang(saved);

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const current = html.getAttribute('data-lang') || 'fr';
    const next    = current === 'fr' ? 'en' : 'fr';
    applyLang(next);
    localStorage.setItem('lang', next);
  });

  /* ── Applique la langue à tous les éléments bilingues de la page ── */
  function applyLang(lang) {
    html.setAttribute('data-lang', lang);
    html.setAttribute('lang', lang);

    /* Tous les éléments avec data-fr et data-en : on met à jour le textContent */
    document.querySelectorAll('[data-fr][data-en]').forEach(el => {
      /* On ne met à jour que le texte, pas les enfants (pour ne pas écraser les SVG) */
      if (el.children.length === 0) {
        el.textContent = el.dataset[lang] || el.dataset.fr;
      }
    });

    /* Mise à jour du label du bouton langue */
    document.querySelectorAll('.lang-label').forEach(el => {
      el.textContent = lang === 'fr' ? 'FR' : 'EN';
    });

    /* Mise à jour des titres dans les clips de la timeline */
    document.querySelectorAll('.clip-title[data-fr][data-en]').forEach(el => {
      el.textContent = el.dataset[lang] || el.dataset.fr;
    });

    /* Mise à jour des liens de nav */
    document.querySelectorAll('.nav-link[data-fr][data-en]').forEach(el => {
      el.textContent = el.dataset[lang] || el.dataset.fr;
    });

    /* Switche les blocs HTML entiers selon la langue active */
    document.querySelectorAll('[data-lang-block]').forEach(el => {
      el.style.display = el.dataset.langBlock === lang ? 'block' : 'none';
    });
  }
})();
