import { NavLink, Link } from "react-router-dom";
import { Home, List, History, Sparkles, Plus } from "lucide-react";

const tabs = [
  { label: "Beranda", icon: Home, to: "/" },
  { label: "Temuan", icon: List, to: "/daftar-temuan" },
  { label: "Riwayat", icon: History, to: "/riwayat" },
  { label: "Cari AI", icon: Sparkles, to: "/vqa" },
];

export default function BottomNav() {
  return (
    <>
      <Link to="/lapor" className="fab" aria-label="Buat Laporan">
        <Plus size={24} />
      </Link>
      <nav className="bottom-nav">
        {tabs.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/"}
            className={({ isActive }) => (isActive ? "bn-item active" : "bn-item")}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}