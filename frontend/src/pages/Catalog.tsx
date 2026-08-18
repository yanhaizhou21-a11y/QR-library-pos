import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, Book } from '../api/client';
import { Cover, Stars } from '../components/ui';

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const kategori = params.get('kategori') || '';
  const [books, setBooks] = useState<Book[]>([]);
  const [kategories, setKategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(q);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<{ kategori: string[] }>('/books/kategori').then((d) => setKategories(d.kategori)).catch(() => undefined);
  }, []);

  useEffect(() => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (kategori) sp.set('kategori', kategori);
    sp.set('limit', '60');
    api
      .get<{ books: Book[]; total: number }>(`/books?${sp.toString()}`)
      .then((d) => {
        setBooks(d.books);
        setTotal(d.total);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [q, kategori]);

  const apply = () => {
    const sp = new URLSearchParams();
    if (search.trim()) sp.set('q', search.trim());
    if (kategori) sp.set('kategori', kategori);
    setParams(sp);
    searchRef.current?.blur();
  };

  return (
    <div className="container page">
      <div className="page-head flex-between">
        <div>
          <h2>Katalog Buku</h2>
          <p className="muted small" style={{ margin: 0 }}>
            {total} buku tersedia di perpustakaan
          </p>
        </div>
        <Link to="/scan" className="btn btn-primary">
          📷 Pindai QR
        </Link>
      </div>

      <div className="card mb-2">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && apply()}
            placeholder="Cari judul, penulis, atau ISBN..."
            style={{ flex: 1, minWidth: 220, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)' }}
          />
          <button className="btn btn-primary" onClick={apply}>
            Cari
          </button>
        </div>
        <div className="flex-wrap mt-1" style={{ marginTop: 12 }}>
          <button
            className={`btn btn-sm ${!kategori ? 'btn-primary' : ''}`}
            onClick={() => setParams(kategori ? (q ? { q } : {}) : { q })}
          >
            Semua
          </button>
          {kategories.map((k) => (
            <button
              key={k}
              className={`btn btn-sm ${kategori === k ? 'btn-primary' : ''}`}
              onClick={() => setParams(kategori === k ? { q } : { q, kategori: k })}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Memuat katalog...</div>
      ) : books.length === 0 ? (
        <div className="empty">Tidak ada buku yang cocok dengan pencarian.</div>
      ) : (
        <div className="grid grid-books">
          {books.map((b) => (
            <Link key={b.id} to={`/buku/${b.id}`} className="book-card">
              <Cover url={b.cover_url} title={b.judul} />
              <div className="book-body">
                <div className="book-title">{b.judul}</div>
                <div className="book-author">{b.penulis}</div>
                {b.rating_count > 0 && (
                  <div className="mb-1">
                    <Stars value={b.rating_avg} size={12} /> <span className="small muted">({b.rating_count})</span>
                  </div>
                )}
                <div className="book-meta">
                  <span className={`badge ${b.stok_tersedia > 0 ? 'badge-green' : 'badge-red'}`}>
                    {b.stok_tersedia > 0 ? `${b.stok_tersedia} tersedia` : 'Habis'}
                  </span>
                  <span className="muted">{b.kategori || ''}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}