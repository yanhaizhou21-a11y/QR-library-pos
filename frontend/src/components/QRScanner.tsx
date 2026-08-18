import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface Props {
  onResult: (text: string) => void;
  hint?: string;
}

export default function QRScanner({ onResult, hint }: Props) {
  const regionId = 'qr-scanner-region';
  const [error, setError] = useState('');
  const [manual, setManual] = useState('');
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let scanner: Html5Qrcode | null = null;
    let stopped = false;

    const init = async () => {
      try {
        scanner = new Html5Qrcode(regionId);
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 230, height: 230 } },
          (text) => {
            if (!stopped) onResult(text);
            scanner?.stop().catch(() => undefined);
          },
          () => undefined,
        );
      } catch {
        setError('Kamera tidak dapat diakses. Gunakan tombol "Masukkan kode manual" di bawah.');
      }
    };
    init();

    return () => {
      stopped = true;
      scanner?.stop().catch(() => undefined);
      scanner?.clear();
    };
  }, [onResult]);

  return (
    <div>
      <div className="scan-frame">
        <div id={regionId} />
        <div className="scan-overlay-note">{hint || 'Arahkan kamera ke QR code buku atau kartu anggota'}</div>
      </div>
      {error && (
        <div className="alert alert-error mt-2" role="alert">
          {error}
        </div>
      )}
      <div className="mt-2" style={{ display: 'flex', gap: 8 }}>
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="Kode QR (contoh: pustaka:book:5)"
          style={{ flex: 1 }}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => manual.trim() && onResult(manual.trim())}
        >
          Proses
        </button>
      </div>
    </div>
  );
}