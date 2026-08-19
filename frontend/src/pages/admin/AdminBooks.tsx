import { FormEvent, useEffect, useState } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  BookOpen,
  Plus,
  Printer,
  Search,
  Download,
  Copy,
  Check,
  Edit2,
  Trash2,
  QrCode,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { api, Book } from '../../api/client';
import { Modal, Cover, StatusBadge } from '../../components/ui';
import { Button } from '@/components/ui/button';

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
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [qrTarget, setQrTarget] = useState<Book | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleDownloadSingleQr = (book: Book) => {
    const canvas = document.getElementById(`qr-canvas-${book.id}`) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `qr-buku-${book.id}-${book.judul.replace(/[^\w]/g, '-')}.png`;
    a.href = url;
    a.click();
  };

  const handleCopyQr = async (book: Book) => {
    const canvas = document.getElementById(`qr-canvas-${book.id}`) as HTMLCanvasElement;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const printAllQr = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const items = books
      .map(
        (b) =>
          `<div style="border:1.5px dashed #0f172a;border-radius:12px;padding:14px;text-align:center;break-inside:avoid;display:inline-flex;flex-direction:column;align-items:center;width:170px;margin:8px;box-sizing:border-box;">
            <img src="/api/books/${b.id}/qr" width="130" height="130" alt="QR" style="border-radius:6px;"/>
            <div style="font-size:12px;font-weight:700;margin-top:8px;line-height:1.2;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${b.judul}</div>
            <div style="font-size:10px;color:#475569;margin-top:2px;">${b.penulis}</div>
            <div style="font-size:9px;font-family:monospace;color:#2563eb;margin-top:4px;background:#eff6ff;padding:2px 4px;border-radius:4px;">pustaka:book:${b.id} • Rak ${b.lokasi_rak || '-'}</div>
           </div>`,
      )
      .join('');
    w.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sheet Label QR Buku - Pustaka QR</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 20px; background: #fff; }
            h2 { margin-bottom: 4px; font-size: 20px; }
            p { color: #64748b; font-size: 12px; margin-top: 0; margin-bottom: 20px; }
            .grid { display: flex; flex-wrap: wrap; }
            @media print { @page { size: A4; margin: 10mm; } }
          </style>
        </head>
        <body>
          <h2>Katalog Label QR Buku Perpustakaan</h2>
          <p>Total: ${books.length} buku · Cetak pada stiker berperekat untuk ditempel di punggung buku.</p>
          <div class="grid">${items}</div>
          <script>window.onload=function(){window.print();}</script>
        </body>
      </html>
    `);
    w.document.close();
  };

  const categories = Array.from(new Set(books.map((b) => b.kategori).filter(Boolean)));

  const filtered = books.filter((b) => {
    const matchSearch =
      !search ||
      b.judul.toLowerCase().includes(search.toLowerCase()) ||
      b.penulis.toLowerCase().includes(search.toLowerCase()) ||
      (b.isbn || '').includes(search) ||
      (b.lokasi_rak || '').toLowerCase().includes(search.toLowerCase());

    const matchCategory = !categoryFilter || b.kategori === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="size-6 text-primary" />
            Kelola Koleksi Buku
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {books.length} buku terdaftar · QR code dibuat otomatis dengan format <code className="font-mono text-primary text-xs bg-primary/10 px-1 py-0.5 rounded">pustaka:book:&lt;id&gt;</code>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={printAllQr} className="gap-1.5 shadow-xs">
            <Printer className="size-4" />
            Cetak Label Sheet
          </Button>
          <Button variant="default" size="sm" onClick={openAdd} className="gap-1.5 shadow-xs font-semibold">
            <Plus className="size-4" />
            Tambah Buku
          </Button>
        </div>
      </div>

      {msg && (
        <div className="alert alert-error flex items-center gap-2 rounded-xl p-3 bg-red-50 text-red-700 border border-red-200">
          <AlertCircle className="size-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, penulis, ISBN, atau nomor rak..."
            className="w-full bg-input border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="sm:col-span-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-input border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Semua Kategori ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat || ''}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-muted-foreground text-sm">
          Memuat data katalog buku...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center border border-dashed rounded-2xl bg-card">
          <BookOpen className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-foreground">Tidak ada buku ditemukan</p>
          <p className="text-xs text-muted-foreground mt-1">Coba ganti kata kunci pencarian atau tambah buku baru.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4 pl-6">Buku</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Stok</th>
                  <th className="p-4">Lokasi Rak</th>
                  <th className="p-4 text-center">QR Code</th>
                  <th className="p-4 pr-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <Cover url={b.cover_url} title={b.judul} size="sm" />
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground text-sm leading-snug truncate max-w-xs">
                            {b.judul}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-xs">
                            {b.penulis} {b.tahun ? `(${b.tahun})` : ''}
                          </div>
                          {b.isbn && (
                            <div className="text-[11px] font-mono text-muted-foreground">
                              ISBN: {b.isbn}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {b.kategori ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                          <Tag className="size-3" />
                          {b.kategori}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={b.stok_tersedia > 0 ? 'aktif' : 'belum'} />
                        <span className="font-mono text-xs font-semibold">
                          {b.stok_tersedia} / {b.stok_total}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-foreground">
                      {b.lokasi_rak || '-'}
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setQrTarget(b)}
                        className="gap-1.5 text-xs rounded-lg shadow-xs"
                      >
                        <QrCode className="size-3.5 text-primary" />
                        QR Preview
                      </Button>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(b)}
                          className="size-8 text-muted-foreground hover:text-foreground"
                          title="Edit Buku"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => remove(b)}
                          className="size-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                          title="Hapus Buku"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Add Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Informasi Buku' : 'Tambah Buku Baru ke Katalog'}>
        <form className="space-y-4 pt-2" onSubmit={save}>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Judul Buku *</label>
            <input
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              required
              className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Penulis *</label>
            <input
              value={form.penulis}
              onChange={(e) => setForm({ ...form, penulis: e.target.value })}
              required
              className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Penerbit</label>
              <input
                value={form.penerbit}
                onChange={(e) => setForm({ ...form, penerbit: e.target.value })}
                className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Tahun Terbit</label>
              <input
                type="number"
                value={form.tahun}
                onChange={(e) => setForm({ ...form, tahun: e.target.value })}
                className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Kategori</label>
              <input
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                placeholder="Teknologi / Sains"
                className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">ISBN</label>
              <input
                value={form.isbn}
                onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                placeholder="978-0132350884"
                className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Lokasi Rak</label>
              <input
                value={form.lokasi_rak}
                onChange={(e) => setForm({ ...form, lokasi_rak: e.target.value })}
                placeholder="RAK-A-01"
                className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Stok Total *</label>
              <input
                type="number"
                min={0}
                value={form.stok_total}
                onChange={(e) => setForm({ ...form, stok_total: Number(e.target.value) })}
                required
                className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">URL Cover / Gambar</label>
            <input
              value={form.cover_url}
              onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
              placeholder="https://..."
              className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Sinopsis / Deskripsi</label>
            <textarea
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              rows={3}
              className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="default" disabled={saving} className="font-semibold">
              {saving ? 'Menyimpan...' : 'Simpan Data Buku'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Interactive Live JS QR Code Modal */}
      <Modal open={!!qrTarget} onClose={() => setQrTarget(null)} title="QR Code Label Buku">
        {qrTarget && (
          <div className="flex flex-col items-center justify-center p-2 text-center space-y-4">
            <div className="p-6 rounded-2xl border-2 border-border/80 bg-white shadow-md flex flex-col items-center justify-center">
              <QRCodeSVG
                value={`pustaka:book:${qrTarget.id}`}
                size={220}
                level="H"
                marginSize={2}
                fgColor="#0f172a"
                bgColor="#ffffff"
                imageSettings={{
                  src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%232563EB"/><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="40" fill="white">P</text></svg>',
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
              <div className="hidden">
                <QRCodeCanvas
                  id={`qr-canvas-${qrTarget.id}`}
                  value={`pustaka:book:${qrTarget.id}`}
                  size={500}
                  level="H"
                  marginSize={3}
                  fgColor="#0f172a"
                  bgColor="#ffffff"
                />
              </div>
              <div className="mt-3 font-bold text-sm text-slate-900 max-w-[220px] truncate">
                {qrTarget.judul}
              </div>
              <div className="text-xs text-slate-500">
                {qrTarget.penulis} • Rak: {qrTarget.lokasi_rak || '-'}
              </div>
              <div className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1.5">
                pustaka:book:{qrTarget.id}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyQr(qrTarget)}
                className="gap-1.5 text-xs rounded-xl"
              >
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                {copied ? 'Tersalin' : 'Salin Gambar'}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleDownloadSingleQr(qrTarget)}
                className="gap-1.5 text-xs rounded-xl font-semibold"
              >
                <Download className="size-3.5" />
                Unduh PNG
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}