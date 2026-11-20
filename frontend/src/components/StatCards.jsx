import { Package, CheckCircle2, Clock } from "lucide-react";

const stats = [
  { label: "Menunggu Pengambilan", value: "12 Barang", icon: Package, tone: "orange" },
  { label: "Berhasil Dikembalikan", value: "48 Barang", icon: CheckCircle2, tone: "green" },
  { label: "Laporan Baru Hari Ini", value: "3 Temuan", icon: Clock, tone: "blue" },
];

export default function StatCards() {
  return (
    <div className="stats">
      {stats.map(({ label, value, icon: Icon, tone }) => (
        <div key={label} className="stat">
          <div className={`stat-icon ${tone}`}>
            <Icon size={18} />
          </div>
          <div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}