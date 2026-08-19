import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  Download,
  Copy,
  Printer,
  Sparkles,
  BookOpen,
  User,
  Wifi,
  Tag,
  Link2,
  Check,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type Mode = 'book' | 'member' | 'shelf' | 'wifi' | 'custom';

export default function AdminQRGenerator() {
  const [mode, setMode] = useState<Mode>('book');
  const [books, setBooks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form State
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [customBookTitle, setCustomBookTitle] = useState<string>('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [shelfCode, setShelfCode] = useState<string>('RAK-A-01');
  const [shelfDesc, setShelfDesc] = useState<string>('Sains & Teknologi Komputer');
  const [wifiSsid, setWifiSsid] = useState<string>('PustakaQR-Guest');
  const [wifiPass, setWifiPass] = useState<string>('baca1234');
  const [wifiType, setWifiType] = useState<string>('WPA');
  const [customText, setCustomText] = useState<string>('https://pustaka.id');

  // Styling State
  const [qrFgColor, setQrFgColor] = useState<string>('#0f172a');
  const [qrBgColor, setQrBgColor] = useState<string>('#ffffff');
  const [qrSize, setQrSize] = useState<number>(260);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [includeLogo, setIncludeLogo] = useState<boolean>(true);

  // Hidden canvas for PNG export
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<any>('/api/books?limit=50').catch(() => ({ books: [] })),
      api.get<any>('/api/admin/members').catch(() => ({ members: [] })),
    ]).then(([bData, mData]) => {
      if (bData?.books) {
        setBooks(bData.books);
        if (bData.books.length > 0) setSelectedBookId(String(bData.books[0].id));
      }
      if (mData?.members) {
        setMembers(mData.members);
        if (mData.members.length > 0) setSelectedMemberId(String(mData.members[0].id));
      }
      setLoading(false);
    });
  }, []);

  // Compute final QR payload
  let qrPayload = '';
  let previewTitle = '';
  let previewSubtitle = '';

  if (mode === 'book') {
    const b = books.find((x) => String(x.id) === selectedBookId);
    const id = selectedBookId || '1';
    qrPayload = `pustaka:book:${id}`;
    previewTitle = b ? b.judul : (customBookTitle || `Buku #${id}`);
    previewSubtitle = b ? `${b.penulis} • Rak: ${b.lokasi_rak || '-'}` : 'QR Label Buku Perpustakaan';
  } else if (mode === 'member') {
    const m = members.find((x) => String(x.id) === selectedMemberId);
    const id = selectedMemberId || '1';
    qrPayload = `pustaka:member:${id}`;
    previewTitle = m ? m.nama : `Anggota #${id}`;
    previewSubtitle = m ? `No. Anggota: ${m.no_anggota}` : 'Kartu Anggota Digital';
  } else if (mode === 'shelf') {
    qrPayload = `pustaka:shelf:${shelfCode}`;
    previewTitle = `Rak: ${shelfCode}`;
    previewSubtitle = shelfDesc;
  } else if (mode === 'wifi') {
    qrPayload = `WIFI:S:${wifiSsid};T:${wifiType};P:${wifiPass};;`;
    previewTitle = `Wi-Fi: ${wifiSsid}`;
    previewSubtitle = `Password: ${wifiPass} (${wifiType})`;
  } else {
    qrPayload = customText || 'pustaka:custom';
    previewTitle = 'Custom QR Payload';
    previewSubtitle = qrPayload;
  }

  // Handle PNG Download
  const handleDownloadPng = () => {
    const canvas = document.getElementById('qr-canvas-download') as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `qr-${mode}-${Date.now()}.png`;
    a.href = url;
    a.click();
  };

  // Handle SVG Download
  const handleDownloadSvg = () => {
    const svgEl = document.getElementById('qr-svg-preview');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const a = document.createElement('a');
    a.download = `qr-${mode}-${Date.now()}.svg`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle Copy to Clipboard
  const handleCopy = async () => {
    const canvas = document.getElementById('qr-canvas-download') as HTMLCanvasElement;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const canvas = document.getElementById('qr-canvas-download') as HTMLCanvasElement;
    const dataUrl = canvas ? canvas.toDataURL('image/png') : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak QR Code - ${previewTitle}</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fff; text-align: center; }
            .badge { border: 2px dashed #0f172a; padding: 24px 32px; border-radius: 16px; display: inline-flex; flex-direction: column; align-items: center; }
            .title { font-size: 20px; font-weight: 800; margin-top: 14px; color: #0f172a; max-width: 320px; }
            .subtitle { font-size: 14px; color: #475569; margin-top: 4px; }
            .payload { font-size: 11px; font-family: monospace; color: #94a3b8; margin-top: 8px; }
            @media print { @page { size: auto; margin: 10mm; } }
          </style>
        </head>
        <body>
          <div class="badge">
            <img src="${dataUrl}" width="${qrSize}" height="${qrSize}" alt="QR" />
            <div class="title">${previewTitle}</div>
            <div class="subtitle">${previewSubtitle}</div>
            <div class="payload">${qrPayload}</div>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary p-1.5 rounded-lg">
              <Sparkles className="size-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              JavaScript QR Generator Studio
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Generate, customize, and batch export crisp QR codes in client-side JavaScript for library books, member passes, shelf markers, and access points.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 shadow-xs">
            <Printer className="size-4" />
            Print Label
          </Button>
          <Button variant="default" size="sm" onClick={handleDownloadPng} className="gap-1.5 shadow-xs">
            <Download className="size-4" />
            Download PNG
          </Button>
        </div>
      </div>

      {/* Mode Selector Pill Bar */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-secondary/80 rounded-2xl border border-border/60 max-w-3xl">
        <button
          onClick={() => setMode('book')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            mode === 'book'
              ? 'bg-background text-primary shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="size-4" />
          Book Label
        </button>
        <button
          onClick={() => setMode('member')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            mode === 'member'
              ? 'bg-background text-primary shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="size-4" />
          Member Card Pass
        </button>
        <button
          onClick={() => setMode('shelf')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            mode === 'shelf'
              ? 'bg-background text-primary shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Tag className="size-4" />
          Shelf Tag
        </button>
        <button
          onClick={() => setMode('wifi')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            mode === 'wifi'
              ? 'bg-background text-primary shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Wifi className="size-4" />
          Wi-Fi Pass
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            mode === 'custom'
              ? 'bg-background text-primary shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Link2 className="size-4" />
          Custom Text / URL
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input & Customization Controls */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-2xl border-border shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">1. Data Payload Configuration</CardTitle>
              <CardDescription className="text-xs">
                Select the entity or enter the parameter for the generated QR identifier.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {mode === 'book' && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Select Catalog Book
                  </label>
                  <select
                    value={selectedBookId}
                    onChange={(e) => setSelectedBookId(e.target.value)}
                    className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.judul} — {b.penulis} (ID: {b.id})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    QR Format: <code className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">pustaka:book:{selectedBookId || 'ID'}</code>
                  </p>
                </div>
              )}

              {mode === 'member' && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Select Member
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nama} — {m.no_anggota} ({m.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    QR Format: <code className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">pustaka:member:{selectedMemberId || 'ID'}</code>
                  </p>
                </div>
              )}

              {mode === 'shelf' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                        Shelf Code
                      </label>
                      <input
                        type="text"
                        value={shelfCode}
                        onChange={(e) => setShelfCode(e.target.value)}
                        placeholder="e.g. RAK-A-01"
                        className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                        Category / Location
                      </label>
                      <input
                        type="text"
                        value={shelfDesc}
                        onChange={(e) => setShelfDesc(e.target.value)}
                        placeholder="e.g. Artificial Intelligence"
                        className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {mode === 'wifi' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                        Wi-Fi SSID
                      </label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                        Password
                      </label>
                      <input
                        type="text"
                        value={wifiPass}
                        onChange={(e) => setWifiPass(e.target.value)}
                        className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {mode === 'custom' && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Custom Text or URL
                  </label>
                  <textarea
                    rows={3}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Enter any text, deep link, or URL..."
                    className="w-full bg-input border border-border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Styling & Fine-tuning */}
          <Card className="rounded-2xl border-border shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">2. Visual Design &amp; Export Parameters</CardTitle>
              <CardDescription className="text-xs">
                Fine-tune colors, size, error correction, and library logo stamp in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    QR Foreground Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrFgColor}
                      onChange={(e) => setQrFgColor(e.target.value)}
                      className="size-9 rounded-lg border border-border cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={qrFgColor}
                      onChange={(e) => setQrFgColor(e.target.value)}
                      className="flex-1 bg-input border border-border rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    QR Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="size-9 rounded-lg border border-border cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="flex-1 bg-input border border-border rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Render Size ({qrSize}px)
                  </label>
                  <input
                    type="range"
                    min="140"
                    max="480"
                    step="20"
                    value={qrSize}
                    onChange={(e) => setQrSize(Number(e.target.value))}
                    className="w-full cursor-pointer accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Error Correction
                  </label>
                  <select
                    value={errorLevel}
                    onChange={(e) => setErrorLevel(e.target.value as any)}
                    className="w-full bg-input border border-border rounded-lg p-2 text-xs font-medium"
                  >
                    <option value="L">L (Low - 7%)</option>
                    <option value="M">M (Medium - 15%)</option>
                    <option value="Q">Q (Quartile - 25%)</option>
                    <option value="H">H (High - 30% / With Logo)</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={includeLogo}
                      onChange={(e) => setIncludeLogo(e.target.checked)}
                      className="size-4 rounded text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-medium text-foreground">
                      Include Center Stamp
                    </span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Live Interactive Card Preview */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-2xl border-border shadow-md bg-card overflow-hidden sticky top-24">
            <CardHeader className="border-b border-border/60 pb-3 bg-muted/40 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Eye className="size-4 text-primary" />
                  Live Preview
                </CardTitle>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Payload: {qrPayload}
                </span>
              </div>
              <span className="badge text-xs bg-primary/10 text-primary font-semibold">
                Client-Side JS
              </span>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              {/* Styled Stamp Preview Container */}
              <div
                className="p-6 rounded-2xl border-2 border-border/80 shadow-lg flex flex-col items-center justify-center transition-all bg-white"
                style={{ backgroundColor: qrBgColor }}
              >
                <div className="relative">
                  <QRCodeSVG
                    id="qr-svg-preview"
                    value={qrPayload}
                    size={Math.min(qrSize, 260)}
                    fgColor={qrFgColor}
                    bgColor={qrBgColor}
                    level={errorLevel}
                    marginSize={2}
                    imageSettings={
                      includeLogo
                        ? {
                            src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%232563EB"/><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="40" fill="white">P</text></svg>',
                            height: 48,
                            width: 48,
                            excavate: true,
                          }
                        : undefined
                    }
                  />
                </div>

                {/* Caption Footer */}
                <div className="mt-4 text-center max-w-[260px]">
                  <div
                    className="font-bold text-sm leading-tight truncate"
                    style={{ color: qrFgColor }}
                  >
                    {previewTitle}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {previewSubtitle}
                  </div>
                </div>
              </div>

              {/* Hidden Canvas for High-Res PNG Exports */}
              <div className="hidden">
                <QRCodeCanvas
                  id="qr-canvas-download"
                  ref={canvasRef}
                  value={qrPayload}
                  size={qrSize * 2}
                  fgColor={qrFgColor}
                  bgColor={qrBgColor}
                  level={errorLevel}
                  marginSize={3}
                  imageSettings={
                    includeLogo
                      ? {
                          src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%232563EB"/><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="40" fill="white">P</text></svg>',
                          height: 80,
                          width: 80,
                          excavate: true,
                        }
                      : undefined
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 w-full mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-1.5 text-xs rounded-xl"
                >
                  {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSvg}
                  className="gap-1.5 text-xs rounded-xl"
                >
                  <Download className="size-3.5" />
                  SVG
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleDownloadPng}
                  className="gap-1.5 text-xs rounded-xl font-semibold"
                >
                  <Download className="size-3.5" />
                  PNG (Hi-Res)
                </Button>
              </div>

              <div className="w-full mt-3 p-2.5 rounded-xl bg-muted/60 border border-border/50 text-left text-[11px] text-muted-foreground">
                <strong>Tip for Librarians:</strong> Print labels on standard 40x40mm adhesive sticker sheets for quick spine tagging.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
