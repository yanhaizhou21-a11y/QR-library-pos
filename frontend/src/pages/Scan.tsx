import { useState } from 'react';
import { Link } from 'react-router-dom';
import QRScanner from '../components/QRScanner';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Cover, StatusBadge, rupiah, fmtDate } from '../components/ui';

type Mode = 'pinjam' | 'kembali' | 'info';
type Stage = 'idle' | 'book' | 'confirm' | 'done';

interface ScanBook {
  id: number;
  judul: string;
  penulis: string;
  kategori: string | null;
  stok_tersedia: number;
  lokasi_rak: string | null;
  cover_url?: string | null;
  qr_code: string;
}
interface ScanMember {
  id: number;
  nama: string;
  no_anggota: string | null;
  status: string;
  qr_code: string;
}

export default function Scan() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('pinjam');
  const [stage, setStage] = useState<Stage>('idle');
  const [book, setBook] = useState<ScanBook | null>(null);
  const [member, setMember] = useState<ScanMember | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [scanningForMember, setScanningForMember] = useState(false);

  const reset = () => {
    setStage('idle');
    setBook(null);
    setMember(null);
    setError('');
    setResult(null);
    setScanningForMember(false);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    reset();
  };

  const handleScan = async (code: string) => {
    setError('');
    if (scanningForMember) {
      try {
        const d = await api.post<{ valid: boolean; type?: string; member?: ScanMember; error?: string }>('/scan/parse', { code });
        if (!d.valid || d.type !== 'member') {
          setError(d.error || 'QR bukan kartu anggota.');
          return;
        }
        setMember(d.member!);
        setScanningForMember(false);
        setStage('book');
      } catch (e: any) {
        setError(e.message);
      }
      return;
    }
    try {
      const d = await api.post<{ valid: boolean; type?: string; book?: ScanBook; member?: ScanMember; error?: string }>('/scan/parse', { code });
      if (!d.valid) {
        setError(d.error || 'QR tidak valid.');
        return;
      }
      if (d.type === 'book') {
        setBook(d.book!);
        if (mode === 'info') {
          setStage('done');
        } else {
          setStage('confirm');
        }
      } else if (d.type === 'member') {
        if (mode === 'info') {
          setMember(d.member!);
          setStage('done');
        } else {
          setMember(d.member!);
          setStage('book');
        }
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const doBorrow = async () => {
    if (!book) return;
    setBusy(true);
    setError('');
    try {
      const path = user?.role === 'admin' && member ? '/scan/borrow-as' : '/scan/borrow';
      const body = user?.role === 'admin' && member ? { bookId: book.id, memberId: member.id } : { bookId: book.id };
      const d = await api.post<{ ok: boolean; loan: any }>(path, body);
      setResult(d.loan);
      setStage('done');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const doReturn = async () => {
    if (!book) return;
    setBusy(true);
    setError('');
    try {
      const d = await api.post<{ ok: boolean; loan: any }>('/scan/return', { bookId: book.id });
      setResult(d.loan);
      setStage('done');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const needsLogin = mode === 'pinjam' && !user;

  return (
    <div className="container-narrow page">
      <div className="page-head text-center" style={{ textAlign: 'center' }}>
        <h2>📷 Pindai QR</h2>
        <p className="muted" style={{ margin: 0 }}>Scan QR buku atau kartu anggota untuk transaksi cepat.</p>
      </div>

      <div className="tabs">
        <button className={`tab ${mode === 'pinjam' ? 'active' : ''}`} onClick={() => switchMode('pinjam')}>Pinjam</button>
        <button className={`tab ${mode === 'kembali' ? 'active' : ''}`} onClick={() => switchMode('kembali')}>Kembalikan</button>
        <button className={`tab ${mode === 'info' ? 'active' : ''}`} onClick={() => switchMode('info')}>Info Buku</button>
      </div>

      {needsLogin && (
        <div className="card">
          <div className="alert alert-info" style={{ marginBottom: 0 }}>
            Untuk meminjam buku Anda harus menjadi anggota yang terdaftar.
          </div>
          <div className="flex gap-sm mt-1">
            <Link to="/masuk" className="btn btn-primary">Masuk</Link>
            <Link to="/daftar" className="btn">Daftar Anggota</Link>
          </div>
        </div>
      )}

      {!needsLogin && stage === 'idle' && (
        <div className="card">
          <p className="small muted" style={{ marginTop: 0 }}>
            {mode === 'pinjam' &&
              (user?.role === 'admin'
                ? '1) Scan kartu anggota peminjam · 2) Scan QR buku. Petugas dapat meminjamkan atas nama anggota.'
                : 'Pertama scan kartu anggota Anda (atau gunakan akun aktif), lalu scan QR buku yang dipinjam.')}
            {mode === 'kembali' && 'Scan QR buku yang akan dikembalikan. Sistem otomatis mencocokkan transaksi aktif dan menghitung denda.'}
            {mode === 'info' && 'Scan QR buku atau kartu anggota untuk melihat informasi tanpa melakukan transaksi.'}
          </p>
          {mode === 'pinjam' && user?.role === 'member' && (
            <button className="btn btn-primary btn-block mb-1" onClick={() => { setMember({ id: user.id, nama: user.nama, no_anggota: user.no_anggota, status: user.status, qr_code: '' } as ScanMember); setStage('book'); }}>
              ✓ Pakai akun saya: {user.nama}
            </button>
          )}
          <QRScanner onResult={handleScan} hint={mode === 'pinjam' && user?.role === 'admin' ? 'Scan kartu anggota dulu' : undefined} />
        </div>
      )}

      {!needsLogin && stage === 'book' && (
        <div className="card">
          {member && (
            <div className="flex-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
              <div>
                <strong>Anggota:</strong> {member.nama}
                <div className="small muted">No. anggota {member.no_anggota} · <StatusBadge status={member.status} /></div>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => { setMember(null); setStage('idle'); }}>Ganti</button>
            </div>
          )}
          <p className="small muted mb-1" style={{ marginBottom: 12 }}>Sekarang scan QR buku:</p>
          <QRScanner onResult={handleScan} hint="Scan QR buku" />
        </div>
      )}

      {stage === 'confirm' && book && (
        <div className="card">
          <h3>Konfirmasi {mode === 'pinjam' ? 'Peminjaman' : 'Pengembalian'}</h3>
          <div className="flex gap-sm" style={{ alignItems: 'flex-start' }}>
            <Cover url={book.cover_url} title={book.judul} size="sm" />
            <div>
              <strong>{book.judul}</strong>
              <div className="small muted">{book.penulis}</div>
              <div className="small muted">{book.kategori} · Rak {book.lokasi_rak}</div>
              <div className="mt-1">
                {mode === 'pinjam' ? (
                  <span className={`badge ${book.stok_tersedia > 0 ? 'badge-green' : 'badge-red'}`}>
                    {book.stok_tersedia > 0 ? `${book.stok_tersedia} tersedia` : 'Stok habis'}
                  </span>
                ) : (
                  <span className="badge badge-blue">Buku masuk transaksi pengembalian</span>
                )}
              </div>
            </div>
          </div>
          {error && <div className="alert alert-error mt-2">{error}</div>}
          <div className="flex gap-sm mt-2">
            <button className="btn btn-primary" onClick={mode === 'pinjam' ? doBorrow : doReturn} disabled={busy}>
              {busy ? 'Memproses...' : mode === 'pinjam' ? '✓ Konfirmasi Pinjam' : '✓ Konfirmasi Kembali'}
            </button>
            <button className="btn btn-ghost" onClick={reset}>Batal</button>
          </div>
        </div>
      )}

      {stage === 'done' && mode === 'info' && (
        <div className="card">
          <h3>Hasil Pindai</h3>
          {book && (
            <div className="flex gap-sm">
              <Cover url={book.cover_url} title={book.judul} size="sm" />
              <div>
                <strong>{book.judul}</strong>
                <div className="small muted">{book.penulis}</div>
                <div className="small muted">{book.kategori || ''} · Rak {book.lokasi_rak || '-'}</div>
                <div className="mt-1"><span className={`badge ${book.stok_tersedia > 0 ? 'badge-green' : 'badge-red'}`}>{book.stok_tersedia > 0 ? `${book.stok_tersedia} tersedia` : 'Stok habis'}</span></div>
              </div>
            </div>
          )}
          {member && (
            <div>
              <strong>{member.nama}</strong>
              <div className="small muted">No. anggota {member.no_anggota}</div>
              <div className="mt-1"><StatusBadge status={member.status} /></div>
            </div>
          )}
          <div className="mt-2 flex gap-sm">
            <Link to={`/buku/${book?.id}`} className="btn btn-primary">Lihat Detail Buku</Link>
            <button className="btn" onClick={reset}>Scan Lagi</button>
          </div>
        </div>
      )}

      {stage === 'done' && mode !== 'info' && result && (
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44 }}>{mode === 'pinjam' ? '📚' : result.denda > 0 ? '⚠️' : '✅'}</div>
            <h3>{mode === 'pinjam' ? 'Peminjaman Berhasil' : result.denda > 0 ? 'Pengembalian Terlambat' : 'Pengembalian Berhasil'}</h3>
            <p className="muted" style={{ margin: 0 }}>
              <strong>{result.judul}</strong>
            </p>
            <div className="small muted" style={{ marginTop: 4 }}>
              {mode === 'pinjam' ? `Dipinjam oleh ${result.nama}` : `Dikembalikan oleh ${result.nama}`}
            </div>
          </div>
          <div className="divider" />
          {mode === 'pinjam' && (
            <div className="flex-between small">
              <span className="muted">No. transaksi</span>
              <strong>#{result.loanId}</strong>
            </div>
          )}
          {mode === 'pinjam' && (
            <div className="flex-between small">
              <span className="muted">Jatuh tempo</span>
              <strong>{fmtDate(result.tanggalJatuhTempo)}</strong>
            </div>
          )}
          {mode === 'kembali' && (
            <>
              <div className="flex-between small">
                <span className="muted">Hari terlambat</span>
                <strong>{result.hariTerlambat}</strong>
              </div>
              <div className="flex-between small">
                <span className="muted">Denda</span>
                <strong className={result.denda > 0 ? 'text-danger' : ''} style={{ color: result.denda > 0 ? 'var(--danger)' : 'var(--ok)' }}>{rupiah(result.denda)}</strong>
              </div>
              {result.denda > 0 && (
                <p className="small mt-1" style={{ marginBottom: 0 }}>Denda tercatat di akun anggota dan dapat dibayarkan ke petugas.</p>
              )}
            </>
          )}
          <div className="mt-2 flex gap-sm" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={reset}>Selesai / Scan Lagi</button>
            {mode === 'pinjam' && <Link to="/pinjaman" className="btn">Lihat Pinjaman</Link>}
          </div>
        </div>
      )}
    </div>
  );
}