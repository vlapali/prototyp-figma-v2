// Prototyp Dovolená za benefity – verze podle Design systému v2 (Figma: Landing 225:202, List 226:1608, Detail 223:721, Checkout 227:1322).
// Funguje bez serveru (file://), hash routing:
// #/ · #/hledat?q=&typ=&mesto= · #/hotel/<id> · #/zajezd/<id> · #/rezervace · #/potvrzeni
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $('#app'), hdr = $('#hdr'), ftr = $('#ftr');
  const kc = n => Math.round(n).toLocaleString('cs-CZ').replace(/ /g, ' ') + ' Kč';
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fold = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const plural = (n, a, b, c) => n === 1 ? a : n > 1 && n < 5 ? b : c;
  const score = n => String(n).replace('.', ',');

  const D = window.DATA, HOTELS = D.hotels, TRIPS = D.trips;
  const byId = id => HOTELS.find(h => h.id === id);
  // Kapacita pokoje podle postelí (rozkládací pohovka i patrová postel = 2 os.). Booking archiv Svatého Vavřince
  // má maxGuests = 2 jen proto, že se hledalo pro 2 osoby – ceny platí pro 2, pokoje ale pojmou víc.
  const ROOM_CAP = { 'svv-1': 4, 'svv-2': 4, 'svv-3': 4, 'svv-4': 4, 'svv-5': 8, 'svv-6': 6, 'svv-7': 6, 'svv-8': 4, 'svv-9': 6, 'svv-10': 6, 'svv-11': 8 };
  // t.base = obsazenost, pro kterou platí cena v datech; t.maxGuests = kapacita pokoje
  for (const h of HOTELS) for (const r of h.rooms) {
    r.maxGuests = Math.max(r.maxGuests, ROOM_CAP[r.id] || 0);
    for (const t of r.rates) { t.base ??= t.maxGuests; t.maxGuests = Math.max(t.base, r.maxGuests); }
  }
  const tripById = id => TRIPS.find(t => t.id === id);
  const FEATURED = HOTELS.find(h => h.featured);
  const FEE = 0.079;

  const ic = {
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    mic: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    guests: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M19 8v6M16 11h6"/></svg>',
    cup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 8h13v5a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V8zM17 9h1.5a2.5 2.5 0 0 1 0 5H17M7 3v2M11 3v2M15 3v2"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    pin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    person: '<svg viewBox="0 0 12 13" fill="currentColor"><circle cx="6" cy="3" r="3"/><path d="M0 13a6 6 0 0 1 12 0z"/></svg>',
    info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7.5v.5" stroke-linecap="round"/></svg>',
    down: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>',
    right: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg>',
    left: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 6-6 6 6 6"/></svg>',
    plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>',
    ticket: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z"/><path d="m9 15 6-6" stroke-linecap="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="m2 7 10 7 10-7"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 2"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
    plane: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M10.5 13.5 3 11l1.5-1.5 7.5 1L16 6.5a2 2 0 0 1 3 3L15 13.5l1 7.5-1.5 1.5-2.5-7.5L9 18v3l-1.5 1L6 18l-4-1.5L3 15h3z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8S10.5 3 8 4s0 4 4 4zm0 0s1.5-5 4-4-0 4-4 4z"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.5 2.5 0 0 1 4.9.8c0 1.7-2.4 2.2-2.4 3.7M12 17h.01"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 8l-4 4 4 4M6 12h10"/></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    card: '<svg viewBox="0 0 48 32" fill="none" stroke="#0C1B3A" stroke-width="3" stroke-linecap="round"><rect x="2" y="2" width="34" height="24" rx="3"/><path d="M2 10h34M8 19h8M40 18v12M34 24h12"/></svg>',
    flag: '<svg class="flag" viewBox="0 0 16 11"><rect width="16" height="5.5" fill="#fff"/><rect y="5.5" width="16" height="5.5" fill="#D7141A"/><path d="M0 0l8 5.5L0 11z" fill="#11457E"/><rect x=".25" y=".25" width="15.5" height="10.5" fill="none" stroke="#ddd" stroke-width=".5"/></svg>',
  };

  // ---------- stav (sessionStorage, ve file:// může chybět) ----------
  const DEF_IN = '2027-04-09', DEF_OUT = '2027-04-11';
  const load = () => { try { return JSON.parse(sessionStorage.getItem('dzb3') || 'null'); } catch { return null; } };
  const S = Object.assign({
    checkIn: DEF_IN, checkOut: DEF_OUT, adults: 2, kids: 0, datesTouched: false,
    sel: {}, fBreak: false, fFree: false,
    cart: null, pay: 'edenred', split: false, pointsAmount: null, voucher: '',
    form: { first: '', last: '', email: '', cc: '+420', phone: '', country: 'Česko', note: '' },
    booking: null, points: 8000, tab: 'hotely',
  }, load() || {});
  const save = () => { try { sessionStorage.setItem('dzb3', JSON.stringify(S)); } catch {} };

  // ---------- datum ----------
  const d = iso => new Date(iso + 'T12:00:00');
  const iso = dt => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  const addDays = (s, n) => { const x = d(s); x.setDate(x.getDate() + n); return iso(x); };
  const nightsOf = (a, b) => Math.max(1, Math.round((d(b) - d(a)) / 864e5));
  const nights = () => nightsOf(S.checkIn, S.checkOut);
  const fmtD = s => { const x = d(s); return `${x.getDate()}. ${x.getMonth() + 1}. ${x.getFullYear()}`; };
  const fmtShort = s => { const x = d(s); return `${x.getDate()}. ${x.getMonth() + 1}.`; };
  const fmtRange = (a = S.checkIn, b = S.checkOut) => `${fmtShort(a)} – ${fmtD(b)}`;
  const nightsTxt = n => `${n} ${plural(n, 'noc', 'noci', 'nocí')}`;
  const guestsTxt = (a = S.adults, k = S.kids) => `${a} ${plural(a, 'dospělý', 'dospělí', 'dospělých')}` + (k ? `, ${k} ${plural(k, 'dítě', 'děti', 'dětí')}` : '');
  const guests = () => S.adults + S.kids;

  // ---------- ceny hotelů ----------
  // Sazba v datech platí pro t.base osob. Každá osoba navíc +10 %, každá méně −10 %, nejvýš ±30 % (demo pravidlo).
  const OCC_STEP = 0.1, OCC_MAX = 0.3;
  const occFactor = (t, occ) => 1 + Math.max(-OCC_MAX, Math.min(OCC_MAX, OCC_STEP * (occ - t.base)));
  const occPN = (t, occ) => t.perNight * occFactor(t, occ);
  // rozdělení hostů do k pokojů stejné sazby – plní se postupně, v každém pokoji aspoň 1 osoba
  const splitGuests = (g, max, k) => Array.from({ length: k }, (_, i) => Math.max(1, Math.min(max, g - max * i)));
  const ratePN = (t, k = 1, g = Math.max(1, guests())) => splitGuests(g, t.maxGuests, k).reduce((s, o) => s + occPN(t, o), 0);
  const minPerNight = h => Math.min(...h.rooms.flatMap(r => r.rates.filter(t => t.base >= 2 || h.rooms.every(x => x.maxGuests < 2)).map(t => occPN(t, Math.min(Math.max(1, guests()), t.maxGuests)))));
  const fromStay = h => {
    // nejlevnější kombinace pro aktuální počet hostů (pokoje stejného typu)
    const g = Math.max(1, guests()), n = nights();
    let best = Infinity;
    for (const r of h.rooms) for (const t of r.rates) {
      if (g >= 2 && t.base < 2) continue;
      const cnt = Math.ceil(g / t.maxGuests); best = Math.min(best, ratePN(t, cnt, g) * n);
    }
    return best;
  };
  const cancelUntil = (rate, checkIn = S.checkIn) => rate.cancelDays ? fmtD(addDays(checkIn, -rate.cancelDays)) + ' 23:59' : null;

  function visibleRates(h, room) {
    return room.rates.filter(t => {
      if (S.fBreak && !t.breakfast) return false;
      if (S.fFree && !t.refundable) return false;
      if (guests() === 1) return t.base === 1 || !room.rates.some(x => x.base === 1 && x.breakfast === t.breakfast && x.refundable === t.refundable);
      return t.base >= 2 || room.maxGuests === 1;
    });
  }

  function hotelTotals(h, sel, ci, co, adults, g = adults) {
    const n = nightsOf(ci, co); let acc = 0, cap = 0, rooms = 0; const items = [];
    for (const [key, q] of Object.entries(sel || {})) {
      if (!q) continue;
      const [rid, tid] = key.split('|');
      const room = h.rooms.find(r => r.id === rid), rate = room?.rates.find(t => t.id === tid);
      if (!rate) continue;
      items.push({ room, rate, q });
    }
    // hosté se rozdělí nejdřív do největších pokojů; každý pokoj se pak platí podle své obsazenosti
    let left = Math.max(1, g);
    for (const i of [...items].sort((a, b) => b.rate.maxGuests - a.rate.maxGuests)) {
      i.occ = Array.from({ length: i.q }, () => { const o = Math.max(1, Math.min(i.rate.maxGuests, left)); left -= o; return o; });
      i.price = i.occ.reduce((s, o) => s + Math.round(occPN(i.rate, o) * n), 0);
    }
    for (const i of items) { acc += i.price; cap += i.rate.maxGuests * i.q; rooms += i.q; }
    const fee = Math.round(acc * FEE), cityTax = Math.round(h.cityTax * adults * n);
    return { n, acc, fee, cityTax, now: acc + fee, total: acc + fee + cityTax, cap, rooms, items };
  }

  // ---------- ceny zájezdů ----------
  const MEAL_ORDER = ['Pouze pokoj', 'Snídaně v ceně', 'Polopenze', 'Plná penze', 'All inclusive'];
  const tripPP = (t, room, meal) => {
    const base = t.price.pricePerPerson, m = t.meals.find(x => x.meal === meal);
    if (!m || m.pricePerPerson == null) return null;
    return room.pricePerPerson + (m.pricePerPerson - base);
  };
  const FEAT_CS = { 'Air conditioning': 'Klimatizace', Television: 'Televize', Balcony: 'Balkon', 'Sea view': 'Výhled na moře', Minibar: 'Minibar', Safe: 'Trezor', 'Hair dryer': 'Fén', 'Free WiFi': 'Wi-Fi zdarma', Kettle: 'Rychlovarná konvice', Bathtub: 'Vana', Shower: 'Sprcha', Terrace: 'Terasa' };

  // ---------- společné části ----------
  const logo = dark => `<a class="logo" href="#/"><span class="sun"><img class="s1" src="assets/v2/logo-sun.svg" alt=""><img class="s2" src="assets/v2/logo-line${dark ? '-dark' : ''}.svg" alt=""></span><span>Dovolená za <b>benefity</b></span></a>`;
  const stars = n => n ? `<span class="stars" aria-label="${n} hvězdy">${'★'.repeat(n)}</span>` : '';
  const ptsTxt = n => Math.round(n).toLocaleString('cs-CZ').replace(/ /g, ' ') + ' b.';

  // Navbar v2 (201:507): Desktop/Mobile × Světlý/Tmavý, menu 201:446
  const NAV = () => [['Hotely', href('hledat', { druh: 'hotel' })], ['Zájezdy', href('hledat', { druh: 'trip' })], ['Pronájem aut', '#/', 'Pronájem aut není součástí prototypu.'], ['Jak to funguje', '#/#jak']];
  function header(variant) {
    const dark = variant === 'hero';
    hdr.className = 'hdr' + (dark ? ' dark' : '');
    const cur = parseHash().q.druh;
    const navLink = ([l, h, t]) => `<a href="${h}"${t ? ` data-toast="${t}"` : ''}${(cur === 'hotel' && l === 'Hotely') || (cur === 'trip' && l === 'Zájezdy') ? ' class="on"' : ''}>${l}</a>`;
    const mi = (icon, label, extra = '', toastMsg = 'Účet není součástí prototypu.') => `<button class="mi" data-toast="${toastMsg}">${icon}<span>${label}</span>${extra}</button>`;
    hdr.innerHTML = `<div class="bar">${logo(dark)}
      <nav aria-label="Hlavní">${NAV().map(navLink).join('')}</nav>
      <div class="hdr-r">
        <button class="btn btn-outline login" data-toast="Přihlášení přes benefitní platformu – v prototypu se přihlásíte až v kroku platby.">${ic.user}Přihlásit se</button>
        <button class="menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false" aria-controls="menuDd">${ic.menu}</button>
        <div class="dropdown" id="menuDd" hidden>
          ${NAV().map(([l, h, t]) => `<a class="ml mob" href="${h}"${t ? ` data-toast="${t}"` : ''}>${l}${ic.arrow}</a>`).join('')}
          <hr class="mob">
          ${mi(ic.user, 'Můj účet')}${mi(ic.bag, 'Moje rezervace')}${mi(ic.gift, 'Benefitní body', `<span class="tag tag-sunset">${ptsTxt(S.points)}</span>`, `Zůstatek ${kc(S.points)} – upravíte ho ve výsledcích hledání.`)}
          <hr>
          ${mi(ic.flag, 'Česko', '', 'Jiné jazyky nejsou součástí prototypu.')}${mi(ic.help, 'Nápověda', '', 'Nápověda není součástí prototypu.')}${mi(ic.logout, 'Odhlásit se')}
        </div>
      </div></div>`;
    const btn = $('#menuBtn'), dd = $('#menuDd');
    const close = () => { dd.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.innerHTML = ic.menu; document.removeEventListener('click', away); };
    const away = e => { if (!dd.contains(e.target) && !btn.contains(e.target)) close(); };
    btn.onclick = () => {
      if (!dd.hidden) return close();
      dd.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.innerHTML = ic.x;
      setTimeout(() => document.addEventListener('click', away), 0);
    };
    dd.addEventListener('click', e => { if (e.target.closest('a,button')) close(); });
  }

  function footer() {
    const A = 'assets/home/';
    const link = (label, href) => `<li><a href="${href || '#/'}"${href ? '' : ' data-toast="Stránka není součástí prototypu."'}>${label}</a></li>`;
    const cities = ['Praha', 'Karlovy Vary', 'Budapešť', 'Florencie', 'Londýn', 'Madrid'];
    ftr.innerHTML = `<div class="wrap">${logo()}
      <div class="ftr-cols">
        <div><h5>Podpora</h5><ul>${link(`${ic.help}Centrum nápovědy`)}${link(`${ic.mail}podpora@dovolena-za-benefity.cz`)}</ul></div>
        <div><h5>Oblíbené destinace</h5><ul>${cities.map(c => link(c, href('hledat', { mesto: c }))).join('')}${link('<b>+ další destinace</b>', href('hledat', {}))}</ul></div>
        <div><h5>Dovolená za benefity</h5><ul>${link('Jak to funguje', '#/#jak')}${['Blog', 'Časté dotazy', 'O nás', 'Kontakt'].map(x => link(x)).join('')}</ul></div>
        <div><h5>Benefitní platformy</h5><ul>${['Edenred Benefity', 'Benefit Plus', 'Up Benefity'].map(x => link(x)).join('')}</ul></div>
      </div>
      <div class="ftr-bottom"><div class="legal">© 2026 Dovolená za benefity<span>•</span><a href="#/" data-toast="Stránka není součástí prototypu.">Obchodní podmínky</a><span>•</span><a href="#/" data-toast="Stránka není součástí prototypu.">Ochrana osobních údajů</a><span>•</span><a href="#/" data-toast="Stránka není součástí prototypu.">Cookies</a></div>
      <div class="socials">${['Linkedin', 'X', 'Instagram', 'Facebook', 'Youtube'].map(s => `<a href="#/" aria-label="${s}" data-toast="Odkaz v prototypu nevede nikam."><img src="${A}img${s}.svg" alt=""></a>`).join('')}</div></div>
      <p class="demo-note">Interní prototyp k pohovoru. Texty, hodnocení a fotky hotelů pocházejí z archivovaných stránek Booking.com a Lastminute.cz a slouží jen pro ukázku. Ceny hotelů kromě Aparthotelu Svatý Vavřinec jsou smyšlené, žádná rezervace se neodesílá.</p>
    </div>`;
  }

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 3200);
  }

  // Popover pro termín a hosty
  function openPop(anchor, kind, onDone) {
    closePop();
    const p = document.createElement('div'); p.className = 'pop'; p.id = 'pop';
    if (kind === 'dates') {
      p.innerHTML = `<div class="row2"><label for="pIn">Příjezd</label><input class="inp" type="date" id="pIn" value="${S.checkIn}" min="2026-11-05"></div>
        <div class="row2"><label for="pOut">Odjezd</label><input class="inp" type="date" id="pOut" value="${S.checkOut}"></div>
        <div class="quick">${[1, 2, 3, 5, 7].map(n => `<button type="button" class="chip chip-sm" data-n="${n}">${nightsTxt(n)}</button>`).join('')}</div>
        <p class="xs muted" id="pN" style="margin:6px 0 0">${nightsTxt(nights())}</p>
        <button class="btn btn-primary btn-sm" id="pOk" style="width:100%;margin-top:10px">Potvrdit termín</button>`;
      const upd = () => { const a = $('#pIn', p).value, b = $('#pOut', p).value; $('#pN', p).textContent = a && b && b > a ? nightsTxt(nightsOf(a, b)) : 'Odjezd musí být po příjezdu'; };
      p.addEventListener('input', upd);
      p.addEventListener('click', e => { const b = e.target.closest('[data-n]'); if (b) { $('#pOut', p).value = addDays($('#pIn', p).value || S.checkIn, +b.dataset.n); upd(); } });
    } else {
      const st = (k, l, sub) => `<div class="row2"><span>${l}<small class="muted" style="display:block;font-size:12px">${sub}</small></span><span class="stp"><button type="button" data-k="${k}" data-d="-1" aria-label="Ubrat">−</button><b id="v-${k}">${S[k]}</b><button type="button" data-k="${k}" data-d="1" aria-label="Přidat">+</button></span></div>`;
      p.innerHTML = st('adults', 'Dospělí', 'od 18 let') + st('kids', 'Děti', '0–17 let') + `<button class="btn btn-primary btn-sm" id="pOk" style="width:100%;margin-top:8px">Potvrdit</button>`;
      p.addEventListener('click', e => {
        const b = e.target.closest('[data-k]'); if (!b) return;
        const k = b.dataset.k, min = k === 'adults' ? 1 : 0;
        S[k] = Math.min(8, Math.max(min, S[k] + +b.dataset.d)); $('#v-' + k).textContent = S[k];
      });
    }
    document.body.appendChild(p);
    const r = anchor.getBoundingClientRect();
    p.style.top = (r.bottom + scrollY + 8) + 'px';
    p.style.left = Math.max(8, Math.min(r.left + scrollX, innerWidth - p.offsetWidth - 8)) + 'px';
    $('#pOk', p).onclick = () => {
      if (kind === 'dates') {
        const a = $('#pIn').value, b = $('#pOut').value;
        if (!a || !b || b <= a) { toast('Odjezd musí být po příjezdu.'); return; }
        S.checkIn = a; S.checkOut = b; S.datesTouched = true;
      }
      save(); closePop(); onDone && onDone();
    };
    setTimeout(() => document.addEventListener('click', outside), 0);
  }
  function outside(e) { const p = $('#pop'); if (p && !p.contains(e.target)) closePop(); }
  function closePop() { $('#pop')?.remove(); document.removeEventListener('click', outside); }

  function lightbox(list, i = 0) {
    const lb = document.createElement('div'); lb.className = 'lb';
    const draw = () => lb.innerHTML = `<button class="x" aria-label="Zavřít">×</button><button class="nav prev" aria-label="Předchozí">‹</button><img src="${list[i]}" alt=""><span class="cnt">${i + 1} / ${list.length}</span><button class="nav next" aria-label="Další">›</button>`;
    draw();
    const key = e => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') { i = (i + 1) % list.length; draw(); } if (e.key === 'ArrowLeft') { i = (i - 1 + list.length) % list.length; draw(); } };
    const close = () => { lb.remove(); removeEventListener('keydown', key); };
    lb.onclick = e => {
      if (e.target.closest('.next')) { i = (i + 1) % list.length; draw(); }
      else if (e.target.closest('.prev')) { i = (i - 1 + list.length) % list.length; draw(); }
      else if (e.target === lb || e.target.closest('.x')) close();
    };
    addEventListener('keydown', key);
    document.body.appendChild(lb);
  }

  // ---------- routing ----------
  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const [path, qs] = h.split('?');
    const [name, id] = path.split('/');
    return { name: name || '', id: id ? decodeURIComponent(id) : null, q: Object.fromEntries(new URLSearchParams(qs || '')) };
  }
  const href = (name, params = {}, id) => '#/' + name + (id ? '/' + encodeURIComponent(id) : '') + (Object.keys(params).length ? '?' + new URLSearchParams(params) : '');
  const go = (name, params, id) => { location.hash = href(name, params, id); };

  // ---------- hledání ----------
  const TYPE = {
    wellness: { label: 'Wellness a spa', keys: ['wellness', 'spa', 'sauna', 'lazn', 'masaz', 'virivk'] },
    'moře': { label: 'Moře', keys: ['more', 'plaz', 'beach', 'ostrov'] },
    'město': { label: 'Města', keys: ['mesto', 'mesta', 'city', 'metropol'] },
    'příroda': { label: 'Hory a příroda', keys: ['hory', 'hora', 'krkonos', 'snezk', 'lyz', 'priroda', 'turist', 'les'] },
    rodiny: { label: 'S dětmi', keys: ['deti', 'detm', 'rodin', 'dite'] },
    romantika: { label: 'Romantika', keys: ['romant', 'pro dva', 'vyroci', 'partner', 'zamek'] },
  };
  const TYPE_BY_TILE = { 'Wellness a spa': 'wellness', 'Moře': 'moře', 'Města': 'město', 'Hory': 'příroda', 'S dětmi': 'rodiny', 'Romantika': 'romantika' };

  function interpret(q) {
    const f = fold(q), out = { types: [], text: [], budget: null, nights: null, hotelId: null, scope: null };
    const url = q.match(/booking\.com\/hotel\/\w+\/([\w-]+)/i);
    if (url) out.hotelId = HOTELS.find(h => h.id === url[1] || fold(h.name).replace(/[^a-z0-9]+/g, '-').includes(url[1].split('.')[0]))?.id || null;
    const b = f.match(/(\d[\d\s.]*)\s*(bod|kc|korun|tis)/);
    if (b) { let v = +b[1].replace(/[\s.]/g, ''); if (b[2] === 'tis') v *= 1000; out.budget = v; }
    const n = f.match(/(\d+)\s*(noc|dn)/); if (n) out.nights = +n[1];
    if (/vikend/.test(f)) out.nights = out.nights || 2;
    if (/zajezd|letenk|last ?minute|let \+|s letem/.test(f)) out.scope = 'trip';
    if (/tuzems|cesk|\bcr\b|doma/.test(f)) out.domestic = true;
    if (/zahranic|ciz/.test(f)) out.abroad = true;
    for (const [k, v] of Object.entries(TYPE)) if (v.keys.some(x => f.includes(x))) out.types.push(k);
    const stop = new Set(['a', 'v', 've', 'na', 'do', 'za', 'pro', 'se', 's', 'hotel', 'hotelu', 'pobyt', 'pobytu', 'chci', 'hledam', 'nejaky', 'nekam', 'bod', 'body', 'bodu', 'kc', 'noc', 'noci', 'nocí', 'vikend', 'mam', 'mame', 'u', 'o', 'na', 'deti', 'detmi', 'dva', 'dve', 'zajezd', 'tuzemsko', 'zahranici', 'cesko', 'cesku', 'ceske', 'doma', 'chceme', 'jet', 'jedeme', 'kde', 'nebo', 'jen', 'tydny', 'tyden']);
    out.text = f.replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stop.has(w) && !/^\d+$/.test(w) && !Object.values(TYPE).some(t => t.keys.some(k => w.startsWith(k))));
    const known = out.text.filter(w => ALL.some(x => hay(x).includes(w)));
    out.unknown = out.text.filter(w => !known.includes(w));
    out.text = known;
    return out;
  }

  const ALL = [...HOTELS, ...TRIPS];
  const hay = x => fold([x.name, x.city, x.country, x.type, ...(x.tripTypes || []), ...(x.amenities || []), ...(x.tags || [])].join(' '));
  function searchResults(params) {
    const I = interpret(params.q || '');
    if (params.typ) I.types = [params.typ];
    let H = HOTELS.slice(), T = TRIPS.slice();
    const match = x => {
      if (params.mesto && fold(x.city) !== fold(params.mesto)) return false;
      if (I.types.length && !I.types.every(t => (x.tripTypes || []).includes(t) || (t === 'příroda' && (x.tripTypes || []).includes('hory')))) return false;
      if (I.domestic && x.countryCode !== 'CZ' && x.kind === 'hotel') return false;
      if (I.domestic && x.kind === 'trip') return false;
      if (I.abroad && x.countryCode === 'CZ') return false;
      if (I.text.length) { const hs = hay(x); if (!I.text.some(w => hs.includes(w))) return false; }
      return true;
    };
    H = H.filter(match); T = T.filter(match);
    const other = I.types.length || I.domestic || I.abroad || I.budget || I.scope || I.text.length || params.mesto || params.typ;
    if (I.unknown.length && !other) { H = []; T = []; }
    if (I.scope === 'trip') H = [];
    if (params.druh === 'hotel') T = []; if (params.druh === 'trip') H = [];
    if (params.snidane) H = H.filter(h => h.rooms.some(r => r.rates.some(t => t.breakfast)));
    if (params.storno) H = H.filter(h => h.rooms.some(r => r.rates.some(t => t.refundable)));
    if (params.hodn) { H = H.filter(h => (h.rating?.score || 0) >= +params.hodn); T = T.filter(t => t.rating5 * 2 >= +params.hodn); }
    if (I.budget) { H = H.filter(h => fromStay(h) <= I.budget); T = T.filter(t => t.price.pricePerPerson * Math.max(1, S.adults) <= I.budget); }
    const sort = params.razeni || 'doporucene';
    const sc = h => (h.featured ? 100 : 0) + (h.rating?.score || 0);
    if (sort === 'cena') H.sort((a, b) => fromStay(a) - fromStay(b)); else if (sort === 'hodnoceni') H.sort((a, b) => (b.rating.score || 0) - (a.rating.score || 0)); else H.sort((a, b) => sc(b) - sc(a));
    if (sort === 'cena') T.sort((a, b) => a.price.pricePerPerson - b.price.pricePerPerson);
    return { H, T, I };
  }

  // ---------- karty ----------
  const cover = (x, i = 0) => x.photos[i] || x.photos[0] || '';
  const hotelCard = h => `<a class="card" href="${href('hotel', {}, h.id)}"><div class="ph tall"><img src="${cover(h)}" alt="" loading="lazy">${h.featured ? '<span class="badge tag tag-sunset">Tip</span>' : ''}</div><h4>${esc(h.name)}</h4><div class="meta">Začíná na ${kc(minPerNight(h))}/noc</div></a>`;
  const tripMeal = t => t.price.selectedMeal;
  const tripCard = t => `<a class="card" href="${href('zajezd', {}, t.id)}"><div class="ph tall"><img src="${cover(t)}" alt="" loading="lazy"></div><h4>${esc(t.name)}</h4><div class="meta">${nightsTxt(t.trip.nights)} • ${fmtShort(t.trip.checkIn)} - ${fmtShort(t.trip.checkOut)}<br>${esc(t.city)}, ${esc(t.country)}<br>Letenka v ceně • z Prahy<br>${esc(tripMeal(t))}</div><div class="price">Od ${kc(t.price.pricePerPerson)}/ osobu</div></a>`;

  // ---------- homepage (Landing DS v2, 225:202) ----------
  const TABS = [
    ['pomocnik', 'Cestovní pomocník', 'Popište dovolenou, třeba „týden u moře do 20 000 bodů“'],
    ['hotely', 'Hotely', 'Kam chcete jet?'],
    ['auto', 'Pronájem vozu', 'Kde si vůz vyzvednete? Město nebo letiště'],
    ['zajezdy', 'Zájezdy', 'Kam chcete letět? Země nebo destinace'],
  ];
  // pod polem: pomocník → návrhy dotazů, hotely / zájezdy → termín a osoby (Figma 224:1331)
  const guestsMeta = () => `${S.adults} ${plural(S.adults, 'dospělý', 'dospělí', 'dospělých')} · ${S.kids} ${plural(S.kids, 'dítě', 'děti', 'dětí')}`;
  const searchExtra = k => k === 'auto'
    ? `<div class="search-meta"><button type="button" data-toast="Pronájem vozu není součástí prototypu.">${ic.cal}<span>Datum vyzvednutí a vrácení</span></button><button type="button" data-toast="Pronájem vozu není součástí prototypu.">${ic.guests}<span>Věk řidiče 30–65 let</span></button></div>`
    : k === 'pomocnik'
    ? `<div class="examples">${['Víkend na horách pro dva', 'Wellness do 10 000 bodů', 'Kam k moři v červnu?'].map(x => `<button type="button" data-ex="${x}">${x}</button>`).join('')}</div>`
    : `<div class="search-meta"><button type="button" id="hDates">${ic.cal}<span>${S.datesTouched ? fmtRange() + ' · ' + nightsTxt(nights()) : k === 'zajezdy' ? 'Termín a délka pobytu' : 'Výběr termínu'}</span></button><button type="button" id="hGuests">${ic.guests}<span>${guestsMeta()} · ${k === 'zajezdy' ? 'Odlet z Prahy' : '1 pokoj'}</span></button></div>`;
  function viewHome() {
    header('hero');
    const M = window.HOME, F = FEATURED;  // F – první v karuselu a v populárních hotelech
    const carousel = HOTELS;  // Svatý Vavřinec je první → začíná uprostřed jako fokus
    const popular = ['aparthotel-svaty-vavrinec', 'grandhotel-pupp', 'romantic-mlyn-karlstejn', 'karlstejn'].map(byId);
    const dest = [
      { city: 'Pec pod Sněžkou', country: 'Česko', img: cover(F, 3) },
      { city: 'Praha', country: 'Česko', img: 'assets/home/imgImage19.jpg' },
      { city: 'Budapešť', country: 'Maďarsko', img: cover(byId('7seasons-apartments-budapest'), 0) },
      { city: 'Florencie', country: 'Itálie', img: cover(byId('numa-florence-vita'), 0) },
    ];
    const tab = TABS.find(t => t[0] === S.tab) || TABS[1];
    app.innerHTML = `
    <section class="hero">
      <div class="wrap">
        <h1>Nevíte, co s <em>benefit body</em>?</h1>
        <form class="search" id="search">
          <div class="tabs" role="tablist">${TABS.map(([k, l]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${k === tab[0]}"${k === tab[0] ? ' class="on"' : ''}>${l}</button>`).join('')}</div>
          <div class="search-box"><input id="q" placeholder="${esc(tab[2])}" aria-label="Hledat" autocomplete="off"><button type="button" class="mic" aria-label="Hlasové zadání" data-toast="Hlasové zadání není součástí prototypu.">${ic.mic}</button></div>
          <div id="searchExtra">${searchExtra(tab[0])}</div>
        </form>
      </div>
      ${dockHtml(carousel)}
    </section>
    <div class="home"><div class="wrap">
      <div class="partners">
        <div class="line">${M.partners.map(p => `<img src="${p.img}" alt="${p.name}" style="height:${p.h}px">`).join('')}</div>
        <div class="line small">${M.platforms.map(p => `<img src="${p.img}" alt="${p.name}" style="height:${p.h}px">`).join('')}</div>
      </div>
      <section class="sec"><h2>Populární destinace</h2><p>Kam se s benefit body jezdí nejčastěji.</p>
        <div class="row grid4">${dest.map(x => `<a class="card" href="${href('hledat', { mesto: x.city })}"><div class="ph"><img src="${x.img}" alt="" loading="lazy"></div><h3 style="margin-top:16px">${x.city}</h3><div class="meta">${x.country}</div></a>`).join('')}</div></section>
      <section class="sec" id="jak"><h2>Jak to funguje</h2>
        <div class="row steps">${M.steps.map(([t, p], i) => `<div class="step"><div class="num">${i + 1}</div><h3>${t}</h3><p>${p}</p></div>`).join('')}</div></section>
      <section class="sec"><div class="sec-h"><h2>Populární hotely</h2><a class="link" href="${href('hledat', { druh: 'hotel' })}">Všech ${HOTELS.length} hotelů ${ic.right}</a></div>
        <div class="row grid4">${popular.map(hotelCard).join('')}</div></section>
      <section class="sec"><div class="sec-h"><h2>Zajímavé lastminute zájezdy</h2><a class="link" href="${href('hledat', { druh: 'trip' })}">Všechny zájezdy ${ic.right}</a></div>
        <div class="row grid4">${TRIPS.slice(0, 4).map(tripCard).join('')}</div></section>
      <section class="sec"><h2>Populární autopůjčovny</h2>
        <div class="row cars">${M.cars.map(c => `<a class="car" href="#/" data-toast="Autopůjčovny nejsou součástí prototypu."><div class="ph"><img src="${c.img}" alt=""></div>${c.name}</a>`).join('')}</div></section>
      <section class="sec"><h2>Jaký typ výletu hledáte?</h2>
        <div class="row types">${M.tripTypes.map(t => `<a class="type" href="${href('hledat', { typ: TYPE_BY_TILE[t.name] })}"><div class="ph"><img src="${t.img}" alt="" loading="lazy"></div>${t.name}</a>`).join('')}</div></section>
    </div></div>`;
    initDock(carousel.length);
    const submit = q => go('hledat', S.tab === 'zajezdy' ? { q, druh: 'trip' } : { q });
    $('#search').onsubmit = e => { e.preventDefault(); if (S.tab === 'auto') { toast('Pronájem vozu není součástí prototypu.'); return; } submit($('#q').value); };
    const bindExtra = () => {
      $$('[data-ex]').forEach(b => b.onclick = () => { $('#q').value = b.dataset.ex; submit(b.dataset.ex); });
      if (!$('#hDates')) return;
      $('#hDates').onclick = e => openPop(e.currentTarget, 'dates', () => { $('#hDates span').textContent = fmtRange() + ' · ' + nightsTxt(nights()); });
      $('#hGuests').onclick = e => openPop(e.currentTarget, 'guests', () => { $('#hGuests span').textContent = `${guestsMeta()} · ${S.tab === 'zajezdy' ? 'Odlet z Prahy' : '1 pokoj'}`; });
    };
    bindExtra();
    $$('[data-tab]').forEach(b => b.onclick = () => {
      S.tab = b.dataset.tab; save();
      $$('[data-tab]').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
      $('#q').placeholder = TABS.find(t => t[0] === S.tab)[2];
      $('#searchExtra').innerHTML = searchExtra(S.tab); bindExtra(); $('#q').focus();
    });
  }

  // ---------- nekonečný carousel (Dock) – Figma 183:2068 ----------
  // Trojitá kopie seznamu; fokus se drží v prostřední kopii a po animaci se bez přechodu vrátí zpět.
  let dockTimer = null;
  const dockSizes = () => innerWidth < 640 ? [200, 164, 136, 112] : [264, 216, 180, 148];
  const DOCK_GAP = 16;

  function dockHtml(list) {
    const tiles = [0, 1, 2].flatMap(() => list).map(h => `<a class="dock-tile" href="${href('hotel', {}, h.id)}" draggable="false">
        <span class="dock-img"><img src="${cover(h)}" alt="" draggable="false"></span>
        <span class="dock-txt"><b>${esc(h.name)}</b><span>od <em>${kc(minPerNight(h))}</em> / noc</span></span></a>`).join('');
    return `<div class="dock" id="dock" role="region" aria-roledescription="carousel" aria-label="Doporučené hotely" tabindex="0">
      <div class="dock-track" id="dockTrack">${tiles}</div>
      <div class="dock-fade l"></div><div class="dock-fade r"></div>
      <button class="dock-arrow prev" type="button" aria-label="Předchozí hotel">${ic.left}</button>
      <button class="dock-arrow next" type="button" aria-label="Další hotel">${ic.right}</button>
    </div>`;
  }

  function initDock(n) {
    const dock = $('#dock'), track = $('#dockTrack'), tiles = [...track.children];
    let f = n, settle = null, paused = false;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function layout(animate) {
      track.classList.toggle('noanim', !animate);
      const S = dockSizes(); let x = 0, cx = 0;
      tiles.forEach((t, i) => {
        const dist = Math.min(Math.abs(i - f), 3), w = S[dist];
        t.style.width = w + 'px';
        t.className = 'dock-tile s' + dist;
        t.tabIndex = Math.abs(i - f) <= 2 ? 0 : -1;
        if (i < f) x += w + DOCK_GAP; else if (i === f) cx = x + w / 2;
      });
      track.style.transform = `translateX(${dock.clientWidth / 2 - cx}px)`;
    }
    function wrap() {
      if (f >= n && f < 2 * n) return;
      f = ((f % n) + n) % n + n;
      layout(false); void track.offsetWidth; track.classList.remove('noanim');
    }
    function move(d) {
      if (f + d < 3 || f + d > 3 * n - 4) wrap();
      f += d; layout(!reduced);
      clearTimeout(settle); settle = setTimeout(wrap, 480);
    }
    layout(false); requestAnimationFrame(() => track.classList.remove('noanim'));

    $('.dock-arrow.prev', dock).onclick = () => move(-1);
    $('.dock-arrow.next', dock).onclick = () => move(1);
    dock.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') move(-1); if (e.key === 'ArrowRight') move(1); });
    // fokus klávesnicí na boční dlaždici ji posune doprostřed
    tiles.forEach((t, i) => t.addEventListener('focus', () => { if (i !== f && t.matches(':focus-visible')) move(i - f); }));

    // swipe / tažení myší
    let x0 = null, dragged = false;
    dock.addEventListener('pointerdown', e => { if (e.target.closest('.dock-arrow')) return; x0 = e.clientX; dragged = false; });
    dock.addEventListener('pointermove', e => { if (x0 != null && Math.abs(e.clientX - x0) > 8) dragged = true; });
    dock.addEventListener('pointerup', e => {
      if (x0 == null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) move(dx < 0 ? Math.min(3, Math.round(-dx / 160) || 1) : -Math.min(3, Math.round(dx / 160) || 1));
    });
    dock.addEventListener('click', e => { if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; } }, true);

    // horizontální scroll (trackpad, Shift + kolečko) – po kroku krátká pauza, ať setrvačnost nepřeskočí půl seznamu
    let acc = 0, lock = 0;
    dock.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (performance.now() < lock) { acc = 0; return; }
      acc += e.deltaX;
      if (Math.abs(acc) >= 60) { move(acc > 0 ? 1 : -1); acc = 0; lock = performance.now() + 220; }
    }, { passive: false });

    // autoplay – pauza při najetí, fokusu a skrytém panelu
    dock.addEventListener('mouseenter', () => paused = true);
    dock.addEventListener('mouseleave', () => paused = false);
    dock.addEventListener('focusin', () => paused = true);
    dock.addEventListener('focusout', () => paused = false);
    clearInterval(dockTimer);
    if (!reduced) dockTimer = setInterval(() => { if (!paused && !document.hidden && document.contains(dock)) move(1); }, 3500);
    dock._relayout = () => layout(false);
  }
  addEventListener('resize', () => $('#dock')?._relayout?.());

  // ---------- výsledky (List 226:1608 / mobil 227:3770) ----------
  const PAGE = 6;
  const shortRange = () => { const W = ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'], a = d(S.checkIn), b = d(S.checkOut); return `${W[a.getDay()]} ${a.getDate()}.${a.getMonth() === b.getMonth() ? '' : ' ' + (a.getMonth() + 1) + '.'}–${W[b.getDay()]} ${b.getDate()}. ${b.getMonth() + 1}.`; };
  const stayPrice = h => Math.round(fromStay(h) * (1 + FEE));  // vč. servisního poplatku
  const coverTag = price => price <= S.points ? '<span class="tag tag-success">Pokryjete body</span>' : `<span class="tag tag-warning">Doplatek ${kc(price - S.points)}</span>`;

  function viewSearch(params) {
    header('page');
    S.lastQ = /^https?:/.test(params.q || '') ? '' : (params.q || ''); save();
    const { H, T, I } = searchResults(params);
    if (I.nights && !params._n) { S.checkOut = addDays(S.checkIn, I.nights); S.datesTouched = true; save(); }
    if (I.hotelId) { toast('Našli jsme hotel podle odkazu.'); go('hotel', {}, I.hotelId); return; }
    const set = (k, v) => { const p = { ...params }; delete p._n; if (v == null || v === '' || p[k] === v) delete p[k]; else p[k] = v; return href('hledat', p); };
    const understood = [
      I.types.map(t => TYPE[t].label), I.domestic && 'Tuzemsko', I.abroad && 'Zahraničí',
      I.budget && `Rozpočet ${kc(I.budget)} (≈ bodů)`, I.nights && nightsTxt(I.nights), I.scope === 'trip' && 'Zájezdy s letem',
      I.text.length && `„${I.text.join(' ')}“`,
    ].flat().filter(Boolean);
    const ignored = I.unknown.length ? `<span> · bez výsledku: ${esc(I.unknown.join(', '))}</span>` : '';
    const q = params.q && !/^https?:/.test(params.q) ? params.q : '';
    const title = q ? q.charAt(0).toUpperCase() + q.slice(1) : params.mesto ? `Ubytování: ${params.mesto}` : params.typ ? TYPE[params.typ]?.label : params.druh === 'trip' ? 'Last minute zájezdy' : params.druh === 'hotel' ? 'Hotely' : 'Všechny nabídky';
    const items = [...H.map(h => ['h', h]), ...T.map(t => ['t', t])];
    const count = items.length, kind = !T.length ? plural(count, 'ubytování', 'ubytování', 'ubytování') : !H.length ? plural(count, 'zájezd', 'zájezdy', 'zájezdů') : plural(count, 'nabídka', 'nabídky', 'nabídek');
    const typLabel = params.typ ? TYPE[params.typ].label : params.druh === 'hotel' ? 'Jen ubytování' : params.druh === 'trip' ? 'Zájezdy s letem' : 'Typ pobytu';
    const sortSel = `<select class="chip" id="sort" aria-label="Řazení">${[['doporucene', 'Řadit: Doporučené'], ['cena', 'Řadit: Nejnižší cena'], ['hodnoceni', 'Řadit: Hodnocení']].map(([v, l]) => `<option value="${v}"${(params.razeni || 'doporucene') === v ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
    app.innerHTML = `
    <div class="page-search"><div class="in">
      <form class="sbar" id="sbar">${ic.search}<label style="flex:1;min-width:0"><input id="sq" value="${esc(q)}" placeholder="Kam pojedete? Popište pobyt nebo vložte URL" aria-label="Hledat"><span class="sub">${shortRange()} · ${guestsTxt()}</span></label>
        <button type="button" class="chip" id="fDates">${ic.cal}<span>${shortRange()}</span></button>
        <button type="button" class="chip" id="fGuests">${ic.guests}<span>${guestsTxt()}</span></button>
        <button class="btn btn-primary">Vyhledat</button></form>
    </div></div>
    <div class="list">
      <div>
        <div class="list-head"><h1>${esc(title)}</h1><p>${count} ${kind} · ${shortRange()} · ${guestsTxt()}</p>
          ${understood.length || ignored ? `<p class="understood">${understood.length ? 'Rozumíme: ' : ''}${understood.map(x => `<span class="tag tag-sea">${esc(x)}</span>`).join(' ')}${ignored}</p>` : ''}</div>
        <div class="list-filters">
          <a class="chip${params.snidane ? ' on' : ''}" href="${set('snidane', '1')}">${params.snidane ? ic.check : ''}Snídaně v ceně</a>
          <a class="chip${params.storno ? ' on' : ''}" href="${set('storno', '1')}">${params.storno ? ic.check : ''}Storno zdarma</a>
          <a class="chip hide-m${params.hodn ? ' on' : ''}" href="${set('hodn', '8')}">${params.hodn ? ic.check : ''}Hodnocení 8+</a>
          <button type="button" class="chip${params.typ || params.druh ? ' on' : ''}" id="fTyp">${esc(typLabel)} ${ic.down}</button>
          <a class="chip hide-m${params.razeni === 'cena' ? ' on' : ''}" href="${set('razeni', 'cena')}">Cena ${ic.down}</a>
          ${sortSel}
          ${Object.keys(params).filter(k => k !== '_n').length ? `<a class="btn btn-ghost btn-sm" href="${href('hledat', {})}">Zrušit filtry</a>` : ''}
        </div>
        <div class="mob-strip"><span><b>${kc(S.points)}</b> v benefitních bodech</span><button class="link" id="mPts">Upravit</button></div>
        ${count === 0 ? `<div class="empty"><h3>Nic jsme nenašli</h3><p>Zkuste jiné slovo nebo zrušte filtry. V prototypu je ${HOTELS.length} hotelů a ${TRIPS.length} zájezdů.</p><a class="btn btn-outline" href="${href('hledat', {})}">Zobrazit vše</a></div>` : ''}
        <div class="rlist" id="rlist"></div>
        <div class="more-row" id="more"></div>
      </div>
      <aside class="side">
        <div class="points-card"><div class="sm">Vaše benefitní body</div><div class="big" id="ptsBig">${kc(S.points)}</div>
          <p>Zůstatek z Edenred Benefits. U každého hotelu vidíte, jestli pobyt body pokryjí, nebo kolik doplatíte kartou.</p>
          <button class="btn btn-outline btn-sm" id="ptsEdit">Upravit zůstatek</button>
          <form class="edit" id="ptsForm" hidden><input class="inp" id="ptsVal" type="number" min="0" step="100" value="${S.points}" aria-label="Zůstatek bodů"><button class="btn btn-primary btn-sm">Uložit</button></form></div>
        <div class="map-card"><button class="btn btn-outline btn-sm" data-toast="Mapa není v offline prototypu dostupná.">${ic.pin}Zobrazit na mapě</button></div>
        <div class="info-card"><h4>Ceny jsou konečné</h4><p>Zahrnují servisní poplatek ${String(FEE * 100).replace('.', ',')} %. Městský poplatek se platí na místě.</p></div>
      </aside>
    </div>`;
    let shown = PAGE;
    const draw = () => {
      $('#rlist').innerHTML = items.slice(0, shown).map(([k, x]) => k === 'h' ? resultHotel(x) : resultTrip(x)).join('');
      const rest = count - shown;
      $('#more').innerHTML = rest > 0 ? `<button class="btn btn-outline" id="moreBtn">Načíst další (${rest})</button>` : '';
      $('#moreBtn') && ($('#moreBtn').onclick = () => { shown += PAGE; draw(); });
    };
    draw();
    $('#sbar').onsubmit = e => { e.preventDefault(); const p = { ...params, q: $('#sq').value }; delete p._n; if (!p.q) delete p.q; go('hledat', p); };
    $('#fDates').onclick = e => openPop(e.currentTarget, 'dates', () => viewSearch({ ...params, _n: 1 }));
    $('#fGuests').onclick = e => openPop(e.currentTarget, 'guests', () => viewSearch({ ...params, _n: 1 }));
    $('#sort').onchange = e => { location.hash = set('razeni', e.target.value === 'doporucene' ? null : e.target.value); };
    $('#fTyp').onclick = e => {
      e.stopPropagation(); closePop();
      const p = document.createElement('div'); p.className = 'pop'; p.id = 'pop';
      p.innerHTML = `<div class="opt-list"><h5>Typ pobytu</h5>${Object.entries(TYPE).map(([k, v]) => `<a href="${set('typ', k)}"${params.typ === k ? ' class="on"' : ''}>${v.label}</a>`).join('')}
        <h5>Nabídka</h5><a href="${set('druh', 'hotel')}"${params.druh === 'hotel' ? ' class="on"' : ''}>Jen ubytování</a><a href="${set('druh', 'trip')}"${params.druh === 'trip' ? ' class="on"' : ''}>Zájezdy s letem</a></div>`;
      document.body.appendChild(p);
      const r = e.currentTarget.getBoundingClientRect();
      p.style.top = (r.bottom + scrollY + 8) + 'px'; p.style.left = Math.max(8, Math.min(r.left + scrollX, innerWidth - p.offsetWidth - 8)) + 'px';
      p.addEventListener('click', () => closePop());
      setTimeout(() => document.addEventListener('click', outside), 0);
    };
    const editPts = () => {
      const v = prompt('Kolik máte benefitních bodů (1 bod = 1 Kč)?', S.points);
      if (v != null && !isNaN(+v)) { S.points = Math.max(0, Math.round(+v)); save(); viewSearch({ ...params, _n: 1 }); }
    };
    $('#ptsEdit').onclick = () => { $('#ptsForm').hidden = false; $('#ptsEdit').hidden = true; $('#ptsVal').focus(); };
    $('#ptsForm').onsubmit = e => { e.preventDefault(); S.points = Math.max(0, Math.round(+$('#ptsVal').value || 0)); save(); viewSearch({ ...params, _n: 1 }); };
    $('#mPts').onclick = editPts;
  }
  const RATING_LABEL = s => s >= 9.5 ? 'Naprosto výjimečné' : s >= 9 ? 'Fantastické' : s >= 8.5 ? 'Skvělé' : s >= 8 ? 'Velmi dobré' : 'Dobré';
  function cheapest(h) {
    const g = Math.max(1, guests()); let best = null;
    for (const r of h.rooms) for (const t of r.rates) { if (g >= 2 && t.base < 2) continue; const v = ratePN(t, Math.ceil(g / t.maxGuests), g); if (!best || v < best.v) best = { v, r, t }; }
    return best;
  }
  const resultHotel = h => {
    const price = stayPrice(h), c = cheapest(h), bf = h.rooms.some(r => r.rates.some(t => t.breakfast)), bfPaid = h.rooms.some(r => r.rates.some(t => t.breakfastPrice)), free = h.rooms.some(r => r.rates.some(t => t.refundable));
    const ticks = [h.amenities[0], bf ? 'Snídaně v ceně' : bfPaid ? 'Snídaně za příplatek' : null, free ? 'Zrušení zdarma' : null].filter(Boolean).slice(0, 3);
    return `<a class="ritem" href="${href('hotel', {}, h.id)}">
      <div class="rimg"><img src="${cover(h)}" alt="" loading="lazy">${h.featured ? '<span class="badge tag tag-sunset">Tip</span>' : ''}</div>
      <div class="rbody">
        <h3>${esc(h.name)}</h3>
        <div class="loc">${stars(h.stars)}<span style="display:inline-flex;gap:4px;align-items:center">${ic.pin}${esc(h.city)}, ${esc(h.country)}</span></div>
        <div class="rate-row"><span class="score">${score(h.rating.score)}</span><b>${esc(h.rating.label || RATING_LABEL(h.rating.score))}</b><span class="muted">${(h.rating.count || 0).toLocaleString('cs-CZ')} hodnocení</span></div>
        <div class="rroom">${esc(c ? c.r.name : '')}${h.type ? ` · ${esc(h.type)}` : ''}</div>
        <div class="ticks">${ticks.map(t => `<span>${ic.check}${esc(t)}</span>`).join('')}</div>
      </div>
      <div class="rprice">${coverTag(price)}<span class="when">${nightsTxt(nights())}, ${guestsTxt()}</span><b>${kc(price)}</b><span class="fee">vč. poplatku</span><span class="btn btn-primary">Vybrat pokoj</span></div>
    </a>`;
  };
  const resultTrip = t => {
    const price = t.price.pricePerPerson * Math.max(1, S.adults);
    return `<a class="ritem" href="${href('zajezd', {}, t.id)}">
      <div class="rimg"><img src="${cover(t)}" alt="" loading="lazy"><span class="badge tag tag-sunset">Last minute</span></div>
      <div class="rbody">
        <h3>${esc(t.name)}</h3>
        <div class="loc">${stars(t.stars)}<span style="display:inline-flex;gap:4px;align-items:center">${ic.pin}${esc(t.city)}, ${esc(t.country)}</span></div>
        <div class="rate-row"><span class="score">${score(t.rating5)}</span><b>z 5</b><span class="muted">${t.ratingCount.toLocaleString('cs-CZ')} hodnocení</span></div>
        <div class="rroom">${fmtRange(t.trip.checkIn, t.trip.checkOut)} · ${nightsTxt(t.trip.nights)} · let z Prahy</div>
        <div class="ticks"><span>${ic.check}Letenka v ceně</span><span>${ic.check}${esc(t.price.selectedMeal)}</span></div>
      </div>
      <div class="rprice">${coverTag(price)}<span class="when">let + hotel, ${Math.max(1, S.adults)} ${plural(Math.max(1, S.adults), 'osoba', 'osoby', 'osob')}</span><b>${kc(price)}</b><span class="fee">${kc(t.price.pricePerPerson)} / osobu</span><span class="btn btn-primary">Detail zájezdu</span></div>
    </a>`;
  };

  // ---------- detail hotelu ----------
  function gallery(x, mapImg) {
    const P = x.photos, more = Math.max(0, P.length - 5);
    return `<div class="gallery">
      <button class="g g-main" data-g="0"><img src="${P[0]}" alt="Hlavní fotka"></button>
      <button class="g" data-g="1"><img src="${P[1] || P[0]}" alt=""></button>
      <button class="g" data-g="2"><img src="${P[2] || P[0]}" alt=""></button>
      <div class="rev">${x.rating ? `<div class="score-row"><span class="score">${score(x.rating.score)}</span><div><b>${esc(x.rating.label)}</b><span class="xs muted" style="display:block">${(x.rating.count || 0).toLocaleString('cs-CZ')} recenzí</span></div></div>
        ${x.quotes?.[0] ? `<div class="quote">“${esc(x.quotes[0].text.slice(0, 90))}${x.quotes[0].text.length > 90 ? '…' : ''}<div class="who">${x.quotes[0].country === 'Česká republika' ? ic.flag : ''}${esc(x.quotes[0].author)}, ${esc(x.quotes[0].country)}</div></div>` : ''}`
        : `<div class="score-row"><span class="score">${score(x.rating5)}</span><div><b>z 5</b><span class="xs muted" style="display:block">${x.ratingCount.toLocaleString('cs-CZ')} hodnocení</span></div></div><div class="feat">${x.tags.map(t => `<span class="chip chip-sm">${esc(t)}</span>`).join('')}</div>`}</div>
      <button class="g" data-g="3"><img src="${P[3] || P[0]}" alt=""></button>
      <button class="g" data-g="4"><img src="${P[4] || P[0]}" alt="">${more ? `<span class="g-count">+ ${more} fotografií</span>` : ''}</button>
      <button class="g g-map${mapImg ? '' : ' fake'}" data-toast="Mapa není v offline prototypu dostupná.">${mapImg ? `<img src="${mapImg}" alt="Mapa">` : `<span class="mapfake">${ic.pin}<b>${esc(x.city)}</b><span class="btn btn-primary btn-sm">Zobrazit na mapě</span></span>`}</button>
    </div>`;
  }

  function viewHotel(id, params) {
    const h = byId(id);
    if (!h) return viewMissing();
    header('page');
    if (params.termin) { const [a, b] = params.termin.split('_'); S.checkIn = a; S.checkOut = b; S.datesTouched = true; history.replaceState(null, '', href('hotel', {}, id)); }
    if (S.selHotel !== h.id) { S.sel = {}; S.selHotel = h.id; }
    save();
    const realNote = h.realRates && (S.checkIn !== h.realStay.checkIn || S.checkOut !== h.realStay.checkOut);
    const allAmen = [...new Set([...h.amenities, ...h.highlights.flatMap(x => x.split(', ')).filter(x => x.length < 40 && !/^(Fantastická|Skvělá|Vynikající|Výborná|Velmi dobrá) /.test(x))])];
    app.innerHTML = `<div class="detail"><div class="top">
      ${stars(h.stars)}
      <h1 class="h-title">${esc(h.name)}</h1>
      <div class="addr">${ic.pin}${esc(h.address)}</div>
      ${gallery(h, h.featured ? 'assets/hotel/gal-mapa.jpg' : null)}
      </div>
      <div class="two-col">
        <section class="desc"><h2>Popis ubytování</h2>
          ${h.promo ? `<span class="tag tag-sunset" style="margin-top:14px">${esc(h.promo)}</span>` : ''}
          <div class="clip" id="clip">${h.description.map(p => `<p>${esc(p)}</p>`).join('')}</div>
          <div class="center"><button class="btn btn-ghost btn-sm" id="descMore">Zobrazit více ${ic.down}</button></div>
        </section>
        <aside><h2>Vybavení</h2>
          <div class="amen" id="amen">${allAmen.slice(0, 8).map(a => `<span class="chip">${esc(a)}</span>`).join('')}</div>
          ${allAmen.length > 8 ? `<button class="link" id="amenMore">${ic.info} Zobrazit všechno vybavení</button>` : ''}
        </aside>
      </div>

      <section class="sec-d" id="rezervace"><h2>Rezervace</h2>
        <div class="res-filters">
          <button class="chip" id="fDates">${ic.cal}<span>${fmtRange()} · ${nightsTxt(nights())}</span></button>
          <button class="chip" id="fGuests">${ic.guests}<span>${guestsTxt()}</span></button>
          <button class="chip${S.fBreak ? ' on' : ''}" id="fBreak">${ic.cup}${S.fBreak ? 'Snídaně v ceně' : 'Všechny stravování'}</button>
          <button class="chip${S.fFree ? ' on' : ''}" id="fFree">${S.fFree ? ic.check : ''}Zrušení rezervace zdarma</button>
        </div>
        ${realNote ? `<p class="note-box">${ic.info} Skutečné ceny z archivu platí pro ${fmtRange(h.realStay.checkIn, h.realStay.checkOut)}. Pro jiný termín je přepočítáváme podle ceny za noc. <button class="link" id="realStay">Vrátit termín</button></p>` : ''}
        <div class="res-grid">
          <div class="rooms" id="rooms"></div>
          <aside class="summary" id="sum"></aside>
        </div>
      </section>

      ${Object.keys(h.policies).length ? `<section class="sec-d"><h2>Podmínky ubytování</h2><dl class="policies">${Object.entries(h.policies).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>` : ''}
      ${Object.keys(h.nearby || {}).length ? `<section class="sec-d"><h2>Okolí</h2><div class="nearby">${Object.entries(h.nearby).filter(([, v]) => v.length).slice(0, 4).map(([k, v]) => `<div><h4>${esc(k)}</h4><ul>${v.slice(0, 5).map(x => `<li><span>${esc(x.name)}</span><span class="muted">${esc(x.distance)}</span></li>`).join('')}</ul></div>`).join('')}</div></section>` : ''}

      <section class="sec-d"><h2>Recenze</h2>
        <div class="reviews">
          <div class="top"><h3>Hodnocení hostů</h3>${h.quotes.length > 3 ? `<button class="link" id="allRev">Přečíst další hodnocení ${ic.right}</button>` : ''}</div>
          <div class="sum"><span class="score lg">${score(h.rating.score)}</span><div><div class="big">${esc(h.rating.label)}</div><div class="sm muted">${(h.rating.count || 0).toLocaleString('cs-CZ')} hodnocení</div></div>
            <div class="chips">${Object.entries(h.rating.subscores || {}).filter(([k]) => k !== 'WiFi zdarma').slice(0, 4).map(([k, v]) => `<span class="chip">${esc(k)}<b>${score(v)}</b></span>`).join('')}</div></div>
          <div class="qs" id="qs">${h.quotes.slice(0, 3).map(quote).join('')}</div>
        </div>
      </section>
    </div>`;

    drawRooms(h); drawSummary(h);
    $$('[data-g]').forEach(b => b.onclick = () => lightbox(h.photos, +b.dataset.g));
    $('#descMore').onclick = e => { const c = $('#clip'); c.classList.toggle('open'); e.currentTarget.innerHTML = (c.classList.contains('open') ? 'Zobrazit méně ' : 'Zobrazit více ') + ic.down; };
    $('#amenMore') && ($('#amenMore').onclick = e => { $('#amen').innerHTML = allAmen.map(a => `<span class="chip">${esc(a)}</span>`).join(''); e.currentTarget.remove(); });
    $('#allRev') && ($('#allRev').onclick = e => { $('#qs').innerHTML = h.quotes.map(quote).join(''); e.currentTarget.remove(); });
    const rerender = () => { const y = scrollY; viewHotel(id, {}); footer(); scrollTo(0, y); };
    $('#fDates').onclick = e => openPop(e.currentTarget, 'dates', rerender);
    $('#fGuests').onclick = e => openPop(e.currentTarget, 'guests', rerender);
    $('#fBreak').onclick = () => { S.fBreak = !S.fBreak; save(); drawRooms(h); drawSummary(h); $('#fBreak').classList.toggle('on', S.fBreak); $('#fBreak').innerHTML = ic.cup + (S.fBreak ? 'Snídaně v ceně' : 'Všechny stravování'); };
    $('#fFree').onclick = () => { S.fFree = !S.fFree; save(); drawRooms(h); drawSummary(h); $('#fFree').classList.toggle('on', S.fFree); $('#fFree').innerHTML = (S.fFree ? ic.check : '') + 'Zrušení rezervace zdarma'; };
    $('#realStay') && ($('#realStay').onclick = () => { S.checkIn = h.realStay.checkIn; S.checkOut = h.realStay.checkOut; save(); rerender(); });
  }
  const quote = q => `<div class="quote"><div class="txt">„${esc(q.text)}“</div><div class="who">${q.country === 'Česká republika' ? ic.flag : ''}${esc(q.author)}, ${esc(q.country)}</div></div>`;

  function drawRooms(h) {
    const n = nights();
    // výběr, který filtr skryl, zahodíme – jinak by v souhrnu visel neviditelný pokoj
    for (const key of Object.keys(S.sel)) {
      const [rid, tid] = key.split('|'); const room = h.rooms.find(r => r.id === rid);
      if (!room || !visibleRates(h, room).some(t => t.id === tid)) delete S.sel[key];
    }
    save();
    const rows = h.rooms.map((room, ri) => {
      const rates = visibleRates(h, room);
      if (!rates.length) return '';
      const thumbs = [1, 2, 3].map(k => h.photos[(ri + k) % h.photos.length]);
      return rates.map((t, i) => {
        const key = room.id + '|' + t.id, q = S.sel[key] || 0, until = cancelUntil(t);
        const g = Math.max(1, guests()), occ = Math.min(g, t.maxGuests), need = Math.ceil(g / t.maxGuests), f = occFactor(t, occ), roomMax = t.maxGuests;
        const roomCell = i === 0 ? `<td class="room" rowspan="${rates.length}">
            <h4>${esc(room.name)}</h4>
            ${room.left ? `<div class="left">Zbývají jen ${room.left} ${plural(room.left, 'pokoj', 'pokoje', 'pokojů')}</div>` : ''}
            <div class="thumbs">${thumbs.map((p, j) => `<img src="${p}" alt="" data-rlb="${ri}" data-i="${j}">`).join('')}<button data-rlb="${ri}" data-i="0" aria-label="Další fotky">+</button></div>
            <div class="sm" style="font-weight:600">${esc(room.beds)}${room.size ? ` · ${room.size} m²` : ''}</div>
            <div class="feat">${room.facilities.slice(0, 6).map(f => `<span class="chip chip-sm">${esc(f)}</span>`).join('')}</div>
            ${room.description || room.facilities.length > 6 ? `<div class="more" hidden>${room.description ? `<p class="sm">${esc(room.description)}</p>` : ''}<div class="feat">${room.facilities.slice(6).map(f => `<span class="chip chip-sm">${esc(f)}</span>`).join('')}</div></div><button class="link" data-more>Zobrazit více</button>` : ''}</td>` : '';
        return `<tr class="rate${i === 0 ? ' first' : ''}">${roomCell}
          <td class="persons" title="Cena pro ${occ} ${plural(occ, 'osobu', 'osoby', 'osob')} · max. ${roomMax}"><span class="figs">${ic.person.repeat(occ)}<span class="ghost">${ic.person.repeat(roomMax - occ)}</span></span>
            <span class="cap">${need > 1 ? `max. ${t.maxGuests} · pro ${g} os. ${need} ${plural(need, 'pokoj', 'pokoje', 'pokojů')}` : occ < roomMax ? `max. ${roomMax}` : ''}</span></td>
          <td class="price-cell">${t.origPerNight ? `<s class="muted xs">${kc(Math.round(t.origPerNight * f * n))}</s><br>` : ''}${kc(Math.round(occPN(t, occ) * n))}<span class="xs muted" style="display:block;font-weight:400">${nightsTxt(n)} · ${occ} ${plural(occ, 'osoba', 'osoby', 'osob')}</span></td>
          <td><div class="opts">
            <div class="opt${t.breakfast ? ' ok' : ''}">${ic.cup}<span>${t.breakfast ? 'Snídaně v ceně' : t.breakfastPrice ? `Snídaně ${t.breakfastPrice} Kč / os. / noc<span class="until">${kc(t.breakfastPrice * occ * n)} celkem, platí se zvlášť</span>` : 'Bez snídaně'}</span></div>
            ${t.refundable ? `<div class="opt ok">${ic.check}<span>Zrušení zdarma${until ? `<span class="until">do ${until}</span>` : ''}</span></div>` : `<div class="opt">${ic.x}<span>Nevratná rezervace</span></div>`}
          </div></td>
          <td><select class="qty" data-key="${key}" aria-label="Počet pokojů">${Array.from({ length: Math.min(room.left || 5, 5) + 1 }, (_, k) => `<option value="${k}"${k === q ? ' selected' : ''}>${k}${k ? ` (${kc(Math.round(ratePN(t, k, g) * n))})` : ''}</option>`).join('')}</select></td>
        </tr>`;
      }).join('');
    }).join('');
    $('#rooms').innerHTML = rows ? `<table><thead><tr><th>Typ pokoje</th><th>Počet osob</th><th>Cena za pobyt</th><th>Vaše možnosti</th><th>Vyberte si pokoj</th></tr></thead><tbody>${rows}</tbody></table>`
      : `<div class="empty"><h3>Žádná nabídka neodpovídá filtrům</h3><p>Zkuste zrušit filtr stravování nebo storna.</p></div>`;
    $$('#rooms .qty').forEach(s => s.onchange = () => { S.sel[s.dataset.key] = +s.value; save(); drawSummary(h); });
    $$('#rooms [data-more]').forEach(b => b.onclick = () => { const m = b.previousElementSibling; m.hidden = !m.hidden; b.textContent = m.hidden ? 'Zobrazit více' : 'Zobrazit méně'; });
    $$('#rooms [data-rlb]').forEach(b => b.onclick = () => { const ri = +b.dataset.rlb; lightbox([1, 2, 3].map(k => h.photos[(ri + k) % h.photos.length]), +b.dataset.i); });
  }

  function drawSummary(h) {
    const t = hotelTotals(h, S.sel, S.checkIn, S.checkOut, S.adults, guests()), g = guests(), el = $('#sum');
    const short = t.rooms && t.cap < g;
    el.innerHTML = `<h4>Vaše rezervace</h4>
      <div class="xs muted" style="margin-top:6px">${fmtRange()} · ${nightsTxt(t.n)} · ${guestsTxt()}</div>
      ${t.rooms ? `<div class="lines">${t.items.map(i => `<div><span>${i.q}× ${esc(i.room.name)} · ${i.occ.join(' + ')} os.${i.rate.breakfast ? ' · se snídaní' : ''}</span><span>${kc(i.price)}</span></div>`).join('')}</div>`
        : `<p class="sm" style="margin:16px 0">Prosím nejprve zvolte ubytování</p>`}
      ${short ? `<p class="warn">Vybrané pokoje pojmou ${t.cap} ${plural(t.cap, 'osobu', 'osoby', 'osob')} z ${g}. Přidejte pokoj.</p>` : ''}
      <div class="tot"><span>Celkem</span><b>${kc(t.acc)}</b></div>
      <button class="btn btn-primary" id="book"${t.rooms && !short ? '' : ' disabled'}>Rezervovat</button>
      ${t.rooms ? `<p class="cover-note">${t.now <= S.points ? `<span class="tag tag-success">Pokryjete body</span>` : `<span class="tag tag-warning">Doplatek ${kc(t.now - S.points)}</span>`}</p><p class="xs muted" style="margin:8px 0 0">Vč. servisního poplatku ${kc(t.fee)}. Zaplatíte benefitními body (${kc(S.points)}), případný rozdíl kartou.</p>` : ''}`;
    $('#book').onclick = () => {
      S.cart = { kind: 'hotel', id: h.id, checkIn: S.checkIn, checkOut: S.checkOut, adults: S.adults, kids: S.kids, sel: { ...S.sel } };
      S.voucher = ''; S.split = false; S.pointsAmount = null; save(); go('rezervace');
    };
  }

  // ---------- detail zájezdu ----------
  function viewTrip(id) {
    const t = tripById(id);
    if (!t) return viewMissing();
    header('page');
    if (S.tripSel?.id !== t.id) S.tripSel = { id: t.id, room: Math.max(0, t.rooms.findIndex(r => r.name === t.price.selectedRoom)), meal: t.price.selectedMeal, people: t.trip.travellers };
    save();
    const fl = t.trip.flights;
    app.innerHTML = `<div class="detail"><div class="top">
      ${stars(t.stars)}
      <h1 class="h-title">${esc(t.name)}</h1>
      <div class="addr">${ic.pin}${esc([t.address, t.city, t.country].filter(Boolean).join(', '))}</div>
      ${gallery(t, null)}
      </div>
      <div class="res-grid" style="margin-top:40px">
        <div>
          <h2>Let a termín</h2>
          ${t.flashSale ? `<p class="note-box">${ic.clock} Flash sale: cestujte ${esc(t.flashSale.travelFrom)} – ${esc(t.flashSale.travelTo)}, rezervujte do ${esc(t.flashSale.bookBy)}.</p>` : ''}
          <div class="flights">${fl.map((f, i) => `<div class="flight"><span class="muted xs">${i ? 'Zpáteční let' : 'Odlet'} · ${f.weekday} ${f.day}. ${f.month}.</span><div><b>${f.depart}</b> ${esc(f.from)} ${ic.plane} <b>${f.arrive}</b> ${esc(f.to)}</div></div>`).join('')}
            <div class="flight"><span class="muted xs">V ceně</span><div>${t.trip.smallBagsIncluded ? `${t.trip.smallBagsIncluded}× příruční zavazadlo` : 'Příruční zavazadlo'} · ubytování ${nightsTxt(t.trip.nights)}</div></div></div>
          <h2 style="margin-top:32px">Strava</h2>
          <div class="meals">${MEAL_ORDER.map(m => { const x = t.meals.find(y => y.meal === m); const ok = x && x.pricePerPerson != null; return `<button class="pm${S.tripSel.meal === m ? ' on' : ''}" data-meal="${m}"${ok ? '' : ' disabled'}><span class="rd"></span><span><b>${m}</b><span class="s">${ok ? 'od ' + kc(x.pricePerPerson) + ' / os.' : 'Nedostupné'}</span></span></button>`; }).join('')}</div>
          <h2 style="margin-top:32px">Pokoj</h2>
          <div class="trooms" id="trooms"></div>
        </div>
        <aside class="summary" id="tsum"></aside>
      </div>
    </div>`;
    const draw = () => {
      const sel = S.tripSel;
      $('#trooms').innerHTML = t.rooms.map((r, i) => {
        const pp = tripPP(t, r, sel.meal);
        return `<label class="troom${sel.room === i ? ' on' : ''}"><input type="radio" name="troom" value="${i}"${sel.room === i ? ' checked' : ''}${pp == null ? ' disabled' : ''}>
          <div><b>${esc(r.name)}</b>${r.roomsLeft ? ` <span class="left">Zbývají ${r.roomsLeft}</span>` : ''}<div class="feat">${r.features.map(f => `<span class="chip chip-sm">${esc(FEAT_CS[f] || f)}</span>`).join('')}</div>
          <div class="opts">${r.refundable ? `<div class="opt ok">${ic.check}<span>Zrušení zdarma${r.freeCancellationUntil ? `<span class="until">do ${fmtD(r.freeCancellationUntil)}</span>` : ''}</span></div>` : `<div class="opt">${ic.x}<span>Nevratná rezervace</span></div>`}</div></div>
          <div class="price-cell">${pp == null ? '<span class="muted sm">nedostupné</span>' : `${kc(pp)}<span class="xs muted" style="display:block;font-weight:400">za osobu</span>`}</div></label>`;
      }).join('');
      $$('#trooms input').forEach(i => i.onchange = () => { sel.room = +i.value; save(); draw(); });
      const room = t.rooms[sel.room], pp = tripPP(t, room, sel.meal) ?? room.pricePerPerson;
      $('#tsum').innerHTML = `<h4>Váš zájezd</h4>
        <div class="xs muted" style="margin-top:6px">${fmtRange(t.trip.checkIn, t.trip.checkOut)} · ${nightsTxt(t.trip.nights)} · odlet z Prahy</div>
        <div class="row2" style="margin:14px 0"><span class="sm">Cestující</span><span class="stp"><button type="button" data-p="-1" aria-label="Ubrat">−</button><b>${sel.people}</b><button type="button" data-p="1" aria-label="Přidat">+</button></span></div>
        <div class="lines"><div><span>${esc(room.name)}</span></div><div><span>${esc(sel.meal)}</span><span>${kc(pp)} / os.</span></div></div>
        <div class="tot"><span>Celkem</span><b>${kc(pp * sel.people)}</b></div>
        <button class="btn btn-primary" id="tbook">Rezervovat</button>
        <p class="cover-note">${pp * sel.people <= S.points ? `<span class="tag tag-success">Pokryjete body</span>` : `<span class="tag tag-warning">Doplatek ${kc(pp * sel.people - S.points)}</span>`}</p>
        <p class="xs muted" style="margin:10px 0 0">Cena zahrnuje let a ubytování. ${t.price.taxesPayableLater ? `Místní poplatky ${kc(t.price.taxesPayableLater)} se platí na místě.` : ''}</p>`;
      $$('#tsum [data-p]').forEach(b => b.onclick = () => { sel.people = Math.min(4, Math.max(1, sel.people + +b.dataset.p)); save(); draw(); });
      $('#tbook').onclick = () => { S.cart = { kind: 'trip', id: t.id, room: sel.room, meal: sel.meal, people: sel.people }; S.voucher = ''; S.split = false; S.pointsAmount = null; save(); go('rezervace'); };
    };
    draw();
    $$('[data-meal]').forEach(b => b.onclick = () => {
      S.tripSel.meal = b.dataset.meal;
      if (tripPP(t, t.rooms[S.tripSel.room], S.tripSel.meal) == null) S.tripSel.room = Math.max(0, t.rooms.findIndex(r => tripPP(t, r, S.tripSel.meal) != null));
      save(); $$('[data-meal]').forEach(x => x.classList.toggle('on', x === b)); draw();
    });
    $$('[data-g]').forEach(b => b.onclick = () => lightbox(t.photos, +b.dataset.g));
  }

  // ---------- košík → rezervace ----------
  function cartInfo() {
    const c = S.cart; if (!c) return null;
    if (c.kind === 'hotel') {
      const h = byId(c.id); if (!h) return null;
      const t = hotelTotals(h, c.sel, c.checkIn, c.checkOut, c.adults, c.adults + (c.kids || 0));
      if (!t.rooms) return null;
      const refundable = t.items.every(i => i.rate.refundable);
      return {
        x: h, photo: cover(h), name: h.name, stars: h.stars, address: h.address, promo: h.promo,
        rows: [['Příjezd', fmtD(c.checkIn)], ['Odjezd', fmtD(c.checkOut)], ['Délka pobytu', nightsTxt(t.n)], ['Počet osob', guestsTxt(c.adults, c.kids)]],
        lines: t.items.map(i => [`${i.q}× ${i.room.name} (${i.occ.join(' + ')} os.)${i.rate.breakfast ? ', snídaně' : ''}`, kc(i.price)]),
        acc: t.acc, fee: t.fee, now: t.now, atPlace: t.cityTax, atPlaceLabel: 'Městský poplatek', back: href('hotel', {}, h.id),
        cancel: refundable ? `Zrušení zdarma do ${cancelUntil(t.items[0].rate, c.checkIn)}` : 'Nevratná rezervace', refundable,
        summary: t.items.map(i => `${i.q}× ${i.room.name}`).join(', '), dates: fmtRange(c.checkIn, c.checkOut), guests: guestsTxt(c.adults, c.kids),
      };
    }
    const t = tripById(c.id); if (!t) return null;
    const room = t.rooms[c.room], pp = tripPP(t, room, c.meal) ?? room.pricePerPerson, acc = pp * c.people;
    return {
      x: t, photo: cover(t), name: t.name, stars: t.stars, address: `${t.city}, ${t.country}`, promo: 'Let z Prahy v ceně',
      rows: [['Odlet', `${fmtD(t.trip.checkIn)} ${t.trip.flights[0].depart}`], ['Návrat', `${fmtD(t.trip.checkOut)} ${t.trip.flights[1]?.depart || ''}`], ['Délka pobytu', nightsTxt(t.trip.nights)], ['Cestující', `${c.people} ${plural(c.people, 'osoba', 'osoby', 'osob')}`]],
      lines: [[`${room.name}, ${c.meal}`, kc(acc)]], acc, fee: 0, now: acc, atPlace: t.price.taxesPayableLater || 0, atPlaceLabel: 'Místní poplatky',
      back: href('zajezd', {}, t.id), cancel: room.refundable ? `Zrušení zdarma do ${fmtD(room.freeCancellationUntil)}` : 'Nevratná rezervace', refundable: room.refundable,
      summary: `${room.name}, ${c.meal}`, dates: fmtRange(t.trip.checkIn, t.trip.checkOut), guests: `${c.people} ${plural(c.people, 'osoba', 'osoby', 'osob')}`,
    };
  }

  const stepper = (n, back) => `<div class="stepper">${['Výběr ubytování', 'Údaje a platba', 'Potvrzení'].map((l, i) => {
    const cls = i + 1 < n ? 'done' : i + 1 === n ? 'cur' : '';
    const inner = `<span class="dot">${i + 1 < n ? ic.check : i + 1}</span>${l}`;
    return (i ? `<span class="bar${i < n ? ' done' : ''}"></span>` : '') + (i === 0 && back && n < 3 ? `<a class="s ${cls}" href="${back}">${inner}</a>` : `<span class="s ${cls}">${inner}</span>`);
  }).join('')}</div>`;

  // Checkout (Rezervace – DS v2, 227:1322 desktop / 227:1828 mobil)
  function viewCheckout() {
    const C = cartInfo();
    if (!C) { toast('Nejprve vyberte pokoj.'); go(''); return; }
    header('checkout');
    const F = S.form;
    const field = (k, label, attrs = '') => `<div class="f"><label for="f-${k}">${label}<span class="req">*</span></label><input class="inp" id="f-${k}" data-f="${k}" value="${esc(F[k])}" ${attrs}><div class="msg" hidden></div></div>`;
    app.innerHTML = `<div class="co-wrap">
      <a class="m-recap" href="${C.back}"><img src="${C.photo}" alt=""><div><b>Rekapitulace</b><div class="n">${esc(C.name)}</div></div><b id="mTotal"></b>${ic.down}</a>
      ${stepper(2, C.back)}
      <div class="mstep"><div class="t"><b>Údaje a platba</b><span>Krok 2 z 3</span></div><div class="pb"><i></i></div></div>
      <div class="co-grid">
        <form class="co" id="co" novalidate>
          <h1>Informace o vás</h1>
          <p class="intro">Uveďte informace o objednávajícím.</p>
          <p class="xs muted" style="margin:0">Pole označená <span class="req">*</span> jsou povinná</p>
          <div class="form">
            ${field('first', 'Jméno', 'autocomplete="given-name"')}
            ${field('last', 'Příjmení', 'autocomplete="family-name"')}
            ${field('email', 'Emailová adresa', 'type="email" autocomplete="email"')}
            <div class="f"><label for="f-phone">Telefonní číslo<span class="req">*</span></label>
              <div class="phone"><select class="inp" data-f="cc" aria-label="Předvolba">${['+420', '+421', '+48', '+49', '+43'].map(c => `<option${c === F.cc ? ' selected' : ''}>${c}</option>`).join('')}</select>
              <input class="inp" id="f-phone" data-f="phone" type="tel" placeholder="123 456 789" value="${esc(F.phone)}" autocomplete="tel-national"></div><div class="msg" hidden></div></div>
            <div class="f"><label for="f-country">Země<span class="req">*</span></label><select class="inp" id="f-country" data-f="country">${['Česko', 'Slovensko', 'Polsko', 'Německo', 'Rakousko'].map(c => `<option${c === F.country ? ' selected' : ''}>${c}</option>`).join('')}</select></div>
          </div>
          <hr class="hr">
          <div class="f"><label for="f-note">Poznámka pro ubytování</label><textarea class="inp" id="f-note" data-f="note" placeholder="Vaše poznámka pro ubytování">${esc(F.note)}</textarea></div>
          <p class="note">Splnění zvláštních požadavků není možné zaručit, ale ubytování udělá vše pro to, aby bylo vašim potřebám vyhověno. Speciální požadavek můžete také odeslat kdykoliv po potvrzení Vaší rezervace.</p>

          <h2>Způsob platby</h2>
          <div class="pay" id="pay" role="radiogroup" aria-label="Způsob platby"></div>
          <div id="splitBox"></div>
          <div class="actions">
            <button type="button" class="link" id="addPay">${ic.plus} ${S.split ? 'Odebrat další platbu' : 'Přidat další platbu'}</button>
            <button type="button" class="link" id="vBtn">${ic.ticket} Vložit slevový/ dárkový poukaz</button>
            <div class="voucher" id="vBox"><input class="inp" id="vCode" placeholder="Kód poukazu" aria-label="Kód poukazu"><button type="button" class="btn btn-outline btn-sm" id="vApply">Uplatnit</button></div>
          </div>
          <label class="chk"><input type="checkbox" id="c1"> <span>Souhlasím se <a href="#/rezervace" data-toast="${esc(C.cancel)}.">storno podmínkami</a> <span class="req">*</span></span></label>
          <label class="chk"><input type="checkbox" id="c2"> <span>Souhlasím se <a href="#/rezervace" data-toast="Obchodní podmínky nejsou součástí prototypu.">obchodními podmínkami</a> <span class="req">*</span></span></label>
          <label class="chk light"><input type="checkbox" id="c3"> <span>Souhlasím se zpracováním <a href="#/rezervace" data-toast="Zásady nejsou součástí prototypu.">osobních údajů</a> pro marketingové účely</span></label>
          <button class="btn btn-primary submit" type="submit">Rezervovat a zaplatit</button>
          <div class="trust"><span>${ic.lock}Zabezpečená platba</span><span>${ic.mail}Potvrzení rezervace e-mailem</span><span>${ic.clock}Podpora po–pá 9:00–16:00</span></div>
          <div class="sticky-cta"><div class="a">Zaplatíte teď<b id="ctaNow"></b></div><button class="btn btn-primary" type="submit">Rezervovat a zaplatit</button></div>
        </form>

        <aside>
          <div class="recap">
            <img src="${C.photo}" alt="">
            <div class="in">
              <h3>Rekapitulace</h3>
              <div style="margin-top:12px">${stars(C.stars)}</div>
              <div class="hn">${esc(C.name)}</div>
              <div class="ad">${esc(C.address)}</div>
              ${C.promo ? `<span class="tag tag-sunset">${esc(C.promo)}</span>` : ''}
              <div class="div"></div>
              <dl>${C.rows.map(([k, v]) => `<div><dt>${k}:</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
              <div class="div"></div>
              <dl class="items">${C.lines.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}${C.fee ? `<div><dt>Servisní poplatek</dt><dd>${kc(C.fee)}</dd></div>` : ''}<div id="vLine" hidden><dt>Poukaz</dt><dd></dd></div></dl>
              <p class="xs" style="margin:12px 0 0;color:${C.refundable ? 'var(--text-success)' : 'var(--text-secondary)'}">${esc(C.cancel)}</p>
              <a class="link sm" href="${C.back}" style="margin-top:8px">${ic.left} Změnit výběr</a>
            </div>
            <div class="pay-box" id="payBox"></div>
          </div>
          <div class="help"><h3>Problémy s rezervací?</h3>
            <div class="c">${ic.mail}<span>info@dovolena-za-benefity.cz</span></div>
            <div class="c">${ic.phone}<span>+420 725 538 448<small>9:00 - 16:00 (pondělí - pátek)</small></span></div>
          </div>
          <div class="faq">Možná jsme to už vysvětlili.<br>Mrkněte na často kladené dotazy.<br><button class="btn btn-outline btn-sm" data-toast="FAQ není součástí prototypu.">Časté dotazy</button></div>
        </aside>
      </div></div>`;

    drawPay();
    $$('[data-f]').forEach(i => i.oninput = i.onchange = () => { S.form[i.dataset.f] = i.value; save(); clearErr(i); });
    $('#addPay').onclick = () => { S.split = !S.split; save(); viewCheckout(); footer(); };
    $('#vBtn').onclick = () => $('#vBox').classList.toggle('on');
    $('#vApply').onclick = () => {
      const c = $('#vCode').value.trim().toUpperCase();
      if (c === 'DEMO500') { S.voucher = c; save(); drawPay(); toast('Poukaz uplatněn: −500 Kč'); }
      else toast('Neplatný kód (pro demo zkuste DEMO500).');
    };
    $$('.chk input').forEach(c => c.onchange = () => c.closest('.chk').classList.remove('err'));
    $('#co').onsubmit = e => { e.preventDefault(); submit(); };
  }

  function amounts() {
    const C = cartInfo(), voucher = S.voucher ? 500 : 0;
    const now = Math.max(0, C.now - voucher);
    const m = window.PAYMENTS.find(p => p.id === S.pay) || window.PAYMENTS[1];
    let points = m.points ? now : 0, card = m.points ? 0 : now;
    if (m.points && (S.split || now > S.points)) {
      // body pokryjí max. zůstatek; zbytek kartou
      const want = S.split && S.pointsAmount != null ? S.pointsAmount : Math.min(now, S.points);
      points = Math.min(now, S.points, Math.max(0, want));
      card = now - points;
    }
    return { C, voucher, now, points, card, total: now + C.atPlace, method: m };
  }

  function drawPay() {
    const a = amounts();
    $('#pay').innerHTML = window.PAYMENTS.map(p => `<button type="button" role="radio" aria-checked="${p.id === S.pay}" class="pm-logo${p.id === S.pay ? ' on' : ''}" data-pm="${p.id}"><span class="box"><span class="rd"></span>${p.logo ? `<img src="${p.logo}" alt="">` : ic.card}</span>${esc(p.name)}</button>`).join('');
    $$('[data-pm]').forEach(b => b.onclick = () => { S.pay = b.dataset.pm; S.pointsAmount = null; save(); drawPay(); });
    $('#splitBox').innerHTML = a.method.points
      ? (S.split ? `<div class="split-box"><div class="f"><label for="pts">Kolik zaplatit body (${esc(a.method.name)}, zůstatek ${kc(S.points)})</label>
          <input class="inp" id="pts" type="number" min="0" max="${Math.min(a.now, S.points)}" step="100" value="${a.points}" style="max-width:220px"></div>
          <p>Zbývajících <b>${kc(a.card)}</b> doplatíte platební kartou.</p></div>`
        : a.card ? `<div class="split-box"><p style="margin:0">Body (${kc(S.points)}) pokryjí část ceny. Zbývajících <b>${kc(a.card)}</b> doplatíte platební kartou.</p></div>` : '')
      : (S.split ? `<p class="note">Rozdělená platba: nejprve zvolte benefitní platformu, zbytek doplatíte kartou.</p>` : '');
    const pts = $('#pts');
    if (pts) pts.onchange = () => { S.pointsAmount = +pts.value || 0; save(); drawPay(); };
    const vl = $('#vLine'); vl.hidden = !a.voucher; if (a.voucher) vl.lastElementChild.textContent = '−' + kc(a.voucher);
    $('#payBox').innerHTML = `<div class="now"><span>Cena nyní</span><span>${kc(a.now)}</span></div>
      <dl>${a.points && a.card ? `<div><dt>Body (${esc(a.method.name)})</dt><dd>${kc(a.points)}</dd></div><div><dt>Kartou</dt><dd>${kc(a.card)}</dd></div>` : ''}
      <div><dt style="display:flex;gap:6px;align-items:center" title="${esc(a.C.atPlaceLabel)} – platí se na místě">Zaplatíte v ubytování ${ic.info}</dt><dd>${kc(a.C.atPlace)}</dd></div>
      <div><dt>Cena celkem</dt><dd>${kc(a.total)}</dd></div></dl>
      <div class="xs">${ic.info} Cenu může ovlivnit způsob platby</div>`;
    $('#ctaNow').textContent = kc(a.now);
    $('#mTotal').textContent = kc(a.total);
  }

  function setErr(el, msg) { el.classList.add('err'); const m = el.closest('.f').querySelector('.msg'); if (m) { m.textContent = msg; m.hidden = false; } }
  function clearErr(el) { el.classList.remove('err'); const m = el.closest('.f')?.querySelector('.msg'); if (m) m.hidden = true; }

  function submit() {
    const F = S.form; let bad = null;
    const need = (k, ok, msg) => { const el = $(`[data-f="${k}"]`); if (!ok) { setErr(el, msg); bad = bad || el; } };
    need('first', F.first.trim(), 'Vyplňte jméno.');
    need('last', F.last.trim(), 'Vyplňte příjmení.');
    need('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(F.email), 'Zadejte platný e-mail.');
    need('phone', F.phone.replace(/\D/g, '').length >= 9, 'Zadejte telefon (9 číslic).');
    ['c1', 'c2'].forEach(id => { const c = $('#' + id); if (!c.checked) { c.closest('.chk').classList.add('err'); bad = bad || c; } });
    if (bad) { bad.focus(); bad.scrollIntoView({ block: 'center', behavior: 'smooth' }); toast('Doplňte prosím povinné údaje.'); return; }
    const a = amounts();
    S.booking = { no: 'DZB-' + Math.floor(100000 + Math.random() * 900000), email: F.email, method: a.method.name, points: a.points, card: a.card, atPlace: a.C.atPlace,
      name: a.C.name, stars: a.C.stars, dates: a.C.dates, summary: a.C.summary, guests: a.C.guests, cancel: a.C.cancel, photo: a.C.photo, back: a.C.back };
    S.cart = null; S.sel = {}; save(); go('potvrzeni');
  }

  // ---------- potvrzení ----------
  function viewDone() {
    const B = S.booking;
    if (!B) { go(''); return; }
    header('checkout');
    app.innerHTML = `<div class="co-wrap">${stepper(4)}
      <div class="done-box">
        <div class="ok">${ic.check}</div>
        <h1>Hotovo, rezervace je potvrzená</h1>
        <p>Potvrzení jsme poslali na <b>${esc(B.email)}</b>. Číslo rezervace <b>${B.no}</b>.</p>
        <div class="card-c">
          <img src="${B.photo}" alt="">
          <div><b>${esc(B.name)}</b><span>${stars(B.stars)}</span></div>
          <div><span class="muted">Termín</span><span>${esc(B.dates)}</span></div>
          <div><span class="muted">Výběr</span><span>${esc(B.summary)}</span></div>
          <div><span class="muted">Hosté</span><span>${esc(B.guests)}</span></div>
          <div><span class="muted">Storno</span><span>${esc(B.cancel)}</span></div>
          <hr class="hr" style="margin:8px 0">
          ${B.points ? `<div><span class="muted">Zaplaceno body (${esc(B.method)})</span><b>${kc(B.points)}</b></div>` : ''}
          ${B.card ? `<div><span class="muted">Zaplaceno kartou</span><b>${kc(B.card)}</b></div>` : ''}
          <div><span class="muted">Zaplatíte na místě</span><span>${kc(B.atPlace)}</span></div>
        </div>
        <p class="xs muted">Prototyp: žádná rezervace ani platba se ve skutečnosti neodeslala.</p>
        <a class="btn btn-primary" href="#/">Zpět na hlavní stránku</a>
      </div></div>`;
  }

  function viewMissing() {
    header('page');
    app.innerHTML = `<div class="wrap"><div class="empty" style="margin-top:40px"><h3>Nabídka nenalezena</h3><p>Odkaz je neplatný nebo nabídka už není v prototypu.</p><a class="btn btn-primary" href="#/">Na hlavní stránku</a></div></div>`;
  }

  // ---------- router ----------
  function route() {
    closePop();
    clearInterval(dockTimer);
    $('.lb')?.remove();
    if (location.hash === '#/#jak') { viewHome(); footer(); $('#jak')?.scrollIntoView(); return; }
    const r = parseHash();
    const views = { hledat: () => viewSearch(r.q), hotel: () => viewHotel(r.id, r.q), zajezd: () => viewTrip(r.id), rezervace: viewCheckout, potvrzeni: viewDone };
    (views[r.name] || viewHome)();
    footer();
    scrollTo(0, 0);
  }
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-toast]');
    if (t) { e.preventDefault(); toast(t.dataset.toast); }
  });
  addEventListener('hashchange', route);
  route();
})();
