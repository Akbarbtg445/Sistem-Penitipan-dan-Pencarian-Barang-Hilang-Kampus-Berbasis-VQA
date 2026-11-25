import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  FileText,
  Search,
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  Tag,
  Palette,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useReports } from "../context/ReportsContext";

const tabs = [
  { id: "all", label: "Semua Aktivitas" },
  { id: "lost", label: "Saya Melapor Kehilangan" },
  { id: "found", label: "Saya Menemukan & Menyerahkan" },
];

export default function History() {
  const { reports, fetchReports } = useReports();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const targetId = searchParams.get("id");

  useEffect(() => {
    if (!targetId) return;

    // 1. Cari data lengkap dari ReportsContext
    if (reports.length > 0) {
      const found = reports.find((r) => String(r.id) === String(targetId));
      if (found) {
        setSelectedReport(found);
        return;
      }
    }

    // 2. Fallback langsung dari state Vqa.jsx sementara reports masih loading
    const stateItem = location.state?.selectedItem;
    if (stateItem && String(stateItem.id) === String(targetId)) {
      setSelectedReport({
        id: stateItem.id,
        type: stateItem.type || "lost",
        title: stateItem.title || "Barang Hilang",
        category: (stateItem.category || "LAINNYA").toUpperCase(),
        color: stateItem.color || "-",
        place: stateItem.place || "-",
        date: stateItem.date || "-",
        time: "-",
        image: stateItem.image || "",
        description: stateItem.description || "-",
        status: stateItem.type === "lost" ? "MENCARI" : "TERVERIFIKASI",
        tone: stateItem.type === "lost" ? "yellow" : "green",
      });
    }
  }, [targetId, reports, location.state]);

  const openModal = (report) => {
    setSelectedReport(report);
    setSearchParams({ id: report.id });
  };

  const closeModal = () => {
    setSelectedReport(null);
    if (searchParams.has("id")) {
      setSearchParams({});
    }
  };

  const handleMarkCompleted = async (report) => {
    if (updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const nextStatus = report.type === "lost" ? "DITEMUKAN" : "DIAMBIL";
      const res = await fetch(`/api/laporan/${report.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: report.type, status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal memperbarui status");
      await fetchReports();
      closeModal();
    } catch (err) {
      alert(err.message || "Terjadi kesalahan saat memperbarui status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const list = reports.filter((r) => tab === "all" || r.type === tab);
  const count = (id) => reports.filter((r) => id === "all" || r.type === id).length;

  const stats = [
    { label: "Total Laporan Saya", value: reports.length, icon: FileText },
    { label: "Barang Hilang Dilaporkan", value: count("lost"), icon: Search },
    { label: "Temuan Diserahkan", value: count("found"), icon: CheckCircle2 },
  ];

  return (
    <main className="page">
      <div className="page-head">
        <span className="eyebrow">DASHBOARD MAHASISWA</span>
        <h1>Riwayat Pelaporan Saya</h1>
      </div>

      <div className="hist-stats">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="stat">
            <div className="stat-icon green"><Icon size={18} /></div>
            <div>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value} Laporan</div>
            </div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
            {t.label} ({count(t.id)})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <h3>Belum Ada Riwayat Pelaporan</h3>
          <p>Buat laporan pertamamu untuk mulai melacak barang.</p>
          <Link to="/lapor" className="btn-primary" style={{ marginTop: 12 }}>Buat Laporan</Link>
        </div>
      ) : (
        <div className="hist-list">
          {list.map((r) => (
            <article
              key={r.id}
              className="hist-item"
              onClick={() => openModal(r)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openModal(r);
              }}
              style={{ cursor: "pointer", transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
            >
              <div className="hist-top">
                <span className={`rep-status ${r.tone}`}>{r.status}</span>
                <span className="muted small">{r.id}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <h3>{r.title}</h3>
                  <div className="hist-meta">
                    <span><MapPin size={12} /> {r.place}</span>
                    <span>{r.type === "lost" ? "Laporan Kehilangan" : "Laporan Temuan"}</span>
                    <span>{r.date}</span>
                  </div>
                </div>
                <span
                  className="muted small"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", whiteSpace: "nowrap" }}
                >
                  Lihat Detail <ChevronRight size={15} />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedReport && (
        <div
          onClick={closeModal}
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
                <span className={`rep-status ${selectedReport.tone}`}>{selectedReport.status}</span>
                <h2 style={{ marginTop: "0.5rem", marginBottom: "0.2rem", fontSize: "1.3rem" }}>
                  {selectedReport.title}
                </h2>
                <p className="muted small" style={{ margin: 0 }}>
                  ID Laporan: {selectedReport.id}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
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

            {selectedReport.image && (
              <div style={{ marginTop: "1rem", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                <img
                  src={selectedReport.image}
                  alt={selectedReport.title}
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
                <strong>{selectedReport.category || "-"}</strong>
              </div>

              <div>
                <div className="muted small" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Palette size={13} /> Warna Barang
                </div>
                <strong>{selectedReport.color || "-"}</strong>
              </div>

              <div>
                <div className="muted small" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <MapPin size={13} /> {selectedReport.type === "lost" ? "Lokasi Terakhir Hilang" : "Lokasi Ditemukan"}
                </div>
                <strong>{selectedReport.place || "-"}</strong>
              </div>

              <div>
                <div className="muted small" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Calendar size={13} /> Tanggal {selectedReport.type === "lost" ? "Hilang" : "Ditemukan"}
                </div>
                <strong>{selectedReport.date || "-"}</strong>
              </div>

              {selectedReport.time && selectedReport.time !== "-" && (
                <div>
                  <div className="muted small" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Clock size={13} /> Perkiraan Waktu
                  </div>
                  <strong>{selectedReport.time} WIB</strong>
                </div>
              )}

              {selectedReport.type !== "lost" && selectedReport.pickupAt && (
                <div>
                  <div className="muted small">Pos Penyimpanan</div>
                  <strong>{selectedReport.pickupAt}</strong>
                </div>
              )}
            </div>

            <div style={{ marginTop: "1rem" }}>
              <div className="muted small" style={{ marginBottom: "0.3rem" }}>
                Deskripsi & Ciri Khusus Barang
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
                {selectedReport.description || "Tidak ada deskripsi tambahan."}
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
                onClick={closeModal}
              >
                Tutup
              </button>

              {String(selectedReport.status || "").toUpperCase() !== "DIAMBIL" &&
                String(selectedReport.status || "").toUpperCase() !== "DITEMUKAN" && (
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={updatingStatus}
                    onClick={() => handleMarkCompleted(selectedReport)}
                    style={{ backgroundColor: "#15803d" }}
                  >
                    <CheckCircle2 size={15} />{" "}
                    {updatingStatus
                      ? "Menyimpan..."
                      : selectedReport.type === "lost"
                      ? "Barang Sudah Ditemukan"
                      : "Tandai Sudah Dikembalikan"}
                  </button>
                )}

              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  closeModal();
                  navigate("/vqa");
                }}
              >
                <Sparkles size={15} /> Cek Kecocokan di VQA
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}