import { useMemo, useState } from "react";
import { ScanSearch, Upload, Send, Sparkles, Loader2, ShieldCheck } from "lucide-react";

const mockResult = {
  kategori: "Botol & Tumbler Minum",
  warna: "Hijau Forest / Dark Green",
  bahan: "Stainless Steel (Doff)",
  teks: ["OXFORD", "TEKNIK INFORMATIKA", "PTI UMY 2023"],
};

const mockMatches = [
  { id: 1, title: "Tumbler Stainless Hijau Forest Oxford 750ml", place: "Pos Satpam Perpustakaan Pusat", score: 94 },
  { id: 2, title: "Tumbler Hijau Polos (Tanpa Merek Jelas)", place: "Pos Satpam Gedung AR Fachruddin", score: 68 },
];

export default function Vqa() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [messages, setMessages] = useState([
    { from: "ai", text: "Unggah foto barang, lalu tanyakan apa saja tentang barang itu." },
  ]);
  const [q, setQ] = useState("");

  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const pick = (e) => {
    setFile(e.target.files[0] || null);
    setResult(null);
  };

  const analyze = () => {
    setLoading(true);
    // TODO: kirim file ke vqa_service (POST /analyze) lalu setResult(hasil)
    setTimeout(() => {
      setResult(mockResult);
      setLoading(false);
    }, 1200);
  };

  const ask = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    const question = q;
    setMessages((m) => [...m, { from: "me", text: question }]);
    setQ("");
    // TODO: kirim pertanyaan + foto ke vqa_service (POST /ask)
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { from: "ai", text: "(Demo) Berdasarkan foto, barang ini tumbler hijau dengan tulisan OXFORD. Jawaban asli akan datang dari layanan VQA." },
      ]);
    }, 700);
  };

  return (
    <main className="page">
      <div className="page-head">
        <span className="eyebrow">VISION &amp; MULTIMODAL VQA</span>
        <h1>Pencarian Barang Cerdas dengan VQA &amp; Scan Gambar</h1>
        <p className="muted">
          Unggah foto barang yang hilang. AI membaca ciri fisik, mengidentifikasi
          teks, dan mencocokkannya dengan inventaris pos keamanan kampus.
        </p>
      </div>

      <div className="vqa-grid">
        {/* Kiri: foto & hasil ekstraksi */}
        <section className="fcard">
          <div className="side-card-title"><ScanSearch size={15} /> Analisis Citra</div>

          <div className="vqa-view">
            {url ? (
              <img src={url} alt="Foto barang" />
            ) : (
              <label className="vqa-empty">
                <Upload size={28} />
                <strong>Unggah foto barang</strong>
                <span>PNG, JPG, atau WEBP</span>
                <input type="file" accept="image/*" hidden onChange={pick} />
              </label>
            )}
          </div>

          <div className="vqa-actions">
            <label className="btn-outline">
              <Upload size={14} /> {file ? "Ganti Foto" : "Pilih Foto"}
              <input type="file" accept="image/*" hidden onChange={pick} />
            </label>
            <button className="btn-primary" disabled={!file || loading} onClick={analyze}>
              {loading ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}
              {loading ? "Menganalisis..." : "Analisis Foto"}
            </button>
          </div>

          {result && (
            <div className="vqa-result">
              <h4>Hasil Ekstraksi OCR &amp; Atribut</h4>
              <dl>
                <div><dt>Kategori</dt><dd>{result.kategori}</dd></div>
                <div><dt>Warna</dt><dd>{result.warna}</dd></div>
                <div><dt>Bahan</dt><dd>{result.bahan}</dd></div>
              </dl>
              <div className="vqa-tags">
                {result.teks.map((t) => <span key={t}>{t}</span>)}
              </div>
            </div>
          )}
        </section>

        {/* Kanan: tanya jawab */}
        <section className="fcard vqa-chat">
          <div className="side-card-title"><Sparkles size={15} /> Tanya Jawab AI Visual (VQA)</div>
          <div className="chat-box">
            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.from}`}>{m.text}</div>
            ))}
          </div>
          <form className="chat-input" onSubmit={ask}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tanyakan sesuatu tentang barang ini..."
            />
            <button type="submit" aria-label="Kirim"><Send size={16} /></button>
          </form>
        </section>
      </div>

      {result && (
        <section className="vqa-matches">
          <h2>Hasil Pencocokan Inventaris Kampus</h2>
          <p className="muted small">Ditemukan {mockMatches.length} barang yang mirip secara visual dan teks.</p>
          <div className="grid grid-2">
            {mockMatches.map((m) => (
              <article key={m.id} className="fcard match">
                <span className="rep-status green">Kemiripan {m.score}%</span>
                <h3>{m.title}</h3>
                <p className="muted small">{m.place}</p>
                <button className="btn-primary btn-sm">Ajukan Klaim Verifikasi</button>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="privacy">
        <ShieldCheck size={18} />
        <div>
          <strong>Amanah &amp; Perlindungan Privasi</strong>
          <p>Foto yang kamu unggah hanya diproses untuk pencocokan barang dan tidak dibagikan ke pihak lain.</p>
        </div>
      </div>
    </main>
  );
}