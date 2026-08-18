import { FormEvent, useEffect, useState } from 'react';
import { api, Book } from '../../api/client';
import { Modal, Cover, StatusBadge } from '../../components/ui';

const EMPTY_FORM = {
  judul: '',
  penulis: '',
  penerbit: '',
  tahun: '',
  kategori: '',
  isbn: '',
  cover_url: '',
  lokasi_rak: '',
  deskripsi: '',
  stok_total: 1,
};

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [qrTarget, setQrTarget] = useState<Book | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get<{ books: Book[] }>(`/books?limit=200`)
      .then((d) => setBooks(d.books))
      .catch((e) => setMsg(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setOpen(true);
  };

  const openEdit = (b: Book) => {
    setEditing(b);
    setForm({
      judul: b.judul,
      penulis: b.penulis,
      penerbit: b.penerbit || '',
      tahun: b.tahun ? String(b.tahun) : '',
      kategori: b.kategori || '',
      isbn: b.isbn || '',
      cover_url: b.cover_url || '',
      lokasi_rak: b.lokasi_rak || '',
      deskripsi: b.deskripsi || '',
      stok_total: b.stok_total,
    });
    setOpen(true);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const payload = {
        ...form,
        tahun: form.tahun ? Number(form.tahun) : null,
        stok_total: Number(form.stok_total) || 0,
      };
      if (editing) {
        await api.put(`/books/${editing.id}`, payload);
      } else {
        await api.post('/books', payload);
      }
      setOpen(false);
      load();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (b: Book) => {
    if (!window.confirm(`Hapus buku "${b.judul}"?`)) return;
    try {
      await api.del(`/books/${b.id}`);
      load();
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  const printAllQr = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const items = books
      .map(
        (b) =>
          `<div style="border:1px solid #ddd;border-radius:8px;padding:14px;text-align:center;break-inside:avoid;display:inline-block;width:180px;margin:6px;">
            <img src="/api/books/${b.id}/qr" width="140" height="140" alt="QR"/>
            <div style="font-size:11px;font-family:sans-serif;margin-top:6px;"><b>${b.judul}</b></div>
            <div style="font-size:10px;color:#666;">${b.id} · ${b.lokasi_rak || ''}</div>
           </div>`,
      )
      .join('');
    w.document.write(`<html><head><title>Cetak QR Buku</title></head><body style="font-family:sans-serif;margin:16px"><h2>Label QR Buku — Pustaka QR</h2>${items}<script>window.onload=function(){window.print();}</script></body></html>`);
    w.document.close();
  };

  const filtered = books.filter(
    (b) =>
      !search ||
      b.judul.toLowerCase().includes(search.toLowerCase()) ||
      b.penulis.toLowerCase().includes(search.toLowerCase()) ||
      (b.isbn || '').includes(search),
  );

  return (
    <div>
      <div className="page-head flex-between">
        <div>
          <h2>Kelola Buku</h2>
          <p className="muted small" style={{ margin: 0 }}>{books.length} buku · QR di-generate otomatis saat buku dibuat</p>
        </div>
        <div className="flex gap-sm">
          <button className="btn" onClick={printAllQr}>🖨️ Cetak Semua QR</button>
          <button className="btn btn-primary" onClick={openAdd}>+ Tambah Buku</button>
        </div>
      </div>
      {msg && <div className="alert alert-error">{msg}</div>}

      <div className="card mb-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari buku..."
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)' }}
        />
      </div>

      {loading ? (
        <div className="page-loading">Memuat buku...</div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>Buku</th><th>Kategori</th><th>Stok</th><th>QR</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td className="cell-title">
                    <div className="flex gap-sm">
                      <Cover url={b.cover_url} title={b.judul} size="sm" />
                      <div>
                        {b.judul}
                        <div className="small muted">{b.penulis}</div>
                        <div className="small muted">Rak {b.lokasi_rak || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {b.kategori && <span className="badge badge-blue">{b.kategori}</span>}
                  </td>
                  <td>
                    <StatusBadge status={b.stok_tersedia > 0 ? 'aktif' : 'belum'} />{' '}
                    <span className="small">{b.stok_tersedia} / {b.stok_total}</span>
                  </td>
                  <td>
                    <button className="btn btn-sm" onClick={() => setQrTarget(b)}>Lihat QR</button>
                  </td>
                  <td>
                    <button className="btn btn-sm" onClick={() => openEdit(b)}>Edit</button>{' '}
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(b)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Buku' : 'Tambah Buku Baru'}>
        <form className="form" onSubmit={save}>
          <div className="field">
            <label>Judul *</label>
            <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} required />
          </div>
          <div className="field">
            <label>Penulis *</label>
            <input value={form.penulis} onChange={(e) => setForm({ ...form, penulis: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="field">
              <label>Penerbit</label>
              <input value={form.penerbit} onChange={(e) => setForm({ ...form, penerbit: e.target.value })} />
            </div>
            <div className="field">
              <label>Tahun</label>
              <input type="number" value={form.tahun} onChange={(e) => setForm({ ...form, tahun: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Kategori</label>
              <input value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} placeholder="contoh: Teknologi" />
            </div>
            <div className="field">
              <label>ISBN</label>
              <input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Lokasi Rak</label>
              <input value={form.lokasi_rak} onChange={(e) => setForm({ ...form, lokasi_rak: e.target.value })} />
            </div>
            <div className="field">
              <label>Stok Total *</label>
              <input type="number" min={0} value={form.stok_total} onChange={(e) => setForm({ ...form, stok_total: Number(e.target.value) })} required />
            </div>
          </div>
          <div className="field">
            <label>URL Sampul</label>
            <input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} placeholder="https://..." />
          </div>
          <div className="field">
            <label>Deskripsi</label>
            <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3} />
          </div>
          <div className="flex gap-sm">
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Batal</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!qrTarget} onClose={() => setQrTarget(null)} title={`QR Buku: ${qrTarget?.judul || ''}`}>
        {qrTarget && (
          <div style={{ textAlign: 'center' }}>
            <img src={`/api/books/${qrTarget.id}/qr`} width={220} height={220} alt="QR Buku" style={{ borderRadius: 10 }} />
            <p className="small muted" style={{ margin: '10px 0 4px' }}>Kode: {qrTarget.qr_code}</p>
            <p className="small muted" style={{ margin: '0 0 16px' }}>Rak {qrTarget.lokasi_rak || '-'}</p>
            <a className="btn btn-primary btn-block" href={`/api/books/${qrTarget.id}/qr`} target="_blank" rel="noreferrer">
              🖨️ Buka / Cetak Label QR
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
}