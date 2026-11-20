import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScanSearch, Upload, Send, Sparkles, Loader2, ShieldCheck } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Vqa() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [result, setResult] = useState(null);
  const [matches, setMatches] = useState([]);
  const [messages, setMessages] = useState([
    { from: "ai", text: "Unggah foto barang, lalu tanyakan apa saja tentang barang itu." },
  ]);
  const [q, setQ] = useState("");

  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const pick = (e) => {
    setFile(e.target.files[0] || null);
    setResult(null);
    setMatches([]);
  };

  const analyze = async () => {
    if (!file) return;
    try {
      setLoading(true);
      const imageBase64 = await fileToBase64(file);

      const res = await fetch(`${API_URL}/api/vqa/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menganalisis gambar");

      setResult(json.result);
      setMatches(json.matches || []);
    } catch (err) {
      alert("Error VQA: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const ask = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    if (!file) {
      alert("Silakan unggah foto barang terlebih dahulu.");
      return;
    }

    const question = q;
    setMessages((m) => [...m, { from: "me", text: question }]);
    setQ("");

    try {
      setAsking(true);
      const imageBase64 = await fileToBase64(file);

      const res = await fetch(`${API_URL}/api/vqa/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, question }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal mendapatkan jawaban AI");

      setMessages((m) => [...m, { from: "ai", text: json.answer }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { from: "ai", text: `Maaf, gagal memproses pertanyaan: ${err.message}` },
      ]);
    } finally {
      setAsking(false);
    }
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
                {(result.teks || []).map((t, idx) => <span key={idx}>{t}</span>)}
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
            {asking && <div className="bubble ai">Sedang menganalisis foto...</div>}
          </div>
          <form className="chat-input" onSubmit={ask}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tanyakan sesuatu tentang barang ini..."
              disabled={asking}
            />
            <button type="submit" aria-label="Kirim" disabled={asking}><Send size={16} /></button>
          </form>
        </section>
      </div>

      {result && (
        <section className="vqa-matches">
          <h2>Hasil Pencocokan Inventaris Kampus</h2>
          <p className="muted small">
            {matches.length > 0
              ? `Ditemukan ${matches.length} barang di database yang mirip secara visual dan teks.`
              : "Belum ada barang temuan di database yang cocok dengan ciri foto ini."}
          </p>
          <div className="grid grid-2">
            {matches.map((m) => (
              <article key={m.id} className="fcard match">
                <span className="rep-status green">Kemiripan {m.score}%</span>
                <h3>{m.title}</h3>
                <p className="muted small">{m.place}</p>
                <button
                  className="btn-primary btn-sm"
                  onClick={() => navigate("/daftar-temuan")}
                >
                  Lihat &amp; Ajukan Klaim
                </button>
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