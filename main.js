'use strict';

// ─────────────────────────────────────────────
// VILLANOVA — Agenda Culturel
// main.js
// ─────────────────────────────────────────────

// ── Config
// Remplacer par vos identifiants OpenAgenda
// IMPORTANT: Ne commitez jamais vos clés privées dans le dépôt.
// Cette application cherche automatiquement une configuration fournie
// par un fichier `js/config.js` qui définit `window.VILLANOVA_CONFIG`.

let API_KEY    = '';
let AGENDA_UID = '';

// Charger la configuration si elle a été fournie par js/config.js
try {
  if (typeof window !== 'undefined' && window.VILLANOVA_CONFIG) {
    if (typeof window.VILLANOVA_CONFIG.API_KEY === 'string') API_KEY = window.VILLANOVA_CONFIG.API_KEY;
    if (typeof window.VILLANOVA_CONFIG.AGENDA_UID === 'string') AGENDA_UID = window.VILLANOVA_CONFIG.AGENDA_UID;
  }
} catch (e) {
  // silent fallback
}

// ── État global
let allEvents     = [];
let currentFilter = 'all';
let currentPage   = 'home';


// ── Navigation
// ─────────────────────────────────────────────

function showPage(name) {
  document.getElementById('page-home').classList.remove('active');
  document.getElementById('page-detail').classList.remove('active');
  document.getElementById('page-' + name).classList.add('active');
  document.getElementById('nav-home').setAttribute('aria-current', name === 'home' ? 'page' : 'false');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  currentPage = name;
}

function goBack() {
  showPage('home');
  announce('Retour à la liste des événements.');
}


// ── ARIA live announcements
// ─────────────────────────────────────────────

function announce(message) {
  const el = document.getElementById('aria-announcer');
  el.textContent = '';
  requestAnimationFrame(() => { el.textContent = message; });
}


// ── Filtres
// ─────────────────────────────────────────────

function setFilter(btn, value) {
  document.querySelectorAll('.filter-btn').forEach(b => b.setAttribute('aria-pressed', 'false'));
  btn.setAttribute('aria-pressed', 'true');
  currentFilter = value;
  renderEvents(allEvents);
  announce('Filtre appliqué : ' + btn.textContent.trim());
}


// ── Helpers
// ─────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return 'Date à confirmer';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date(iso));
  } catch { return iso; }
}

function formatTime(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(iso));
  } catch { return ''; }
}

function iconSvg(name) {
  const icons = {
    calendar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" wi[...]`,
    clock:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="[...]`,
    location: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-[...]`,
    ticket:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 9a3 3 0 [...]]>`,
    arrow:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="1[...]`,
    back:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="[...]`,
  };
  return icons[name] || '';
}


// ── Données de démonstration
// ─────────────────────────────────────────────

function getDemoEvents() {
  return [
    {
      uid: 'demo-1',
      title: { fr: 'Orchestre Philharmonique de Marseille — Soirée Beethoven' },
      description: { fr: '<p>Une soirée exceptionnelle autour des plus belles œuvres de Beethoven, interprétée par l\'Orchestre Philharmonique de Marseille sous la direction du maestro Giovanni Al[...]' },
      dateRange: { fr: '14 juillet 2025' },
      firstTiming: { begin: '2025-07-14T20:30:00', end: '2025-07-14T23:00:00' },
      location: { name: 'Opéra de Marseille', city: 'Marseille', address: '2 Rue Molière, 13001' },
      image: { base: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=70' },
      keywords: { fr: 'concert' },
      conditions: { fr: 'De 15 € à 45 €' },
    },
    {
      uid: 'demo-2',
      title: { fr: 'Exposition — Lumières de la Méditerranée' },
      description: { fr: '<p>Plongez dans une exposition immersive célébrant les artistes de la Méditerranée : peintures, sculptures et installations numériques.</p><p>Œuvres de plus de 40 artis[...]' },
      dateRange: { fr: 'Du 1er juin au 31 août 2025' },
      firstTiming: { begin: '2025-06-01T10:00:00', end: '2025-08-31T18:00:00' },
      location: { name: 'MuCEM', city: 'Marseille', address: '7 Promenade Robert Laffont, 13002' },
      image: { base: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&q=70' },
      keywords: { fr: 'expo' },
      conditions: { fr: 'Entrée libre le premier dimanche du mois, sinon 9,50 €' },
    },
    {
      uid: 'demo-3',
      title: { fr: 'Festival Jazz des Cinq Continents' },
      description: { fr: '<p>Rendez-vous incontournable des amateurs de jazz, le Festival des Cinq Continents accueille cette année des artistes de renom venus du monde entier pour des concerts en pl[...]' },
      dateRange: { fr: '18–26 juillet 2025' },
      firstTiming: { begin: '2025-07-18T19:00:00', end: '2025-07-26T23:30:00' },
      location: { name: 'Palais Longchamp', city: 'Marseille', address: 'Boulevard du Jardin Zoologique, 13004' },
      image: { base: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=70' },
      keywords: { fr: 'concert' },
      conditions: { fr: 'De 20 € à 60 €, pass festival disponible' },
    },
    {
      uid: 'demo-4',
      title: { fr: 'Spectacle jeune public — Les Aventures d\'Ulysse' },
      description: { fr: '<p>Un spectacle épique et coloré qui emmène les enfants dans les aventures mythologiques d\'Ulysse. Avec marionnettes géantes, musique live et jeux de lumières.</p>' },
      dateRange: { fr: '5–20 juillet 2025' },
      firstTiming: { begin: '2025-07-05T14:30:00', end: '2025-07-05T15:45:00' },
      location: { name: 'Théâtre Massalia', city: 'Marseille', address: '41 Rue Jobin, 13003' },
      image: { base: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=70' },
      keywords: { fr: 'jeune public' },
      conditions: { fr: '8 € enfant / 12 € adulte' },
    },
    {
      uid: 'demo-5',
      title: { fr: 'Atelier poterie — Introduction à la céramique' },
      description: { fr: '<p>Découvrez les secrets de la poterie lors d\'un atelier convivial animé par des céramistes professionnels. Initiez-vous au tournage, au modelage et à l\'émaillage. Tou[...]' },
      dateRange: { fr: 'Tous les samedis de juillet' },
      firstTiming: { begin: '2025-07-05T10:00:00', end: '2025-07-05T12:30:00' },
      location: { name: 'La Friche Belle de Mai', city: 'Marseille', address: '41 Rue Jobin, 13003' },
      image: { base: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=70' },
      keywords: { fr: 'atelier' },
      conditions: { fr: '35 € par séance, matériaux inclus' },
    },
    {
      uid: 'demo-6',
      title: { fr: 'Théâtre — Cyrano de Bergerac' },
      description: { fr: '<p>La pièce emblématique d\'Edmond Rostand revisitée par la compagnie Nomade. Un Cyrano moderne, drôle, émouvant et surprenant, dans une mise en scène audacieuse qui al[...]' },
      dateRange: { fr: '10–15 août 2025' },
      firstTiming: { begin: '2025-08-10T21:00:00', end: '2025-08-10T23:15:00' },
      location: { name: 'Théâtre du Gymnase', city: 'Marseille', address: '4 Rue du Théâtre Français, 13001' },
      image: { base: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800&q=70' },
      keywords: { fr: 'spectacle' },
      conditions: { fr: 'De 12 € à 28 €' },
    },
  ];
}


// ── API OpenAgenda
// ─────────────────────────────────────────────

async function fetchEvents() {
  if (!API_KEY || !AGENDA_UID) return getDemoEvents();

  const url = new URL(`https://api.openagenda.com/v2/agendas/${AGENDA_UID}/events`);
  url.searchParams.set('key', API_KEY);
  url.searchParams.set('size', '24');
  url.searchParams.set('sort', 'timingsWithAggregations.start.asc');
  url.searchParams.set('timings[gte]', new Date().toISOString());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Erreur API: ${res.status}`);

  const data = await res.json();
  return (data.events || []).map(normalizeEvent);
}

function normalizeEvent(ev) {
  const timing = ev.timings?.[0];
  return {
    uid:         ev.uid,
    title:       { fr: ev.title?.fr || ev.title?.en || 'Sans titre' },
    description: { fr: ev.longDescription?.fr || ev.description?.fr || '' },
    dateRange:   { fr: ev.dateRange?.fr || '' },
    firstTiming: timing ? { begin: timing.begin, end: timing.end } : {},
    location:    { name: ev.location?.name || '', city: ev.location?.city || '', address: ev.location?.address || '' },
    image:       { base: ev.image?.base || '' },
    keywords:    { fr: (ev.keywords?.fr || []).join(', ') },
    conditions:  { fr: ev.conditions?.fr || 'Voir détails' },
  };
}



// ── Rendu — liste des événements
// ─────────────────────────────────────────────

function renderEvents(events) {
  const container = document.getElementById('events-container');
  const section   = document.getElementById('events-section');

  const filtered = currentFilter === 'all'
    ? events
    : events.filter(ev => (ev.keywords?.fr || '').toLowerCase().includes(currentFilter));

  section.setAttribute('aria-busy', 'false');

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="status-message" role="status">
        <div class="status-message__icon" aria-hidden="true">🔍</div>
        <p>Aucun événement trouvé pour ce filtre.</p>
        <button class="filter-btn" style="margin-top:0.75rem"
          onclick="setFilter(document.querySelector('[data-filter=all]'), 'all')">
          Voir tous les événements
        </button>
      </div>`;
    announce('Aucun événement pour ce filtre.');
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'events-grid';
  filtered.forEach(ev => grid.appendChild(buildEventCard(ev)));

  container.innerHTML = '';
  container.appendChild(grid);

  announce(`${filtered.length} événement${filtered.length > 1 ? 's' : ''} affiché${filtered.length > 1 ? 's' : ''}.`);
}

function buildEventCard(ev) {
  const article = document.createElement('article');
  article.className = 'event-card';

  const a = document.createElement('a');
  a.href = '#event-' + ev.uid;
  a.className = 'event-card__link';
  a.setAttribute('aria-label', 'Voir les détails : ' + (ev.title?.fr || 'Événement'));
  a.addEventListener('click', e => { e.preventDefault(); openDetail(ev.uid); });

  // Image
  const imgWrap = document.createElement('div');
  imgWrap.className = 'event-card__img-wrap';

  if (ev.image?.base) {
    const pic = document.createElement('picture');
    const img = document.createElement('img');
    img.src     = ev.image.base + (ev.image.base.includes('?') ? '&' : '?') + 'w=600';
    img.alt     = ev.title?.fr || '';
    img.loading = 'lazy';
    img.width   = 600;
    img.height  = 338;
    pic.appendChild(img);
    imgWrap.appendChild(pic);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'event-card__placeholder';
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.textContent = '🎭';
    imgWrap.appendChild(placeholder);
  }

  if (ev.keywords?.fr) {
    const cat = document.createElement('span');
    cat.className = 'event-card__category';
    cat.textContent = ev.keywords.fr.split(',')[0].trim();
    cat.setAttribute('aria-hidden', 'true');
    imgWrap.appendChild(cat);
  }

  // Body
  const body = document.createElement('div');
  body.className = 'event-card__body';

  const title = document.createElement('h3');
  title.className = 'event-card__title';
  title.textContent = ev.title?.fr || 'Sans titre';
  body.appendChild(title);

  // Meta
  const meta = document.createElement('div');
  meta.className = 'event-card__meta';

  const dateRow = document.createElement('div');
  dateRow.className = 'event-card__meta-row';
  dateRow.innerHTML = iconSvg('calendar');
  const dateSpan = document.createElement('span');
  dateSpan.textContent = ev.firstTiming?.begin
    ? formatDate(ev.firstTiming.begin)
    : (ev.dateRange?.fr || 'Date à confirmer');
  dateRow.appendChild(dateSpan);
  meta.appendChild(dateRow);

  if (ev.location?.name) {
    const locRow = document.createElement('div');
    locRow.className = 'event-card__meta-row';
    locRow.innerHTML = iconSvg('location');
    const locSpan = document.createElement('span');
    locSpan.textContent = ev.location.name;
    locRow.appendChild(locSpan);
    meta.appendChild(locRow);
  }

  body.appendChild(meta);

  const cta = document.createElement('span');
  cta.className = 'event-card__cta';
  cta.setAttribute('aria-hidden', 'true');
  cta.innerHTML = 'Voir l\'événement ' + iconSvg('arrow');
  body.appendChild(cta);

  a.appendChild(imgWrap);
  a.appendChild(body);
  article.appendChild(a);
  return article;
}


// ── Fiche détail
// ─────────────────────────────────────────────

function openDetail(uid) {
  const ev = allEvents.find(e => e.uid === uid);
  if (!ev) return;

  history.pushState({ uid }, '', '?id=' + uid);
  showPage('detail');
  renderDetail(ev);

  requestAnimationFrame(() => {
    document.getElementById('back-btn')?.focus();
  });

  announce('Fiche événement : ' + (ev.title?.fr || 'Événement'));
}

function renderDetail(ev) {
  // Image héro
  const heroEl = document.getElementById('detail-hero-img');
  if (ev.image?.base) {
    const pic = document.createElement('picture');
    const img = document.createElement('img');
    img.src     = ev.image.base + (ev.image.base.includes('?') ? '&' : '?') + 'w=1400';
    img.alt     = '';
    img.loading = 'eager';
    img.width   = 1400;
    img.height  = 480;
    pic.appendChild(img);
    heroEl.innerHTML = '';
    heroEl.appendChild(pic);
    heroEl.style.display = 'block';
  } else {
    heroEl.style.display = 'none';
  }

  // Contenu principal
  const main = document.getElementById('detail-main');
  main.setAttribute('aria-busy', 'false');
  main.innerHTML = '';

  // Catégorie
  if (ev.keywords?.fr) {
    const cat = document.createElement('p');
    cat.className = 'detail-category';
    cat.textContent = ev.keywords.fr.split(',')[0].trim();
    main.appendChild(cat);
  }

  // Titre
  const h1 = document.createElement('h1');
  h1.className = 'detail-title';
  h1.textContent = ev.title?.fr || 'Sans titre';
  main.appendChild(h1);

  // Grille méta
  const metaGrid = document.createElement('div');
  metaGrid.className = 'detail-meta-grid';

  const timeValue = ev.firstTiming?.begin
    ? formatTime(ev.firstTiming.begin) + (ev.firstTiming?.end ? ' – ' + formatTime(ev.firstTiming.end) : '')
    : 'À confirmer';

  const locationValue = [ev.location?.name, ev.location?.address]
    .filter(Boolean).join(' — ');

  [
    { icon: 'calendar', label: 'Date',    value: ev.firstTiming?.begin ? formatDate(ev.firstTiming.begin) : (ev.dateRange?.fr || 'À confirmer') },
    { icon: 'clock',    label: 'Horaire', value: timeValue },
    { icon: 'location', label: 'Lieu',    value: locationValue },
    { icon: 'ticket',   label: 'Tarifs',  value: ev.conditions?.fr || 'Voir détails' },
  ].forEach(({ icon, label, value }) => {
    if (!value) return;
    const item = document.createElement('div');
    item.className = 'detail-meta-item';
    item.innerHTML = iconSvg(icon);

    const text  = document.createElement('div');
    const lEl   = document.createElement('div');
    lEl.className = 'detail-meta-item__label';
    lEl.textContent = label;
    const vEl   = document.createElement('div');
    vEl.className = 'detail-meta-item__value';
    vEl.textContent = value;

    text.appendChild(lEl);
    text.appendChild(vEl);
    item.appendChild(text);
    metaGrid.appendChild(item);
  });

  main.appendChild(metaGrid);

  // Description
  if (ev.description?.fr) {
    const desc = document.createElement('div');
    desc.className = 'detail-desc';
    desc.innerHTML = ev.description.fr; // HTML éditorial de l'API OpenAgenda
    main.appendChild(desc);
  }

  // Section vidéo
  const videoSection = document.createElement('section');
  videoSection.className = 'detail-video';
  videoSection.setAttribute('aria-label', 'Vidéo de présentation');

  const videoTitle = document.createElement('h2');
  videoTitle.textContent = 'Aperçu vidéo';

  const videoWrap = document.createElement('div');
  videoWrap.className = 'video-wrapper';

  const video = document.createElement('video');
  video.controls = true;
  video.preload  = 'metadata';
  video.setAttribute('poster', ev.image?.base || '');

  const track = document.createElement('track');
  track.kind    = 'captions';
  track.label   = 'Français';
  track.srclang = 'fr';
  track.default = true;

  const srcMp4  = document.createElement('source');
  srcMp4.type  = 'video/mp4';
  srcMp4.src   = '';

  const srcWebm = document.createElement('source');
  srcWebm.type = 'video/webm';
  srcWebm.src  = '';

  const fallback = document.createElement('p');
  fallback.textContent = 'Votre navigateur ne supporte pas la lecture vidéo. ';
  const fallbackLink = document.createElement('a');
  fallbackLink.href = '#';
  fallbackLink.textContent = 'Télécharger la vidéo.';
  fallback.appendChild(fallbackLink);

  video.append(track, srcMp4, srcWebm, fallback);
  videoWrap.appendChild(video);
  videoSection.append(videoTitle, videoWrap);
  main.appendChild(videoSection);
}


// ── Init
// ─────────────────────────────────────────────

async function init() {
  window.addEventListener('popstate', e => {
    if (e.state?.uid) {
      const ev = allEvents.find(x => x.uid === e.state.uid);
      if (ev) { showPage('detail'); renderDetail(ev); return; }
    }
    showPage('home');
  });

  const section = document.getElementById('events-section');
  section.setAttribute('aria-busy', 'true');
  announce('Chargement des événements en cours…');

  try {
    allEvents = await fetchEvents();
    renderEvents(allEvents);

    const id = new URLSearchParams(window.location.search).get('id');
    if (id) {
      const ev = allEvents.find(e => e.uid === id);
      if (ev) { showPage('detail'); renderDetail(ev); }
    }
  } catch (err) {
    console.error('Erreur chargement événements:', err);
    section.setAttribute('aria-busy', 'false');
    document.getElementById('events-container').innerHTML = `
      <div class="status-message" role="alert">
        <div class="status-message__icon" aria-hidden="true">⚠️</div>
        <p><strong>Impossible de charger les événements.</strong></p>
        <p>Vérifiez votre connexion ou réessayez dans quelques instants.</p>
        <button class="filter-btn" style="margin-top:1rem" onclick="init()">Réessayer</button>
      </div>`;
    announce('Erreur : impossible de charger les événements. Veuillez réessayer.');
  }
}

// Exposer les fonctions nécessaires au HTML inline
window.showPage  = showPage;
window.goBack    = goBack;
window.setFilter = setFilter;
window.init      = init;

init();
