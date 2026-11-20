import { Link, NavLink } from "react-router-dom";
import { ChevronDown, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const menus = [
  { label: "Beranda", to: "/" },
  { label: "Daftar Temuan", to: "/daftar-temuan" },
  { label: "Lapor Barang", to: "/lapor" },
  { label: "Riwayat Laporan", to: "/riwayat" },
  { label: "Cari dengan AI", to: "/vqa" },
];

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <div className="logo">UMY</div>
          <div className="brand-text">
            <div className="brand-title">Barang Hilang</div>
            <div className="brand-sub">KAMPUS TERPADU YOGYAKARTA</div>
          </div>
        </Link>

        <nav className="menu">
          {menus.map((m) => (
            <NavLink
              key={m.label}
              to={m.to}
              end={m.to === "/"}
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              {m.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-right">
          <NotificationBell />

          <Link to="/profil" className="profile">
            <div className="avatar">{user?.short?.[0] || "U"}</div>
            <div className="profile-text">
              <strong>{user?.short || "Pengguna"}</strong>
              <span>Mahasiswa UMY</span>
            </div>
            <ChevronDown size={14} className="profile-chevron" />
          </Link>

          <Link to="/lapor" className="btn-primary hide-mobile">
            <Plus size={16} /> Buat Laporan
          </Link>
        </div>
      </div>
    </header>
  );
}