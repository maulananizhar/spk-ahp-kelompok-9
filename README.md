Sebuah sistem pemilihan laptop terbaik menggunakan metode Analytical Hierarchy Process (AHP) dengan bahasa pemrograman TypeScript dan framework Next.js

## Penjelasan

Aplikasi ini dibuat menggunakan TypeScript dan framework Next.js. Aplikasi ini merupakan sistem pemilihan laptop terbaik menggunakan metode Analytical Hierarchy Process (AHP). AHP adalah metode yang digunakan untuk mengambil keputusan dengan mempertimbangkan beberapa kriteria dan alternatif yang ada. AHP memerlukan matriks perbandingan berpasangan antar kriteria dan alternatif. Matriks perbandingan berpasangan ini akan diolah menggunakan metode AHP untuk mendapatkan nilai prioritas dari alternatif yang ada.

## Persyaratan

- Node.js v20.16.0
- npm v10.9.0
- Mongod v8.0.1

## Cara Menjalankan

1. Clone repository ini
2. Buka terminal dan arahkan ke direktori repository
3. Install dependencies dengan perintah

```node
npm install
```

4. Build aplikasi dengan perintah

```node
npm run build
```

5. Jalankan aplikasi dengan perintah

```node
npm run start
```

6. Buka browser dan akses [http://localhost:3000](http://localhost:3000) atau [http://127.0.0.1:3000](http://127.0.0.1:3000)

## Fitur

- CRUD pada data kriteria
- CRUD pada data sub-kriteria
- CRUD pada data alternatif (on progress)
- Mengelola matriks perbandingan berpasangan antar kriteria
- Mengelola matriks perbandingan berpasangan antar sub-kriteria
- Melihat hasil perhitungan AHP dalam bentuk grafik
- Melihat ranking alternatif berdasarkan hasil perhitungan AHP
