# Prototyp – Dovolená za benefity (Design systém v2)

Klikací prototyp podle v2 obrazovek ve Figmě (xiVpZlRPZaHyJJ4DedCxdn): Landing (DS v2) 225:202, Výsledky – Hotely desktop 226:1608 / mobil 227:3770, Detail (DS v2) 223:721, Rezervace – DS v2 kit desktop 227:1322 / mobil 227:1828, Navbar 201:507, tokeny a styly z page Design systém v2.
Logika a data jsou převzaté z `prototyp-figma` (v1 vzhled), ta složka zůstala beze změny.

## Spuštění
- Vývoj: `python3 -m http.server 5182 --directory prototyp-figma-v2` → http://localhost:5182
- Klient: `dist/Dovolena-za-benefity-prototyp-v2.zip` → rozbalit → dvojklik na `index.html` (offline, bez serveru).
- Zip: `sh prototyp-figma-v2/_build/package.sh` (z kořene projektu). Data se generují stejně jako ve v1 (`_build/build_data.py`).

## Co se proti v1 změnilo
- Vzhled: tokeny v2 (ink / sunset / sand / sea), fonty Figtree + Bricolage Grotesque (lokálně v assets/fonts), pill tlačítka, radius 20, stíny v2.
- Navbar v2: odkazy Hotely / Zájezdy / Pronájem aut / Jak to funguje, Přihlásit se, menu (Můj účet, Moje rezervace, Benefitní body, jazyk, nápověda). Na landingu tmavá varianta, na mobilu odkazy v menu.
- Landing: taby vyhledávání (Cestovní pomocník, Hotely, Pronájem vozu, Zájezdy), duhové pill pole, nekonečný carousel s dock efektem (prostřední karta největší, sousedi se zmenšují), pořadí sekcí podle Figmy.
- Výsledky (nově podle page List): vyhledávací lišta pod navbarem, filtry jako chipy, karta s cenou vč. servisního poplatku a štítkem „Pokryjete body“ / „Doplatek X Kč“, postranní panel se zůstatkem bodů (upravitelný), mapou a „Ceny jsou konečné“, „Načíst další“. Mobil: proužek se zůstatkem.
- Detail: bez drobečkové navigace (podle Figmy), souhrn ukazuje krytí body.
- Checkout: platební metody jako dlaždice s logy (Platební karta, Edenred, pluxee, Up, Benefit Plus, Benefit Systems, vpoho), navy box „Cena nyní“. Když body nestačí, zbytek se automaticky dopočítá na kartu. Mobil: sbalená rekapitulace, progress „Krok 2 z 3“, sticky tlačítko se částkou.

## Demo poznámky
- Výchozí zůstatek 8 000 bodů (1 bod = 1 Kč), mění se ve výsledcích hledání.
- Vyprodaný termín („Tento víkend vyprodáno“) z Figmy není zapojený, v datech chybí dostupnost.
- Destinace na landingu jsou podle dat (Pec pod Sněžkou, Praha, Budapešť, Florencie), ne Vídeň / Vratislav / Řím z Figmy – ty v datech nejsou.
- Fotky jsou z CDN Bookingu/Lastminute – jen interní demo, nezveřejňovat.
