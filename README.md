# Ordinacija Aleksić - landing page

Statički sajt (HTML, CSS, JavaScript) za ordinaciju fizikalne medicine i rehabilitacije Aleksić, Čačak.
Nema build koraka ni zavisnosti - fajlovi se hostuju takvi kakvi jesu.

## Struktura

```
index.html      stranica
styles.css      stilovi
script.js       ponašanje (tabovi usluga, FAQ, aktivni link u navigaciji, status „otvoreno“)
404.html        stranica za nepostojeće adrese
assets/         logo i fotografije (.webp)
_arhiva/        sačuvane alternative (hero varijanta B, originalni logo sa Instagrama) - ne koriste se na sajtu
.nojekyll       kaže GitHub Pages-u da ne obrađuje sajt Jekyll-om
```

## Objavljivanje na GitHub Pages

1. Na GitHubu napravite novi repozitorijum (npr. `ordinacija-aleksic`), bez README-a i .gitignore-a.
2. U ovom folderu:
   ```bash
   git remote add origin https://github.com/<korisnik>/ordinacija-aleksic.git
   git push -u origin main
   ```
3. Na GitHubu: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   izaberite granu **main** i folder **/ (root)**, pa **Save**.
4. Posle minut-dva sajt je na `https://<korisnik>.github.io/ordinacija-aleksic/`.

### Sopstveni domen (opciono)

U **Settings → Pages → Custom domain** upišite domen (npr. `ordinacijaaleksic.rs`) i kod registra domena
dodajte DNS zapise koje GitHub navede. Uključite **Enforce HTTPS**.
Kada domen bude poznat, vredi dodati i `<meta property="og:image" content="https://<domen>/assets/hero.webp">`
u `index.html`, da bi se slika prikazivala pri deljenju linka.

## Lokalni pregled

```bash
python3 -m http.server 5173
```
pa otvorite http://localhost:5173.

## Pre objavljivanja proveriti

Neki podaci su privremeni i treba ih potvrditi sa ordinacijom:
- broj pacijenata (15.000+) i godine rada (20+),
- odgovori u sekciji „Najčešća pitanja“ (uput, plaćanje karticom, trajanje terapija),
- spisak terapija u sekciji „Usluge“,
- veličina grupe i trajanje časa pilatesa (do 6 polaznika, 55 min),
- **tim** (sekcija „O ordinaciji“): imena, zvanja i fotografije - sada su „Ime Prezime“ i mesta za slike,
- **utisci pacijenata**: sadašnji tekstovi su primeri i moraju se zameniti stvarnim utiscima, uz saglasnost pacijenata,
- **galerija**: 6 mesta za fotografije prostora.

### Zamena mesta za slike

Mesta za slike su `<div class="ph" data-label="...">`. Zamenite ih sa `<img src="assets/ime.webp" alt="opis">`
(u galeriji unutar `<figure class="shot ...">`, kod tima sa klasom `member__photo`).
Preporuka: `.webp`, širina do 1600px (galerija) odnosno 800px (portreti, format 4:5).

Ikonice usluga: [Lucide](https://lucide.dev) (ISC licenca).
