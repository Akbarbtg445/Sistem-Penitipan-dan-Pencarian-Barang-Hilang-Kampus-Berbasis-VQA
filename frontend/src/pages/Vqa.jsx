import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ScanSearch,
  Upload,
  Send,
  Sparkles,
  Loader2,
  ShieldCheck,
  MapPin,
  Calendar,
  Tag,
  Palette,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

function fileToBase64(file, maxSize = 1024, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Vqa() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("all"); // "all" | "lost_user" | "found_user"
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [result, setResult] = useState(null);
  const [matches, setMatches] = useState([]);
  const [lostMatches, setLostMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([
    { from: "ai", text: "Unggah foto barang, lalu tanyakan apa saja tentang barang itu." },
  ]);
  const [q, setQ] = useState("");

  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const pick = (e) => {
    setFile(e.target.files[0] || null);
    setResult(null);
    setMatches([]);
    setLostMatches([]);
    setSelectedMatch(null);
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
      setLostMatches(json.lostMatches || []);
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

  const displayedMatches = useMemo(() => {
    if (mode === "lost_user") return matches;
    if (mode === "found_user") return lostMatches;
    return [...matches, ...lostMatches].sort((a, b) => b.score - a.score);
  }, [mode, matches, lostMatches]);

  return (
    <main className="page">
      <div className="page-head">
        <span className="eyebrow">VISION &amp; MULTIMODAL VQA</span>
        <h1>Pencarian Barang Cerdas dengan VQA &amp; Scan Gambar</h1>
        <p className="muted">
          Unggah foto barang. AI membaca ciri fisik, mengidentifikasi teks, dan
          mencocokkannya dengan inventaris barang temuan maupun laporan kehilangan kampus.
        </p>

        <div className="tabs" style={{ marginTop: "1rem" }}>
          <button
            type="button"
            className={`tab ${mode === "all" ? "on" : ""}`}
            onClick={() => setMode("all")}
          >
            Semua Kecocokan
          </button>
          <button
            type="button"
            className={`tab ${mode === "lost_user" ? "on" : ""}`}
            onClick={() => setMode("lost_user")}
          >
            Saya Kehilangan Barang (Cari di Temuan)
          </button>
          <button
            type="button"
            className={`tab ${mode === "found_user" ? "on" : ""}`}
            onClick={() => setMode("found_user")}
          >
            Saya Menemukan Barang (Cari di Kehilangan)
          </button>
        </div>
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
          <h2>Hasil Pencocokan Inventaris &amp; Laporan Kampus</h2>
          <p className="muted small">
            {displayedMatches.length > 0
              ? `Ditemukan ${displayedMatches.length} data yang cocok secara visual dan teks.`
              : "Belum ada data di database yang cocok dengan ciri foto ini."}
          </p>
          <div className="grid grid-2">
            {displayedMatches.map((m) => (
              <article
                key={`${m.type}-${m.id}`}
                className="fcard match"
                onClick={() => setSelectedMatch(m)}
                style={{ cursor: "pointer", transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedMatch(m);
                  }
                }}
              >
                <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                  <span className="rep-status green">Kemiripan {m.score}%</span>
                  <span className={`rep-status ${m.type === "lost" ? "yellow" : "green"}`}>
                    {m.type === "lost" ? "Laporan Kehilangan (Mencari)" : "Barang Temuan"}
                  </span>
                </div>
                <h3>{m.title}</h3>
                {m.description && m.description !== "-" && (
                  <p className="muted small">{m.description}</p>
                )}
                <p className="muted small" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <MapPin size={13} /> {m.place}
                  {m.date && m.date !== "-" ? (
                    <>
                      <span>•</span>
                      <Calendar size={13} /> {m.date}
                    </>
                  ) : null}
                </p>
                <button
                  type="button"
                  className={m.type === "lost" ? "btn-outline btn-sm" : "btn-primary btn-sm"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMatch(m);
                  }}
                >
                  Lihat Detail Barang
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Modal Detail Langsung di Halaman VQA (Tanpa Pindah Halaman) */}
      {selectedMatch && (
        <div
          onClick={() => setSelectedMatch(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.5rem",
              boxShadow: "0 20px 45px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                  <span className={`rep-status ${selectedMatch.type === "lost" ? "yellow" : "green"}`}>
                    {selectedMatch.type === "lost" ? "MENCARI" : "BARANG TEMUAN"}
                  </span>
                  <span className="rep-status green">Kemiripan {selectedMatch.score}%</span>
                </div>
                <h2 style={{ marginTop: "0.5rem", marginBottom: "0.2rem", fontSize: "1.3rem" }}>
                  {selectedMatch.title}
                </h2>
                <p className="muted small" style={{ margin: 0 }}>
                  ID Laporan: {selectedMatch.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMatch(null)}
                aria-label="Tutup detail"
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  borderRadius: "999px",
                  width: "34px",
                  height: "34px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {selectedMatch.image && (
              <div style={{ marginTop: "1rem", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                <img
                  src={selectedMatch.image}
                  alt={selectedMatch.title}
                  style={{ width: "100%", maxHeight: "260px", objectFit: "cover", display: "block" }}
                />
              </div>
            )}

            <div
              style={{
                marginTop: "1rem",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "0.75rem",
                padding: "0.9rem",
                backgroundColor: "#f8fafc",
                borderRadius: "12px",
                fontSize: "0.9rem",
              }}
            >
              <div>
                <div className="muted small" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Tag size={13} /> Kategori
                </div>
                <strong>{String(selectedMatch.category || "-").toUpperCase()}</strong>
              </div>

              {selectedMatch.color && (
                <div>
                  <div className="muted small" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Palette size={13} /> Warna Barang
                  </div>
                  <strong>{selectedMatch.color}</strong>
                </div>
              )}

              <div>
                <div className="muted small" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <MapPin size={13} /> {selectedMatch.type === "lost" ? "Lokasi Terakhir Hilang" : "Lokasi / Pos Simpan"}
                </div>
                <strong>{selectedMatch.place || "-"}</strong>
              </div>

              <div>
                <div className="muted small" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Calendar size={13} /> Tanggal {selectedMatch.type === "lost" ? "Hilang" : "Ditemukan"}
                </div>
                <strong>{selectedMatch.date || "-"}</strong>
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <div className="muted small" style={{ marginBottom: "0.3rem" }}>
                Deskripsi &amp; Ciri Khusus Barang
              </div>
              <div
                style={{
                  padding: "0.85rem",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedMatch.description || "Tidak ada deskripsi tambahan."}
              </div>
            </div>

            <div
              style={{
                marginTop: "1.25rem",
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.65rem",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="btn-outline"
                onClick={() => setSelectedMatch(null)}
              >
                Tutup
              </button>

              {selectedMatch.type === "found" && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setSelectedMatch(null);
                    navigate("/daftar-temuan");
                  }}
                >
                  Lanjut Ajukan Klaim
                </button>
              )}
            </div>
          </div>
        </div>
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