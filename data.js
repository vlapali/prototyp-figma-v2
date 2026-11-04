// Obsah převzatý z Figmy (Dovolená za benefity, uzly 163:4710, 164:1753, 166:2827).
// Jen statické podklady z Figmy (loga, typy výletů, kroky). Hotely a zájezdy jsou v data-archiv.js.
const H = 'assets/home/';

window.HOME = {
  partners: [
    { name: 'Booking.com', img: H + 'imgImage13.png', h: 34 },
    { name: 'Rentalcars.com', img: H + 'imgImage4.png', h: 82 },
    { name: 'lastminute.com', img: H + 'imgImage36.png', h: 104 },
  ],
  platforms: [
    { name: 'Edenred', img: H + 'imgImage5.png', h: 58 },
    { name: 'Benefit Plus', img: H + 'imgImage3.png', h: 56 },
    { name: 'Pluxee', img: H + 'imgImage6.png', h: 32 },
    { name: 'Up Benefity', img: H + 'imgUpBenefitsLogo1.svg', h: 30 },
    { name: 'Benefit Systems', img: H + 'imgImage18.png', h: 44 },
    { name: 'Fpoho', img: H + 'imgImage17.png', h: 44 },
  ],
  steps: [
    ['Popište, co hledáte', 'Vyhledávání rozumí běžné větě i tomu, kolik bodů máte. Můžete také vložit URL hotelu na Booking.com.'],
    ['Vyberte si pobyt', 'Ukážeme pobyty od našich partnerů a cenu přepočtenou na body, takže hned víte, jestli vám stačí.'],
    ['Zaplaťte benefit body', 'Přihlaste se u své benefitní platformy a rezervaci potvrďte. Případný rozdíl doplatíte kartou.'],
  ],
  cars: [
    { name: 'Rent plus', img: H + 'imgImage37.png' },
    { name: 'Avis', img: H + 'imgImage38.png' },
    { name: 'Alamo', img: H + 'imgImage39.png' },
    { name: 'Sixt', img: H + 'imgImage40.png' },
    { name: 'Enterprise', img: H + 'imgImage41.png' },
    { name: 'Carwiz', img: H + 'imgImage42.png' },
    { name: 'Europcar', img: H + 'imgImage43.png' },
  ],
  tripTypes: [
    { name: 'Wellness a spa', img: H + 'imgImage26.jpg' },
    { name: 'Moře', img: H + 'imgImage31.jpg' },
    { name: 'Města', img: H + 'imgImage27.jpg' },
    { name: 'Hory', img: H + 'imgImage28.jpg' },
    { name: 'S dětmi', img: H + 'imgImage29.jpg' },
    { name: 'Romantika', img: H + 'imgImage30.jpg' },
  ],
};

// Způsob platby (Checkout DS v2 227:1322) – loga z Figmy
window.PAYMENTS = [
  { id: 'card', name: 'Platební karta', logo: null, points: false },
  { id: 'edenred', name: 'Edenred', logo: H + 'imgImage5.png', points: true },
  { id: 'pluxee', name: 'pluxee (Sodexo)', logo: H + 'imgImage6.png', points: true },
  { id: 'up', name: 'Up Benefity', logo: H + 'imgUpBenefitsLogo1.svg', points: true },
  { id: 'benefitplus', name: 'Benefit Plus', logo: H + 'imgImage3.png', points: true },
  { id: 'benefitsystems', name: 'Benefit Systems', logo: H + 'imgImage18.png', points: true },
  { id: 'vpoho', name: 'vpoho', logo: H + 'imgImage17.png', points: true },
];
