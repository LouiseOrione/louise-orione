/* ============================================================================
   timeline.js — Logique de la timeline (partagée par index.html et archives.html)
   ============================================================================
   Nouvelles fonctionnalités :
   - Layout automatique : les clips ne se superposent plus.
   - Si plusieurs projets sont proches dans le temps, la timeline s'étire
     horizontalement pour les espacer proprement.
   - Les valeurs y dans projects-data.js ne sont plus utilisées pour le
     positionnement : le JS calcule tout automatiquement.
   ============================================================================ */


/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTES DE MISE EN PAGE
───────────────────────────────────────────────────────────────────────────── */
const PX_PER_YEAR   = 520;   // Pixels représentant 1 an sur la règle
const YEAR_ORIGIN_X = 10;   // Marge gauche avant le début de la timeline (px)
const PADDING_RIGHT = 300;   // Marge droite après le dernier projet (px)
const SCROLL_SPEED  = 1.6;   // Multiplicateur de vitesse molette
const LERP          = 0.12;  // Inertie du scroll

const PLAYHEAD_MIN  = 170;
const PLAYHEAD_MAX  = () => window.innerWidth - 80;

/* Marges entre clips pour éviter les superpositions */
const GAP_X = 30;  // Espace horizontal minimum entre deux clips (px)
const GAP_Y = 20;  // Espace vertical minimum entre deux clips (px)

/* Slots de position verticale — alternés pour un rendu naturel et aéré.
   Modifie ces valeurs pour changer la répartition verticale des clips. */
const Y_SLOTS = [60, 230, 100, 290, 40, 180, 130, 310, 70, 250];


/* ─────────────────────────────────────────────────────────────────────────────
   ÉTAT GLOBAL DU SCROLL
───────────────────────────────────────────────────────────────────────────── */
let targetOffsetX = 0;
let offsetX       = 0;
let rafId         = null;
let canvasWidth   = 3200;


/* ─────────────────────────────────────────────────────────────────────────────
   CALCUL DE LA POSITION X D'UN PROJET
   La timeline va du plus récent (gauche) au plus ancien (droite).
   Le mois affine la position à l'intérieur de l'année.
───────────────────────────────────────────────────────────────────────────── */
function projectToX(project, yearMax) {
  const yearsFromMax = yearMax - project.year;
  let x = YEAR_ORIGIN_X + yearsFromMax * PX_PER_YEAR;

  if (project.month) {
    /* Mois 12 (décembre) = tout à gauche dans l'année (plus récent)
       Mois 1  (janvier)  = tout à droite dans l'année (plus ancien) */
    const monthOffset = ((12 - project.month) / 12) * PX_PER_YEAR;
    x += monthOffset;
  }

  return Math.round(x);
}


/* ─────────────────────────────────────────────────────────────────────────────
   LAYOUT AUTOMATIQUE — évite les superpositions sans contraindre les dates
   Principe :
   1. Pour chaque projet, on calcule sa position X depuis sa date.
   2. On vérifie si cette position chevauche un clip déjà placé.
   3. Si oui, on décale vers la droite jusqu'à trouver une zone libre.
      C'est ce décalage qui "étire" la timeline au lieu de superposer.
   4. On cherche ensuite un slot Y libre parmi les slots prédéfinis.
───────────────────────────────────────────────────────────────────────────── */
function autoLayout(sorted, yearMax) {

  /* Hauteur disponible pour les clips (entre le header et la nav du bas) */
  const CANVAS_H = window.innerHeight * 0.52;

  /* Rectangles déjà placés : { x1, y1, x2, y2 } */
  const placed = [];

  /* Résultat final : { project, x, y } pour chaque projet */
  const result = [];

  sorted.forEach((project, index) => {

    const w = project.w;
    const h = project.h;

    /* ── Position X de base depuis la date ── */
    let x = projectToX(project, yearMax);

    /* ── Décalage horizontal si chevauchement ──
       On cherche la première position X libre après la position calculée. */
    let attempts = 0;
    while (attempts < 30) {
      /* Y a-t-il un clip déjà placé qui chevauche cette zone X ? */
      const blockX = placed.find(p =>
        x < p.x2 + GAP_X && x + w + GAP_X > p.x1
      );

      if (!blockX) break; /* Zone X libre */

      /* Conflit : on se décale juste après le clip gênant */
      x = blockX.x2 + GAP_X;
      attempts++;
    }

    /* ── Recherche d'un slot Y libre ──
       On parcourt les slots dans l'ordre (avec rotation par index)
       et on prend le premier qui ne crée pas de chevauchement. */
    let bestY   = Y_SLOTS[index % Y_SLOTS.length];
    let foundY  = false;

    for (let attempt = 0; attempt < Y_SLOTS.length * 3; attempt++) {
      /* On tourne dans les slots avec un offset croissant */
      const tryY = Y_SLOTS[attempt % Y_SLOTS.length];

      /* Ne pas dépasser le bas de la zone visible */
      if (tryY + h > CANVAS_H) continue;

      /* Chevauchement avec un clip proche ? */
      const blockY = placed.find(p =>
        x < p.x2 + GAP_X     &&
        x + w + GAP_X > p.x1 &&
        tryY < p.y2 + GAP_Y  &&
        tryY + h + GAP_Y > p.y1
      );

      if (!blockY) {
        bestY  = tryY;
        foundY = true;
        break;
      }
    }

    /* Fallback : si aucun slot n'est complètement libre,
       on accepte un léger chevauchement vertical plutôt que de sortir du cadre */
    if (!foundY) {
      bestY = Math.min(
        Y_SLOTS[index % Y_SLOTS.length],
        Math.max(20, CANVAS_H - h - 20)
      );
    }

    /* Enregistre le clip placé */
    placed.push({ x1: x, y1: bestY, x2: x + w, y2: bestY + h });
    result.push({ project, x, y: bestY });
  });

  return result;
}


/* ─────────────────────────────────────────────────────────────────────────────
   GÉNÉRATION D'UN CLIP HTML
───────────────────────────────────────────────────────────────────────────── */
function createClipElement(project, x, y, lang) {
  const article = document.createElement('article');
  article.className = 'project-clip';
  article.setAttribute('tabindex', '0');
  article.setAttribute('role', 'button');

  const title = project.title[lang] || project.title.fr;
  article.setAttribute('aria-label', `Voir ${title} (${project.year})`);

  /* x et y viennent du layout automatique, w/h/z des données projet */
  article.style.cssText = [
    `--x: ${x}px`,
    `--y: ${y}px`,
    `--w: ${project.w}px`,
    `--h: ${project.h}px`,
    `--z: ${project.z}`,
  ].join('; ');

  article.dataset.href    = project.href;
  article.dataset.year    = project.year;
  article.dataset.titleFr = project.title.fr;
  article.dataset.titleEn = project.title.en || project.title.fr;

  article.innerHTML = `
    <div class="clip-media">
      ${project.image
        ? `<img class="clip-img" src="${project.image}" alt="${title}" loading="lazy">`
        : `<span class="clip-placeholder">${project.id.toUpperCase().replace(/-/g, ' ')}</span>`
      }
    </div>
    <div class="clip-overlay">
      <h2 class="clip-title" data-fr="${project.title.fr}" data-en="${project.title.en || project.title.fr}">
        ${title}
      </h2>
      <span class="clip-year">${project.year}</span>
    </div>
  `;

  return article;
}


/* ─────────────────────────────────────────────────────────────────────────────
   GÉNÉRATION DE LA RÈGLE — synchronisée avec les positions réelles des clips
   Au lieu d'un espacement fixe (PX_PER_YEAR), on calcule la position X de
   chaque année depuis la position médiane des clips qui lui appartiennent.
   Ainsi, si 3 projets de 2026 sont espacés sur 1000px, le label "2026"
   se place au centre de cet espace, et les graduations s'adaptent.
───────────────────────────────────────────────────────────────────────────── */
function buildRuler(layout) {
  const rulerTrack = document.getElementById('rulerTrack');
  if (!rulerTrack) return;
  rulerTrack.innerHTML = '';

  /* ── 1. Calcule la position X représentative de chaque année ──
     On groupe les clips par année et on prend le centre horizontal
     du groupe (moyenne des centres X de chaque clip). */
  const yearPositions = {}; /* { 2026: [x1, x2, ...], 2025: [...], ... } */

  layout.forEach(({ project, x }) => {
    const y = project.year;
    if (!yearPositions[y]) yearPositions[y] = [];
    /* On stocke le centre X du clip */
    yearPositions[y].push(x + project.w / 2);
  });

  /* Pour chaque année, position X = centre du groupe de clips */
  const yearX = {}; /* { 2026: 320, 2025: 980, ... } */
  Object.entries(yearPositions).forEach(([year, positions]) => {
    const min = Math.min(...positions);
    const max = Math.max(...positions);
    yearX[parseInt(year)] = Math.round((min + max) / 2);
  });

  /* Trie les années du plus récent (gauche) au plus ancien (droite) */
  const years = Object.keys(yearX).map(Number).sort((a, b) => b - a);

  /* ── 2. Dessine les labels d'années et leurs graduations ── */
  years.forEach((year, i) => {
    const x = yearX[year];

    /* Graduation principale (trait long) pour l'année */
    const tick = document.createElement('div');
    tick.className = 'ruler-tick major';
    tick.style.left = x + 'px';
    rulerTrack.appendChild(tick);

    /* Label de l'année */
    const label = document.createElement('span');
    label.className = 'ruler-label';
    label.textContent = year;
    label.style.left = x + 'px';
    rulerTrack.appendChild(label);

    /* ── 3. Graduations intermédiaires entre cette année et la suivante ──
       On place des traits entre deux années adjacentes pour
       représenter les mois / trimestres de manière proportionnelle. */
    const nextYear = years[i + 1];
    if (nextYear === undefined) return; /* Dernière année, pas de suite */

    const xNext    = yearX[nextYear];
    const spanPx   = xNext - x; /* Distance en px entre les deux années */

    /* 3 traits de trimestres */
    for (let q = 1; q <= 3; q++) {
      const minorTick = document.createElement('div');
      minorTick.className = 'ruler-tick minor';
      minorTick.style.left = Math.round(x + (q / 4) * spanPx) + 'px';
      rulerTrack.appendChild(minorTick);
    }

    /* Petits traits de mois (hors trimestres) */
    for (let m = 1; m < 12; m++) {
      if (m % 3 === 0) continue; /* Déjà couvert par les trimestres */
      const microTick = document.createElement('div');
      microTick.className = 'ruler-tick';
      microTick.style.left = Math.round(x + (m / 12) * spanPx) + 'px';
      microTick.style.height = '5px';
      rulerTrack.appendChild(microTick);
    }
  });

  /* Retourne yearX pour que applyOffset puisse s'en servir */
  return yearX;
}


/* ─────────────────────────────────────────────────────────────────────────────
   MISE À JOUR DE L'AFFICHAGE À CHAQUE FRAME
   yearX : table de correspondance { année → position X sur le canvas }
   Permet d'afficher la bonne année sous le playhead selon sa position réelle.
───────────────────────────────────────────────────────────────────────────── */
function applyOffset(offset, yearX) {
  const canvas      = document.getElementById('timelineCanvas');
  const rulerTrack  = document.getElementById('rulerTrack');
  const currentYear = document.getElementById('rulerCurrentYear');
  if (!canvas) return;

  /* Déplace le canvas et la règle */
  canvas.style.setProperty('--offset', offset + 'px');
  if (rulerTrack) rulerTrack.style.setProperty('--offset', offset + 'px');

  /* Position du playhead sur l'écran (de gauche à droite selon le scroll) */
  const progress = canvasWidth !== window.innerWidth
    ? offset / -(canvasWidth - window.innerWidth)
    : 0;
  const phX = PLAYHEAD_MIN + Math.max(0, Math.min(1, progress)) * (PLAYHEAD_MAX() - PLAYHEAD_MIN);
  document.documentElement.style.setProperty('--playhead-left', phX + 'px');

  /* ── Calcul de l'année affichée sous le playhead ──
     On cherche quelle année est la plus proche de la position du playhead
     sur le canvas (en coordonnées absolues). */
  if (currentYear && yearX) {
    const posOnCanvas = phX - offset; /* Position absolue sur le canvas */

    /* Trouve l'année dont la position X est la plus proche */
    let closestYear = null;
    let closestDist = Infinity;

    Object.entries(yearX).forEach(([year, x]) => {
      const dist = Math.abs(posOnCanvas - x);
      if (dist < closestDist) {
        closestDist = dist;
        closestYear = parseInt(year);
      }
    });

    if (closestYear !== null) {
      currentYear.textContent = closestYear;
      currentYear.style.left  = phX + 'px';
    }
  }
}


/* ─────────────────────────────────────────────────────────────────────────────
   BOUCLE D'ANIMATION
───────────────────────────────────────────────────────────────────────────── */
let _yearMin = 2022;
let _yearMax = 2026;
let _yearX   = {}; /* Table année → position X, partagée avec applyOffset */

function animationLoop() {
  offsetX += (targetOffsetX - offsetX) * LERP;
  applyOffset(Math.round(offsetX * 100) / 100, _yearX);

  if (Math.abs(targetOffsetX - offsetX) < 0.1) {
    offsetX = targetOffsetX;
    applyOffset(offsetX, _yearX);
    rafId = null;
    return;
  }
  rafId = requestAnimationFrame(animationLoop);
}

function startAnimation() {
  if (!rafId) rafId = requestAnimationFrame(animationLoop);
}

function getMaxOffset() {
  return -(canvasWidth - window.innerWidth);
}


/* ─────────────────────────────────────────────────────────────────────────────
   ÉVÉNEMENTS DE SCROLL / CLAVIER / TOUCH
───────────────────────────────────────────────────────────────────────────── */
function bindScrollEvents() {
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY || e.deltaX;
    targetOffsetX -= delta * SCROLL_SPEED;
    targetOffsetX = Math.max(getMaxOffset(), Math.min(0, targetOffsetX));
    startAnimation();
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    const STEP = 200;
    if (e.key === 'ArrowRight') {
      targetOffsetX = Math.max(getMaxOffset(), targetOffsetX - STEP);
      startAnimation();
    }
    if (e.key === 'ArrowLeft') {
      targetOffsetX = Math.min(0, targetOffsetX + STEP);
      startAnimation();
    }
  });

  let touchStartX = null;
  window.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (touchStartX === null) return;
    const dx = touchStartX - e.touches[0].clientX;
    targetOffsetX -= dx;
    targetOffsetX = Math.max(getMaxOffset(), Math.min(0, targetOffsetX));
    touchStartX = e.touches[0].clientX;
    startAnimation();
  }, { passive: true });

  window.addEventListener('touchend', () => { touchStartX = null; });

  window.addEventListener('resize', () => {
    targetOffsetX = Math.max(getMaxOffset(), Math.min(0, targetOffsetX));
    offsetX = targetOffsetX;
    applyOffset(offsetX, _yearX);
  });
}


/* ─────────────────────────────────────────────────────────────────────────────
   CLICS SUR LES CLIPS
───────────────────────────────────────────────────────────────────────────── */
function bindClipEvents() {
  document.querySelectorAll('.project-clip').forEach((clip, index) => {
    clip.style.animationDelay = (index * 60) + 'ms';

    clip.addEventListener('click', () => {
      if (clip.dataset.href) window.location.href = clip.dataset.href;
    });

    clip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (clip.dataset.href) window.location.href = clip.dataset.href;
      }
    });
  });
}


/* ─────────────────────────────────────────────────────────────────────────────
   FONCTION PRINCIPALE
───────────────────────────────────────────────────────────────────────────── */
function initTimeline(projects) {

  /* 1. Plage d'années */
  const range = getYearRange(projects);
  _yearMin = range.min;
  _yearMax = range.max;

  /* 2. Langue */
  const lang = document.documentElement.getAttribute('data-lang') || 'fr';

  /* 3. Tri du plus récent au plus ancien */
  const sorted = [...projects].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return (b.month || 6) - (a.month || 6);
  });

  /* 4. Layout automatique — positions x/y calculées sans superposition */
  const layout = autoLayout(sorted, _yearMax);

  /* 5. Largeur réelle du canvas depuis les positions calculées */
  const maxX = layout.reduce((acc, { project, x }) => Math.max(acc, x + project.w), 0);
  canvasWidth = Math.max(maxX + PADDING_RIGHT + 200, window.innerWidth + 200);
  document.documentElement.style.setProperty('--canvas-w', canvasWidth + 'px');

  /* 6. Injection des clips dans le canvas */
  const canvas = document.getElementById('timelineCanvas');
  if (!canvas) return;
  canvas.innerHTML = '';

  layout.forEach(({ project, x, y }) => {
    const clip = createClipElement(project, x, y, lang);
    canvas.appendChild(clip);
  });

  /* 7. Génération de la règle synchronisée avec les positions réelles.
        buildRuler retourne yearX (table année → position X) qu'on
        stocke dans _yearX pour que applyOffset et la boucle d'animation
        puissent l'utiliser. */
  _yearX = buildRuler(layout) || {};

  /* 8. Événements et affichage initial */
  bindClipEvents();
  bindScrollEvents();
  applyOffset(0, _yearX);

  console.log(`%cTimeline initialisée`, 'color:#e63223;font-weight:bold',
    `| ${projects.length} projets | ${_yearMin}–${_yearMax} | canvas: ${canvasWidth}px`);
}


/* ─────────────────────────────────────────────────────────────────────────────
   GESTION DU LIEN ACTIF DANS LA NAV
───────────────────────────────────────────────────────────────────────────── */
function setActiveNav(currentFile) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentFile || href.endsWith('/' + currentFile)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}