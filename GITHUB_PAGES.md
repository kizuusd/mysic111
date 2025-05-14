# Panduan Deploy Mysic ke GitHub Pages

Panduan ini akan membantu Anda men-deploy website Mysic di GitHub Pages, memastikan file HTML ditampilkan sebagai halaman utama (bukan README.md).

## Langkah 1: Persiapan Repository

1. Buat repository baru di GitHub atau gunakan yang sudah ada
2. Clone repository ke komputer lokal Anda
3. Salin semua file dari folder `reluxe` ke root folder repository

## Langkah 2: Pastikan File Penting Ada

Pastikan file-file ini ada di root repository:
- `index.html` - Halaman utama website
- `.nojekyll` - File kosong yang memberitahu GitHub untuk tidak menggunakan Jekyll

## Langkah 3: Gunakan GitHub Actions (Metode Modern)

1. Buat folder `.github/workflows` di repository Anda
2. Salin file `deploy.yml` ke folder tersebut
3. Commit dan push perubahan ke branch `main`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Pages
        uses: actions/configure-pages@v3
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: '.'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

## Langkah 4: Aktifkan GitHub Pages di Settings

1. Buka repository Anda di GitHub
2. Klik tab "Settings"
3. Scroll ke bawah ke bagian "Pages"
4. Di bagian "Build and deployment":
   - Source: pilih "GitHub Actions"
5. Klik "Save"

## Langkah 5: Alternatif (Metode Klasik dengan gh-pages)

Jika tidak ingin menggunakan GitHub Actions:

```bash
# Buat dan pindah ke branch gh-pages
git checkout -b gh-pages

# Tambahkan semua file
git add .

# Commit perubahan
git commit -m "Add website files for GitHub Pages"

# Push ke GitHub
git push -u origin gh-pages
```

Kemudian di Settings > Pages, pilih Source: "Deploy from a branch" dan pilih branch "gh-pages".

## Pemecahan Masalah

Jika GitHub masih menampilkan README.md sebagai halaman utama:

1. Pastikan file index.html ada di root directory
2. Pastikan file .nojekyll ada
3. Cek URL - seharusnya seperti username.github.io/repo-name/
4. Cek di Settings > Pages apakah deployment berhasil

## Domain Kustom (Opsional)

1. Di Settings > Pages > Custom domain
2. Masukkan domain Anda (misal: mysic.com)
3. Tambahkan catatan DNS yang sesuai di penyedia domain Anda

Setelah deployment berhasil, Anda dapat mengakses website Anda di: https://username.github.io/repository-name/ 