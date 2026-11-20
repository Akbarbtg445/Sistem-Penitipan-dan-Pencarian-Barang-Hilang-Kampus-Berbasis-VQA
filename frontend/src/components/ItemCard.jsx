import { useState } from "react";
import { MapPin, Building2, Clock, Package, X, Send, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ItemCard({ item }) {
  const { user } = useAuth();
  const [openClaim, setOpenClaim] = useState(false);
  const [bukti, setBukti] = useState("");
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const handleClaim = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/api/klaim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_temuan: item.id,
          email_pengklaim: user?.email || "anonim@umy.ac.id",
          nama_pengklaim: user?.name || "Mahasiswa UMY",
          bukti_kepemilikan: bukti,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal mengajukan klaim");

      setClaimed(true);
    } catch (err) {
      alert("Gagal Klaim: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <article className="card">
        <div className="card-media">
          {item.image ? (
            <img src={item.image} alt={item.title} />
          ) : (
            <div className="card-placeholder">
              <Package size={40} />
            </div>
          )}
          <span className="tag tag-yellow">Menunggu Pengambilan</span>
          <span className="tag tag-green">Terverifikasi Satpam</span>
        </div>

        <div className="card-body">
          <div className="card-cat">{item.category}</div>
          <h3 className="card-title">{item.title}</h3>
          <p className="card-desc">{item.description}</p>

          <div className="card-info">
            <div>
              <MapPin size={13} /> Ditemukan di: <strong>{item.foundAt}</strong>
            </div>
            <div>
              <Building2 size={13} /> Diambil di: <strong>{item.pickupAt}</strong>
            </div>
          </div>

          <div className="card-foot">
            <span className="muted small">
              <Clock size={12} /> {item.time}
            </span>
            <button
              className="btn-primary btn-sm"
              onClick={() => {
                setClaimed(false);
                setBukti("");
                setOpenClaim(true);
              }}
            >
              Klaim Barang
            </button>
          </div>
        </div>
      </article>

      {openClaim && (
        <div className="modal-overlay" onClick={() => !loading && setOpenClaim(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {claimed ? (
              <div className="modal-done">
                <CheckCircle2 size={54} />
                <h3>Pengajuan Klaim Terkirim</h3>
                <p>
                  Bukti kepemilikan untuk <strong>{item.title}</strong> telah
                  dicatat. Silakan bawa KTM asli ke <strong>{item.pickupAt}</strong>{" "}
                  untuk verifikasi petugas.
                </p>
                <button className="btn-primary" onClick={() => setOpenClaim(false)}>
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleClaim}>
                <div className="modal-head">
                  <div>
                    <span className="modal-eyebrow">VERIFIKASI KEPEMILIKAN</span>
                    <h3>Klaim: {item.title}</h3>
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setOpenClaim(false)}
                    aria-label="Tutup"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="modal-body">
                  <p className="muted small" style={{ marginBottom: 12 }}>
                    Sebutkan ciri khusus tersembunyi, isi di dalam barang, atau bukti
                    kepemilikan yang hanya diketahui oleh pemilik asli.
                  </p>
                  <label className="flabel">
                    Bukti / Ciri Kepemilikan <span className="req">*</span>
                  </label>
                  <textarea
                    className="finput-solo"
                    rows={4}
                    required
                    minLength={10}
                    value={bukti}
                    onChange={(e) => setBukti(e.target.value)}
                    placeholder="Contoh: Di dalam dompet terdapat KTM atas nama saya (NIM 2024...) dan stiker kecil di bagian dalam."
                  />
                </div>

                <div className="modal-foot">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setOpenClaim(false)}
                    disabled={loading}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn-save" disabled={loading}>
                    <Send size={15} /> {loading ? "Mengirim..." : "Ajukan Klaim"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}