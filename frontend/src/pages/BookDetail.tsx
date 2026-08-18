import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, Book } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Cover, Stars, fmtDate } from '../components/ui';

interface Review {
  id: number;
  user_id: number;
  nama: string;
  rating: number;
  ulasan: string | null;
  created_at: string;
}

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [antrian, setAntrian] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'ok'; text: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [ulasan, setUlasan] = useState('');

  useEffect(() => {
    api
      .get<{ book: Book; reviews: Review[]; antrianReservasi: number }>(`/books/${id}`)
      .then((d) => {
        setBook(d.book);
        setReviews(d.reviews);
        setAntrian(d.antrianReservasi);
      })
      .catch((e) => setMsg({ type: 'error', text: e.message }))
      .finally(() => setLoading(false));
  }, [id]);

  const reserve = async () => {
    if (!user) return navigate('/masuk');
    setBusy(true);
    setMsg(null);
    try {
      await api.post('/reservations', { bookId: Number(id) });
      setMsg({ type: 'ok', text: 'Reservasi berhasil. Anda akan diberi tahu saat buku tersedia.' });
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const submitReview = async () => {
    if (!user) return navigate('/masuk');
    setBusy(true);
    setMsg(null);
    try {
      await api.post(`/books/${id}/reviews`, { rating, ulasan });
      setUlasan('');
      const d = await api.get<{ book: Book; reviews: Review[] }>(`/books/${id}`);
      setBook(d.book);
      setReviews(d.reviews);
      setMsg({ type: 'ok', text: 'Ulasan tersimpan.' });
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="container page-loading">Memuat detail buku...</div>;
  if (!book) return <div className="container page"><div className="empty">Buku tidak ditemukan.</div></div>;

  return (
    <div className="container page">
      <Link to="/katalog" className="small">← Kembali ke katalog</Link>
      {msg && <div className={`alert alert-${msg.type} mt-2`}>{msg.text}</div>}
      <div className="card mt-1">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <Cover url={book.cover_url} title={book.judul} size="lg" />
          <div style={{ flex: 1, minWidth: 260 }}>
            <h2>{book.judul}</h2>
            <p className="muted">oleh <strong>{book.penulis}</strong></p>
            {book.rating_count > 0 ? (
              <p className="small">
                <Stars value={book.rating_avg} /> {book.rating_avg} dari {book.rating_count} ulasan
              </p>
            ) : (
              <p className="small muted">Belum ada ulasan</p>
            )}
            <div className="flex-wrap mt-2">
              <span className={`badge ${book.stok_tersedia > 0 ? 'badge-green' : 'badge-red'}`}>
                {book.stok_tersedia > 0 ? `${book.stok_tersedia} dari ${book.stok_total} tersedia` : 'Stok habis'}
              </span>
              {book.kategori && <span className="badge badge-blue">{book.kategori}</span>}
              {book.lokasi_rak && <span className="badge badge-gray">Rak {book.lokasi_rak}</span>}
              {antrian > 0 && <span className="badge badge-amber">{antrian} antrian reservasi</span>}
            </div>
            <div className="flex-wrap mt-2">
              <Link to="/scan" className="btn btn-primary">
                📷 Pinjam Lewat Scan QR
              </Link>
              {book.stok_tersedia <= 0 && (
                <button className="btn" onClick={reserve} disabled={busy}>
                  🔖 Reservasi
                </button>
              )}
            </div>
            <div className="small muted mt-2" style={{ display: 'grid', gap: 2 }}>
              {book.isbn && <span>ISBN: {book.isbn}</span>}
              {book.penerbit && <span>Penerbit: {book.penerbit}</span>}
              {book.tahun && <span>Tahun terbit: {book.tahun}</span>}
            </div>
          </div>
        </div>
        {book.deskripsi && (
          <div className="mt-2">
            <h4>Sinopsis</h4>
            <p className="muted" style={{ margin: 0 }}>{book.deskripsi}</p>
          </div>
        )}
      </div>

      <div className="card mt-2">
        <h3>Ulasan Anggota</h3>
        {reviews.length === 0 && <p className="muted small">Belum ada ulasan. Jadilah yang pertama!</p>}
        {reviews.map((r) => (
          <div key={r.id} style={{ borderBottom: '1px solid var(--line)', padding: '12px 0' }}>
            <div className="flex-between">
              <div className="flex gap-sm">
                <div className="avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{r.nama.charAt(0)}</div>
                <div>
                  <strong className="small">{r.nama}</strong>
                  <div><Stars value={r.rating} size={12} /></div>
                </div>
              </div>
              <span className="small muted">{fmtDate(r.created_at)}</span>
            </div>
            {r.ulasan && <p className="small mt-1" style={{ marginBottom: 0 }}>{r.ulasan}</p>}
          </div>
        ))}
        {user && (
          <div className="mt-2">
            <h4>Tulis ulasan</h4>
            <div className="form">
              <div className="field">
                <label>Rating</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Ulasan</label>
                <textarea value={ulasan} onChange={(e) => setUlasan(e.target.value)} rows={3} placeholder="Bagaimana menurut Anda buku ini?" />
              </div>
              <div><button className="btn btn-primary" onClick={submitReview} disabled={busy}>Kirim Ulasan</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}