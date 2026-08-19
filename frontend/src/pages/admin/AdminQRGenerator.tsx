import { useState, useEffect } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Printer,
  Sparkles,
  BookOpen,
  User,
  Layers,
  Wifi,
  Globe,
  Sliders,
} from 'lucide-react';
import { api, Book } from '../../api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type QRPreset = 'book' | 'member' | 'shelf' | 'wifi' | 'custom';

export default function AdminQRGenerator() {
  const [preset, setPreset] = useState<QRPreset>('book');
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<number | string>('');
  const [memberIdInput, setMemberIdInput] = useState('1001');
  const [shelfCode, setShelfCode] = useState('RAK-TECH-01');
  const [wifiSsid, setWifiSsid] = useState('Perpustakaan_Guest_WiFi');
  const [wifiPass, setWifiPass] = useState('pustaka2026');
  const [customText, setCustomText] = useState('https://pustaka.id/katalog');

  // Customization
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrSize, setQrSize] = useState(240);
  const [qrLevel, setQrLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .get<{ books: Book[] }>('/books?limit=100')
      .then((d) => {
        setBooks(d.books);
        if (d.books.length > 0) {
          setSelectedBookId(d.books[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Compute final QR payload
  const getPayload = () => {
    switch (preset) {
      case 'book':
        return `pustaka:book:${selectedBookId || '1'}`;
      case 'member':
        return `pustaka:member:${memberIdInput.trim() || '1'}`;
      case 'shelf':
        return `pustaka:shelf:${shelfCode.trim().toUpperCase() || 'RAK-01'}`;
      case 'wifi':
        return `WIFI:S:${wifiSsid};T:WPA;P:${wifiPass};;`;
      case 'custom':
      default:
        return customText.trim() || 'https://pustaka.id';
    }
  };

  const getLabelTitle = () => {
    switch (preset) {
      case 'book': {
        const found = books.find((b) => String(b.id) === String(selectedBookId));
        return found ? found.judul : `Buku #${selectedBookId}`;
      }
      case 'member':
        return `Kartu Anggota #${memberIdInput}`;
      case 'shelf':
        return `Label Rak ${shelfCode.toUpperCase()}`;
      case 'wifi':
        return `Wi-Fi: ${wifiSsid}`;
      case 'custom':
      default:
        return 'Custom QR Code';
    }
  };

  const handleDownloadPng = () => {
    const canvas = document.getElementById('generator-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `pustaka-qr-${preset}-${Date.now()}.png`;
    a.href = url;
    a.click();
  };

  const handleCopy = async () => {
    const canvas = document.getElementById('generator-canvas') as HTMLCanvasElement;
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

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const canvas = document.getElementById('generator-canvas') as HTMLCanvasElement;
    const dataUrl = canvas ? canvas.toDataURL('image/png') : '';

    w.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak QR Code - Pustaka QR</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 90vh; margin: 0; }
            .card { border: 2px dashed #0f172a; border-radius: 16px; padding: 24px; text-align: center; max-width: 320px; }
            h2 { margin: 12px 0 4px; font-size: 16px; }
            p { margin: 0; color: #64748b; font-size: 12px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="card">
            <img src="${dataUrl}" width="${qrSize}" height="${qrSize}" alt="QR" />
            <h2>${getLabelTitle()}</h2>
            <p>${getPayload()}</p>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <QrCode className="size-6 text-primary" />
            JavaScript QR Code Generator Studio
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hasilkan QR code resolusi tinggi secara client-side untuk Buku, Kartu Anggota, Label Rak, atau Wi-Fi Perpustakaan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 shadow-xs">
            <Printer className="size-4" />
            Cetak Label
          </Button>
          <Button variant="default" size="sm" onClick={handleDownloadPng} className="gap-1.5 shadow-xs font-semibold">
            <Download className="size-4" />
            Unduh PNG HD
          </Button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Options Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Preset Selector */}
          <Card className="rounded-2xl border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                Pilih Tipe / Format Preset
              </CardTitle>
              <CardDescription className="text-xs">
                Sistem akan secara otomatis menyusun skema URI protokol resmi Pustaka QR.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPreset('book')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    preset === 'book'
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BookOpen className="size-4 mb-1.5" />
                  <div className="text-xs font-semibold">Stiker Buku</div>
                  <div className="text-[10px] opacity-75 font-mono">pustaka:book:&lt;id&gt;</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPreset('member')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    preset === 'member'
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <User className="size-4 mb-1.5" />
                  <div className="text-xs font-semibold">Kartu Anggota</div>
                  <div className="text-[10px] opacity-75 font-mono">pustaka:member:&lt;id&gt;</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPreset('shelf')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    preset === 'shelf'
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Layers className="size-4 mb-1.5" />
                  <div className="text-xs font-semibold">Label Rak</div>
                  <div className="text-[10px] opacity-75 font-mono">pustaka:shelf:&lt;kode&gt;</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPreset('wifi')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    preset === 'wifi'
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Wifi className="size-4 mb-1.5" />
                  <div className="text-xs font-semibold">Akses Wi-Fi</div>
                  <div className="text-[10px] opacity-75 font-mono">WIFI:S:SSID...</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPreset('custom')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    preset === 'custom'
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Globe className="size-4 mb-1.5" />
                  <div className="text-xs font-semibold">URL / Bebas</div>
                  <div className="text-[10px] opacity-75 font-mono">Custom Payload</div>
                </button>
              </div>

              {/* Dynamic Payload Form */}
              <div className="mt-5 pt-4 border-t border-border space-y-4">
                {preset === 'book' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-muted-foreground">Pilih Buku Terdaftar</label>
                    <select
                      value={selectedBookId}
                      onChange={(e) => setSelectedBookId(e.target.value)}
                      className="w-full bg-input border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      {books.map((b) => (
                        <option key={b.id} value={b.id}>
                          #{b.id} - {b.judul} ({b.penulis}) [Rak: {b.lokasi_rak || '-'}]
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {preset === 'member' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-muted-foreground">ID / Nomor Anggota</label>
                    <input
                      value={memberIdInput}
                      onChange={(e) => setMemberIdInput(e.target.value)}
                      placeholder="contoh: 1001 atau 42"
                      className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                  </div>
                )}

                {preset === 'shelf' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-muted-foreground">Kode Identitas Rak</label>
                    <input
                      value={shelfCode}
                      onChange={(e) => setShelfCode(e.target.value)}
                      placeholder="RAK-TECH-01"
                      className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                  </div>
                )}

                {preset === 'wifi' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Nama Jaringan Wi-Fi (SSID)</label>
                      <input
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="Perpustakaan_WiFi"
                        className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Password Wi-Fi</label>
                      <input
                        value={wifiPass}
                        onChange={(e) => setWifiPass(e.target.value)}
                        placeholder="Password..."
                        className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                {preset === 'custom' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-muted-foreground">Teks / URL Bebas</label>
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      rows={3}
                      placeholder="https://..."
                      className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Style & Rendering Controls */}
          <Card className="rounded-2xl border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sliders className="size-4 text-primary" />
                Kustomisasi Visual &amp; Error Correction
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Warna Barcode (Foreground)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="size-9 rounded-lg cursor-pointer border border-border bg-transparent"
                    />
                    <input
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-full bg-input border border-border rounded-xl px-3 py-1.5 text-xs font-mono outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Warna Latar (Background)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="size-9 rounded-lg cursor-pointer border border-border bg-transparent"
                    />
                    <input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-full bg-input border border-border rounded-xl px-3 py-1.5 text-xs font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Ukuran Render: {qrSize}px</label>
                  <input
                    type="range"
                    min={160}
                    max={400}
                    step={10}
                    value={qrSize}
                    onChange={(e) => setQrSize(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Error Correction Level</label>
                  <div className="flex gap-1">
                    {(['L', 'M', 'Q', 'H'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setQrLevel(lvl)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                          qrLevel === lvl
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Sertakan Emblem Logo Perpustakaan di Tengah</span>
                <button
                  type="button"
                  onClick={() => setIncludeLogo(!includeLogo)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    includeLogo ? 'bg-primary justify-end' : 'bg-muted justify-start'
                  }`}
                >
                  <div className="bg-white size-4 rounded-full shadow-md" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Live Preview Box */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <Card className="rounded-3xl border-border shadow-md w-full max-w-sm overflow-hidden text-center p-6 space-y-5 bg-card">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-primary/10 text-primary">
                <Sparkles className="size-3" />
                Live Client-Side Preview
              </span>
              <h3 className="font-bold text-base text-foreground mt-2">{getLabelTitle()}</h3>
            </div>

            {/* SVG Render for display */}
            <div
              className="p-6 rounded-2xl shadow-inner border border-border flex items-center justify-center mx-auto"
              style={{ backgroundColor: bgColor }}
            >
              <QRCodeSVG
                value={getPayload()}
                size={qrSize}
                level={qrLevel}
                marginSize={2}
                fgColor={fgColor}
                bgColor={bgColor}
                imageSettings={
                  includeLogo
                    ? {
                        src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%232563EB"/><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="40" fill="white">P</text></svg>',
                        height: Math.floor(qrSize * 0.18),
                        width: Math.floor(qrSize * 0.18),
                        excavate: true,
                      }
                    : undefined
                }
              />
            </div>

            {/* Hidden Canvas for crisp high-resolution export */}
            <div className="hidden">
              <QRCodeCanvas
                id="generator-canvas"
                value={getPayload()}
                size={qrSize * 2}
                level={qrLevel}
                marginSize={3}
                fgColor={fgColor}
                bgColor={bgColor}
                imageSettings={
                  includeLogo
                    ? {
                        src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%232563EB"/><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="40" fill="white">P</text></svg>',
                        height: Math.floor(qrSize * 2 * 0.18),
                        width: Math.floor(qrSize * 2 * 0.18),
                        excavate: true,
                      }
                    : undefined
                }
              />
            </div>

            {/* Payload preview string */}
            <div className="p-2.5 rounded-xl bg-secondary/80 text-[11px] font-mono text-muted-foreground break-all text-left border border-border">
              <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Payload Data:</div>
              <span className="text-foreground">{getPayload()}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs rounded-xl">
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                {copied ? 'Tersalin' : 'Salin Gambar'}
              </Button>
              <Button variant="default" size="sm" onClick={handleDownloadPng} className="gap-1.5 text-xs rounded-xl font-semibold">
                <Download className="size-3.5" />
                Unduh PNG
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
