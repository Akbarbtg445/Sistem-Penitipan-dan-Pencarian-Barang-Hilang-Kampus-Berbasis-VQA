import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Search, CheckCircle2, MapPin } from "lucide-react";
import { useReports } from "../context/ReportsContext";

const tabs = [
  { id: "all", label: "Semua Aktivitas" },
  { id: "lost", label: "Saya Melapor Kehilangan" },
  { id: "found", label: "Saya Menemukan & Menyerahkan" },
];

export default function History() {
  const { reports } = useReports();
  const [tab, setTab] = useState("all");

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
            <article key={r.id} className="hist-item">
              <div className="hist-top">
                <span className={`rep-status ${r.tone}`}>{r.status}</span>
                <span className="muted small">{r.id}</span>
              </div>
              <h3>{r.title}</h3>
              <div className="hist-meta">
                <span><MapPin size={12} /> {r.place}</span>
                <span>{r.type === "lost" ? "Laporan Kehilangan" : "Laporan Temuan"}</span>
                <span>{r.date}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}