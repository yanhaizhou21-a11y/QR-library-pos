import { ReactNode, useEffect } from 'react';

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="rating" style={{ fontSize: size }} title={`${value || 0}/5`}>
      {'★'.repeat(Math.round(value || 0))}
      <span className="rating-empty">{'★'.repeat(5 - Math.round(value || 0))}</span>
    </span>
  );
}

export function Cover({ url, title, size = 'md' }: { url?: string | null; title: string; size?: 'md' | 'lg' | 'sm' }) {
  const width = size === 'lg' ? 180 : size === 'sm' ? 52 : 120;
  return (
    <div className="book-cover" style={{ width, aspectRatio: '3/4.2' }}>
      {url ? <img src={url} alt={title} loading="lazy" /> : <span>📖</span>}
    </div>
  );
}

export function rupiah(n: number | string): string {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
}

export function fmtDate(iso?: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtDateTime(iso?: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    dipinjam: { cls: 'badge-blue', label: 'Dipinjam' },
    terlambat: { cls: 'badge-red', label: 'Terlambat' },
    selesai: { cls: 'badge-green', label: 'Selesai' },
    menunggu: { cls: 'badge-amber', label: 'Menunggu' },
    tersedia: { cls: 'badge-green', label: 'Tersedia' },
    dibatalkan: { cls: 'badge-gray', label: 'Dibatalkan' },
    kadaluarsa: { cls: 'badge-gray', label: 'Kadaluarsa' },
    aktif: { cls: 'badge-green', label: 'Aktif' },
    blokir: { cls: 'badge-red', label: 'Diblokir' },
    lunas: { cls: 'badge-green', label: 'Lunas' },
    belum: { cls: 'badge-amber', label: 'Belum Bayar' },
    admin: { cls: 'badge-blue', label: 'Admin' },
    member: { cls: 'badge-gray', label: 'Anggota' },
  };
  const s = map[status] || { cls: 'badge-gray', label: status };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}