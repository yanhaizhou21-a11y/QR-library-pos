import bcrypt from 'bcryptjs';
import { db, get, run, setSetting, pushNotification } from './db';
import { bookCode, memberCode } from './utils/qr';
import { nowISO, addDaysISO } from './utils/date';

function hasData() {
  const row = get<{ c: number }>('SELECT COUNT(*) as c FROM users');
  return (row?.c || 0) > 0;
}

const BOOKS = [
  { judul: 'Akuntansi Dasar: Teori dan Praktik', penulis: 'Andi Pratama', penerbit: 'Erlangga', tahun: 2020, kategori: 'Ekonomi', isbn: '978-602-1111-01-0', lokasi_rak: 'RAK A1', deskripsi: 'Buku pegangan akuntansi dasar yang mencakup jurnal, buku besar, hingga laporan keuangan. Dilengkapi latihan soal.', stok: 5 },
  { judul: 'Manajemen POS & Kasir Modern', penulis: 'Dewi Lestari', penerbit: 'Penerbit Nusantara', tahun: 2022, kategori: 'Ekonomi', isbn: '978-602-1111-02-7', lokasi_rak: 'RAK A2', deskripsi: 'Panduan mengelola sistem Point of Sale dari perangkat keras, perangkat lunak, hingga pelaporan harian.', stok: 3 },
  { judul: 'Pengantar Algoritma & Pemrograman', penulis: 'Budi Santoso', penerbit: 'Informatika', tahun: 2021, kategori: 'Teknologi', isbn: '978-602-1111-03-4', lokasi_rak: 'RAK B1', deskripsi: 'Fondasi algoritma, kompleksitas, dan implementasi dalam bahasa modern. Cocok untuk pemula.', stok: 8 },
  { judul: 'Basis Data untuk Pemula', penulis: 'Sari Wulandari', penerbit: 'Informatika', tahun: 2019, kategori: 'Teknologi', isbn: '978-602-1111-04-1', lokasi_rak: 'RAK B2', deskripsi: 'Pengenalan relasional, SQL, normalisasi, dan studi kasus pembangunan sistem informasi.', stok: 4 },
  { judul: 'Sejarah Nusantara: Dari Kerajaan Hingga Republik', penulis: 'Raden Surya', penerbit: 'Balai Pustaka', tahun: 2018, kategori: 'Sejarah', isbn: '978-602-1111-05-8', lokasi_rak: 'RAK C1', deskripsi: 'Kronologi lengkap peradaban Nusantara dengan peta dan ilustrasi.', stok: 2 },
  { judul: 'Sastra Anak Nusantara', penulis: 'Maharani Putri', penerbit: 'Gramedia', tahun: 2023, kategori: 'Fiksi', isbn: '978-602-1111-06-5', lokasi_rak: 'RAK D1', deskripsi: 'Kumpulan dongeng dan cerita rakyat dari berbagai daerah dengan pesan moral.', stok: 10 },
  { judul: 'Fisika Kuantum untuk Semua', penulis: 'Dr. Arief Hidayat', penerbit: 'Republika', tahun: 2020, kategori: 'Sains', isbn: '978-602-1111-07-2', lokasi_rak: 'RAK E1', deskripsi: 'Menjelaskan konsep kuantum tanpa matematika rumit.', stok: 3 },
  { judul: 'Public Speaking: Percaya Diri Berbicara', penulis: 'Yuni Hartono', penerbit: 'Erlangga', tahun: 2022, kategori: 'Pengembangan', isbn: '978-602-1111-08-9', lokasi_rak: 'RAK F1', deskripsi: 'Teknik mengatasi demam panggung dan membangun narasi yang memikat.', stok: 6 },
  { judul: 'Panduan Bercocok Tanam Hidroponik', penulis: 'Tono Wijaya', penerbit: 'Penerbit Nusantara', tahun: 2021, kategori: 'Pertanian', isbn: '978-602-1111-09-6', lokasi_rak: 'RAK G1', deskripsi: 'Praktik menanam sayur tanpa tanah untuk rumah tangga dan usaha kecil.', stok: 4 },
  { judul: 'Cerita Rakyat Kalimantan', penulis: 'Ida Kurnia', penerbit: 'Balai Pustaka', tahun: 2017, kategori: 'Fiksi', isbn: '978-602-1111-10-2', lokasi_rak: 'RAK D2', deskripsi: 'Legenda dan kisah rakyat Kalimantan yang divisualisasikan ulang.', stok: 7 },
  { judul: 'Jurnalistik Digital di Era Media Sosial', penulis: 'Fajar Nugroho', penerbit: 'Gramedia', tahun: 2023, kategori: 'Komunikasi', isbn: '978-602-1111-11-9', lokasi_rak: 'RAK F2', deskripsi: 'Menulis berita, etika jurnalistik, dan pemanfaatan platform digital.', stok: 3 },
  { judul: 'Kewirausahaan untuk Mahasiswa', penulis: 'Rina Marlina', penerbit: 'Informatika', tahun: 2022, kategori: 'Ekonomi', isbn: '978-602-1111-12-6', lokasi_rak: 'RAK A3', deskripsi: 'Membangun ide usaha, business plan, dan pemasaran digital tahap awal.', stok: 5 },
];

function cover(i: number) {
  return `https://picsum.photos/seed/pustaka${i}/300/420`;
}

export function seed() {
  if (hasData()) {
    console.log('[seed] Database sudah terisi, melewati seeding.');
    return;
  }
  console.log('[seed] Mengisi data awal...');

  setSetting('loanDays', 7);
  setSetting('finePerDay', 1000);
  setSetting('maxActiveLoans', 3);

  const now = nowISO();

  const adminHash = bcrypt.hashSync('admin123', 10);
  const aRes = run(
    'INSERT INTO users (nama, email, password_hash, role, no_anggota, phone, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ['Petugas Perpustakaan', 'admin@pustaka.id', adminHash, 'admin', 'ADM-001', '081234567890', 'aktif', now],
  );
  run('UPDATE users SET no_anggota = ? WHERE id = ?', ['ADM' + String(aRes.lastId).padStart(3, '0'), aRes.lastId]);
  pushNotification(aRes.lastId, 'info', 'Akun admin berhasil dibuat. Default: admin@pustaka.id / admin123');

  const memberData = [
    ['Budi Setiawan', 'budi@pustaka.id', '085711223344', '081234567890'],
    ['Siti Aminah', 'siti@pustaka.id', '085722334455', '081298765432'],
    ['Rizky Ramadhan', 'rizky@pustaka.id', '085733445566', null],
  ];
  const memberIds: number[] = [];
  for (const [nama, email, phone, noAnggota] of memberData) {
    const hash = bcrypt.hashSync('member123', 10);
    const res = run(
      'INSERT INTO users (nama, email, password_hash, role, no_anggota, phone, status, created_at) VALUES (?, ?, ?, \'member\', ?, ?, \'aktif\', ?)',
      [nama, email, hash, null, phone || null, now],
    );
    const no = noAnggota || ('A' + String(res.lastId).padStart(4, '0'));
    run('UPDATE users SET no_anggota = ? WHERE id = ?', [no, res.lastId]);
    memberIds.push(res.lastId);
    pushNotification(res.lastId, 'info', 'Selamat datang di Pustaka QR! Kartu anggota digital Anda tersedia di halaman profil.');
  }

  const bookIds: number[] = [];
  for (let i = 0; i < BOOKS.length; i++) {
    const b = BOOKS[i];
    const res = run(
      `INSERT INTO books (judul, penulis, penerbit, tahun, kategori, isbn, cover_url, lokasi_rak, deskripsi, qr_code, stok_total, stok_tersedia, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.judul, b.penulis, b.penerbit, b.tahun, b.kategori, b.isbn, cover(i), b.lokasi_rak, b.deskripsi, null, b.stok, b.stok, now],
    );
    run('UPDATE books SET qr_code = ? WHERE id = ?', [bookCode(res.lastId), res.lastId]);
    bookIds.push(res.lastId);
  }

  const pinjam = (userId: number, bookIdx: number, daysAgo: number, dueIn: number) => {
    const bookId = bookIds[bookIdx];
    const tPinjam = addDaysISO(nowISO(), -daysAgo);
    const tDue = addDaysISO(nowISO(), dueIn);
    run('INSERT INTO loans (user_id, book_id, tanggal_pinjam, tanggal_jatuh_tempo, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, bookId, tPinjam, tDue, 'dipinjam', tPinjam]);
    run('UPDATE books SET stok_tersedia = stok_tersedia - 1 WHERE id = ?', [bookId]);
  };

  pinjam(memberIds[0], 0, 12, 2);
  pinjam(memberIds[1], 2, 15, -1);
  pinjam(memberIds[2], 6, 30, -8);
  pinjam(memberIds[0], 5, 40, -20);

  db.prepare(`UPDATE loans SET status = 'terlambat' WHERE tanggal_jatuh_tempo < datetime('now') AND status='dipinjam'`).run();

  const finir = (userId: number, bookIdx: number, pinjamDaysAgo: number, kembaliDaysAgo: number) => {
    const tPinjam = addDaysISO(nowISO(), -pinjamDaysAgo);
    const tDue = addDaysISO(tPinjam, 7);
    const tKembali = addDaysISO(nowISO(), -kembaliDaysAgo);
    const late = Math.max(0, kembaliDaysAgo - (pinjamDaysAgo - 7));
    const { lastId } = run(
      'INSERT INTO loans (user_id, book_id, tanggal_pinjam, tanggal_jatuh_tempo, tanggal_kembali, status, created_at) VALUES (?, ?, ?, ?, ?, \'selesai\', ?)',
      [userId, bookIdx, tPinjam, tDue, tKembali, tPinjam],
    );
    if (late > 0) {
      const denda = late * 1000;
      run('INSERT INTO fines (loan_id, user_id, jumlah, hari_terlambat, status_bayar, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [lastId, userId, denda, late, late > 14 ? 'lunas' : 'belum', tKembali],
      );
    }
  };

  finir(memberIds[2], bookIds[6], 12, 8);
  finir(memberIds[0], bookIds[5], 25, 9);
  finir(memberIds[1], bookIds[3], 30, 12);
  finir(memberIds[2], bookIds[8], 40, 20);
  finir(memberIds[1], bookIds[0], 15, 16);
  finir(memberIds[0], bookIds[1], 10, 11);

  run('INSERT INTO reservations (user_id, book_id, tanggal_reservasi, status, created_at) VALUES (?, ?, ?, \'menunggu\', ?)',
    [memberIds[1], bookIds[6], now, now]);
  run('INSERT INTO reservations (user_id, book_id, tanggal_reservasi, status, created_at) VALUES (?, ?, ?, \'menunggu\', ?)',
    [memberIds[0], bookIds[2], now, now]);

  const reviews = [
    [memberIds[0], 0, 5, 'Sangat membantu untuk kuliah akuntansi saya.'],
    [memberIds[1], 2, 4, 'Penjelasan algoritma cukup runtut.'],
    [memberIds[2], 6, 5, 'Fisika kuantum yang mudah dimengerti.'],
    [memberIds[1], 5, 4, 'Cerita anak-anaknya bagus untuk dikisahkan ke adik.'],
  ];
  for (const [u, b, rating, ulasan] of reviews) {
    run('INSERT INTO reviews (user_id, book_id, rating, ulasan, created_at) VALUES (?, ?, ?, ?, ?)',
      [u, bookIds[b as number], rating, ulasan, now]);
  }

  console.log('[seed] Selesai. Akun demo: admin@pustaka.id/admin123 | budi@pustaka.id/member123');
}