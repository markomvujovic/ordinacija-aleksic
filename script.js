document.documentElement.classList.add('js');

/* ---------- Mobilni meni ---------- */
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('mobile-menu');

function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
  menu.hidden = !open;
}
toggle.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

/* ---------- Ivica navigacije pri skrolu ---------- */
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Tabovi usluga ---------- */
const tabs = [...document.querySelectorAll('.svc-tab')];

function selectTab(tab, focus = false) {
  tabs.forEach((t) => {
    const active = t === tab;
    t.setAttribute('aria-selected', String(active));
    t.tabIndex = active ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !active;
  });
  if (focus) tab.focus();
  // na telefonu su tabovi horizontalna traka: izabrani centriramo, da se vide i susedni
  const strip = tab.parentElement;
  if (strip.scrollWidth > strip.clientWidth) {
    const t = tab.getBoundingClientRect();
    const s = strip.getBoundingClientRect();
    strip.scrollBy({ left: t.left - s.left - (s.width - t.width) / 2, behavior: 'smooth' });
  }
}

tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (e) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (e.key in keys) {
      e.preventDefault();
      selectTab(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true);
    }
  });
});

// linkovi u futeru otvaraju odgovarajući tab
document.querySelectorAll('[data-tab]').forEach((link) => {
  link.addEventListener('click', () => selectTab(document.getElementById(link.dataset.tab)));
});

/* ---------- Radno vreme: status „otvoreno“ i današnji dan ---------- */
// [otvaranje, zatvaranje] u minutima od ponoći; indeks = Date.getDay() (0 = nedelja)
const HOURS = [null, [480, 1200], [480, 1200], [480, 1200], [480, 1200], [480, 1200], [480, 900]];
const DAY_NAMES = ['nedelju', 'ponedeljak', 'utorak', 'sredu', 'četvrtak', 'petak', 'subotu'];
const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

// vreme u Čačku, bez obzira na vremensku zonu posetioca
const local = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Belgrade' }));
const today = local.getDay();
const nowMin = local.getHours() * 60 + local.getMinutes();

function openStatusText() {
  const h = HOURS[today];
  if (h && nowMin >= h[0] && nowMin < h[1]) return [true, `Otvoreno danas do ${fmt(h[1])}`];
  if (h && nowMin < h[0]) return [false, `Zatvoreno · otvaramo danas u ${fmt(h[0])}`];
  let d = (today + 1) % 7;
  while (!HOURS[d]) d = (d + 1) % 7;
  const when = d === (today + 1) % 7 ? 'sutra' : `u ${DAY_NAMES[d]}`;
  return [false, `Zatvoreno · otvaramo ${when} u ${fmt(HOURS[d][0])}`];
}

const [isOpen, statusText] = openStatusText();
document.querySelectorAll('[data-open-status]').forEach((status) => {
  status.classList.add(isOpen ? 'is-open' : 'is-closed');
  status.querySelector('.status__text').textContent = statusText;
});

document.querySelectorAll(`[data-day="${today}"]`).forEach((el) => el.classList.add('is-today'));

/* ---------- Aktivan link u navigaciji ---------- */
const navLinks = [...document.querySelectorAll('.nav__links a')];
// sve sekcije sa id-jem, redom kao na stranici - i one bez linka u navigaciji (npr. Utisci),
// da dok ste u njima ne ostane istaknut link prethodne sekcije
const spySections = [...document.querySelectorAll('main section[id]')];

function setActive(id) {
  navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
}

// Dok stranica skroluje posle klika na link, ne pratimo sekcije usput -
// inače bi svaki link između trenutnog i izabranog nakratko postao aktivan.
let spyLocked = false;
let unlockTimer;
function onScrollWhileLocked() {
  clearTimeout(unlockTimer);
  unlockTimer = setTimeout(() => {
    spyLocked = false;
    window.removeEventListener('scroll', onScrollWhileLocked);
  }, 150);
}
function lockSpy() {
  spyLocked = true;
  window.addEventListener('scroll', onScrollWhileLocked, { passive: true });
  onScrollWhileLocked();
}

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  lockSpy();
  setActive(link.getAttribute('href').slice(1));
});

// Aktivna je poslednja sekcija čiji je vrh prešao sredinu ekrana.
// Dok je hero u fokusu (nijedna sekcija nije stigla do sredine), nijedan link nije aktivan.
// Na samom dnu stranice aktivna je poslednja sekcija (Kontakt), čak i ako ne stigne do sredine.
function updateActiveFromScroll() {
  if (spyLocked) return;
  const line = window.innerHeight * 0.45;
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  let current = null;
  spySections.forEach((s) => { if (s.getBoundingClientRect().top <= line) current = s.id; });
  if (atBottom && spySections.length) current = spySections[spySections.length - 1].id;
  setActive(current);
}

let spyFrame;
window.addEventListener('scroll', () => {
  cancelAnimationFrame(spyFrame);
  spyFrame = requestAnimationFrame(updateActiveFromScroll);
}, { passive: true });
window.addEventListener('resize', updateActiveFromScroll);
updateActiveFromScroll();

/* ---------- Pojavljivanje pri skrolu ---------- */
const reveal = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      reveal.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => reveal.observe(el));

document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = local.getFullYear(); });

/* ---------- FAQ: animirano otvaranje/zatvaranje, najviše jedno otvoreno ---------- */
const FAQ_MS = 350;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const faqItems = [...document.querySelectorAll('.qa')];

function setQa(item, open) {
  const body = item.querySelector('.qa__body');
  item.dataset.state = open ? 'open' : 'closed';
  const from = item.open ? body.getBoundingClientRect().height : 0;   // trenutna visina, i usred prekinute animacije
  item._anim?.cancel();

  if (reduceMotion.matches) { item.open = open; return; }

  item.open = true;
  const to = open ? body.scrollHeight : 0;
  item._anim = body.animate(
    [{ height: `${from}px`, opacity: open ? 0 : 1 },
     { height: `${to}px`, opacity: open ? 1 : 0 }],
    { duration: FAQ_MS, easing: 'cubic-bezier(.4, 0, .2, 1)' }
  );
  item._anim.onfinish = () => {
    item._anim = null;
    if (!open) item.open = false;
  };
}

faqItems.forEach((item) => {
  item.dataset.state = item.open ? 'open' : 'closed';
  item.querySelector('summary').addEventListener('click', (e) => {
    e.preventDefault();
    const open = item.dataset.state !== 'open';
    if (open) faqItems.forEach((other) => { if (other !== item && other.dataset.state === 'open') setQa(other, false); });
    setQa(item, open);
  });
});

/* ---------- Galerija: uvećan prikaz (lightbox) ---------- */
const lightbox = document.querySelector('.lightbox');
if (lightbox) {
  const shots = [...document.querySelectorAll('[data-lightbox] img')];
  const lbImg = lightbox.querySelector('.lightbox__img');
  const lbCaption = lightbox.querySelector('[data-lb-caption]');
  const lbCount = lightbox.querySelector('[data-lb-count]');
  let current = 0;
  let opener = null;

  function show(i) {
    current = (i + shots.length) % shots.length;   // u krug: posle poslednje ide prva
    const src = shots[current];
    lbImg.classList.add('is-loading');
    lbImg.onload = () => lbImg.classList.remove('is-loading');
    lbImg.src = src.currentSrc || src.src;
    lbImg.alt = src.alt;
    lbCaption.textContent = src.alt;
    lbCount.textContent = `${current + 1} / ${shots.length}`;
  }

  function open(i, btn) {
    opener = btn;
    show(i);
    document.documentElement.classList.add('lb-open');
    lightbox.showModal();
    lightbox.querySelector('[data-lb-next]').focus();
  }

  shots.forEach((img, i) => img.closest('[data-lightbox]').addEventListener('click', (e) => open(i, e.currentTarget)));
  lightbox.querySelector('[data-lb-prev]').addEventListener('click', () => show(current - 1));
  lightbox.querySelector('[data-lb-next]').addEventListener('click', () => show(current + 1));
  lightbox.querySelector('[data-lb-close]').addEventListener('click', () => lightbox.close());

  // klik na zatamnjeni deo (van slike i dugmadi) zatvara prikaz
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox__figure')) lightbox.close();
  });

  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
  });   // Esc zatvara <dialog> sam

  // prevlačenje prstom na telefonu
  let touchX = null;
  lightbox.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  lightbox.addEventListener('close', () => {
    document.documentElement.classList.remove('lb-open');
    opener?.focus({ preventScroll: true });
  });
}
