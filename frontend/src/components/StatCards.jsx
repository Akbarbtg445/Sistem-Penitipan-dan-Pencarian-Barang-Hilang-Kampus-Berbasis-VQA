import { Package, CheckCircle2, Clock } from "lucide-react";
import { useReports } from "../context/ReportsContext";

export default function StatCards() {
  const { reports } = useReports();

  const foundItems = reports.filter((r) => r.type === "found");

  const menungguCount = foundItems.filter((r) => {
    const st = String(r.status || "").toUpperCase();
    return st !== "DIAMBIL" && st !== "SELESAI" && st !== "DIKEMBALIKAN";
  }).length;

  const dikembalikanCount = foundItems.filter((r) => {
    const st = String(r.status || "").toUpperCase();
    return st === "DIAMBIL" || st === "SELESAI" || st === "DIKEMBALIKAN";
  }).length;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  const hariIniCount = foundItems.filter((r) => r.date === todayStr).length;

  const stats = [
    {
      label: "Menunggu Pengambilan",
      value: `${menungguCount} Barang`,
      icon: Package,
      tone: "orange",
    },
    {
      label: "Berhasil Dikembalikan",
      value: `${dikembalikanCount} Barang`,
      icon: CheckCircle2,
      tone: "green",
    },
    {
      label: "Laporan Baru Hari Ini",
      value: `${hariIniCount} Temuan`,
      icon: Clock,
      tone: "blue",
    },
  ];

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