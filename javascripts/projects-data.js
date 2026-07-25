/* ============================================================================
   projects-data.js — Source unique de vérité pour tous les projets
   ============================================================================
   C'est ici que tu gères TOUT ton contenu.
   Ajouter un projet = ajouter un objet dans le tableau PROJECTS.
   Les pages projets.html et archives.html lisent ce fichier automatiquement.
   La timeline s'adapte aux dates sans aucune modification à faire ailleurs.
   ============================================================================ */

const PROJECTS = [
  /* ── Format d'un projet ─────────────────────────────────────────────────
     {
       id:        'nom-unique',          // Utilisé pour l'URL de la page détail
       title:     { fr: '...', en: '...' },  // Titre bilingue
       year:      2026,                  // Année (entier)
       month:     3,                     // Mois 1–12 (optionnel, pour position fine)
       image:     'imports/photo.jpg',   // Chemin vers l'image de couverture
       href:      'nom-unique.html',     // Page détail du projet
       featured:  true,                  // true = apparaît sur la page "projets"
                                         // false = uniquement dans "archives"
       // Taille et position sur la timeline (en px) :
       w: 380, h: 250,                   // largeur, hauteur du clip
       y: 80,                            // position verticale (depuis le haut du canvas)
       z: 3,                             // z-index (superposition)
     }
  ──────────────────────────────────────────────────────────────────────── */

  {
    id:       'PRISM collectif',
    type: ['installation', 'motion', 'documentaire'],
    title:    { fr: 'Opération Diffraction - Collectif PRISM', en: 'Opération Diffraction - PRISM Collective' },
    year:     2026, month: 6,
    image:    'imports/PRISM/Carton01.jpg',
    href:     'prism.html',
    featured: true,
    w: 460, h: 290, y: 200, z: 2,
  },
  {
    id:       '(w)e-doc',
    type: ['documentaire', 'print'],
    title:    { fr: '(w)e-doc: Un processus documentaire pluriel', en: '(w)e-doc: A plural documentary process' },
    year:     2026, month: 2,
    image:    'imports/WEDOC/21.jpg',
    href:     'wedoc.html',
    featured: true,
    w: 460, h: 290, y: 200, z: 2,
  },
  {
    id:       'Retro rêveur',
    type: ['installation'],
    title:    { fr: 'Retro rêveur', en: 'Dreamer projector' },
    year:     2025, month: 10,
    image:    'imports/RETROREV/retroreveur01.jpg',
    href:     'retroreveur.html',
    featured: true,
    w: 460, h: 290, y: 200, z: 2,
  },
  {
    id:       'Boats',
    type: ['documentaire'],
    title:    { fr: 'Boats', en: 'Boats' },
    year:     2025, month: 4,
    image:    'imports/BOATS/vignette_boats.jpg',
    href:     'boats.html',
    featured: true,
    w: 460, h: 290, y: 200, z: 2,
  },
  {
    id:       'Mathismusic',
    type: ['documentaire', 'motion'],
    title:    { fr: 'Math is music', en: 'Math is music' },
    year:     2024, month: 10,
    image:    'imports/MATH/math01.jpg',
    href:     'math.html',
    featured: true,          // Dans archives seulement
    w: 460, h: 290, y: 200, z: 2,
  },
  {
    id:       'Dear shroom',
    type: ['installation'],
    title:    { fr: 'Dear shroom', en: 'Dear shroom' },
    year:     2024, month: 11,
    image:    'imports/SHROOM/shroom01.jpg',
    href:     'dearshroom.html',
    featured: true,
    w: 460, h: 290, y: 200, z: 2,
  },
  {
    id:       'Affiches',
    type: ['print'],
    title:    { fr: 'Affiches', en: 'Posters' },
    year:     2024, month: 10,
    image:    'imports/AFFICHES/leisure06.jpg',
    href:     'affiches.html',
    featured: false,
    w: 460, h: 290, y: 200, z: 2,
  },
  {
    id:       'Echo',
    type: ['installation'],
    title:    { fr: 'Echo', en: 'Echo' },
    year:     2024, month: 11,
    image:    'imports/ECHO/echo_vignette.jpg',
    href:     'echo.html',
    featured: false,
    w: 460, h: 290, y: 200, z: 2,
  },
  {
    id:       'What if',
    type: ['motion', 'documentaire'],
    title:    { fr: 'What if we sorted our data', en: 'What if we sorted our data' },
    year:     2024, month: 10,
    image:    'imports/WHATIF/whatif_vignette.jpg',
    href:     'whatif.html',
    featured: false,
    w: 460, h: 290, y: 200, z: 2,
  },
  {
    id:       'Crions de bois',
    type: ['installation'],
    title:    { fr: 'Crions de bois', en: 'Crions de bois' },
    year:     2024, month: 09,
    image:    'imports/CRIONS/brutpop01.jpg',
    href:     'crionsdebois.html',
    featured: true,
    w: 460, h: 290, y: 200, z: 2,
  },

  {
    id:       'Blue Lions',
    type: ['motion'],
    title:    { fr: 'Blue Lions', en: 'Blue Lions' },
    year:     2022, month: 05,
    image:    'imports/bluelions.jpg',
    href:     'bluelions.html',
    featured: false,
    w: 460, h: 290, y: 200, z: 2,
  },

  {
    id:       'The Cardboard Box',
    type: ['motion'],
    title:    { fr: 'The Cardboard Box', en: 'The Cardboard Box' },
    year:     2023, month: 04,
    image:    'imports/cardboardbox.jpg',
    href:     'cardboard.html',
    featured: false,
    w: 460, h: 290, y: 200, z: 2,
  },

  {
    id:       'Kumi Solo',
    type: ['motion'],
    title:    { fr: 'Kumi Solo', en: 'Kumi Solo' },
    year:     2024, month: 05,
    image:    'imports/KUMI/kumi_vignette.jpg',
    href:     'kumi.html',
    featured: false,
    w: 460, h: 290, y: 200, z: 2,
  },

  {
    id:       '#Sousdôme',
    type: ['installation', 'motion'],
    title:    { fr: '#Sousdôme', en: '#Sousdôme' },
    year:     2024, month: 03,
    image:    'imports/DOME/OVNI_MOCKUP.jpg',
    href:     'sousdome.html',
    featured: false,
    w: 460, h: 290, y: 200, z: 2,
  },

  {
    id:       'Maps',
    type: ['motion'],
    title:    { fr: 'Maps', en: 'Maps' },
    year:     2024, month: 07,
    image:    'imports/MAP/map03.jpg',
    href:     'map.html',
    featured: false,
    w: 460, h: 290, y: 200, z: 2,
  },


  /* ── Pour ajouter un nouveau projet, copie ce bloc et remplis les champs :
  {
    id:       'mon-nouveau-projet',
    title:    { fr: 'Mon nouveau projet', en: 'My new project' },
    year:     2027, month: 2,
    image:    'imports/ma-photo.jpg',
    href:     'mon-nouveau-projet.html',
    featured: true,
    w: 400, h: 260, y: 120, z: 2,
  },
  ── */
];

/* ─────────────────────────────────────────────────────────────────────────────
   FONCTIONS UTILITAIRES — utilisées par projets.html et archives.html
───────────────────────────────────────────────────────────────────────────── */

/* Retourne uniquement les projets à mettre en avant (page "projets") */
function getFeaturedProjects() {
  return PROJECTS.filter(p => p.featured);
}

/* Retourne tous les projets (page "archives") */
function getAllProjects() {
  return [...PROJECTS];
}

/* Retourne les projets filtrés par type
   Supporte les tableaux de types — un projet peut avoir plusieurs types */
function getProjectsByType(type) {
  if (!type || type === 'all') return [...PROJECTS];
  return PROJECTS.filter(p => {
    if (Array.isArray(p.type)) return p.type.includes(type);
    return p.type === type;
  });
}

/* Calcule l'année min et max parmi une liste de projets.
   Utilisé pour dimensionner automatiquement la timeline. */
function getYearRange(projects) {
  const years = projects.map(p => p.year);
  return {
    min: Math.min(...years),
    max: Math.max(...years),
  };
}