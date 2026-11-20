import { Link } from "react-router-dom";
import {
  LayoutGrid,
  History,
  GlassWater,
  Laptop,
  Wallet,
  KeyRound,
} from "lucide-react";

// "match" = nilai field category pada data barang (src/data/items.js)
export const categoryChips = [
  { id: "all", label: "Semua Kategori", icon: LayoutGrid, match: null },
  { id: "bottle", label: "Botol & Tumbler", icon: GlassWater, match: ["BOTOL & TUMBLER"] },
  { id: "elec", label: "Elektronik & Gadget", icon: Laptop, match: ["ELEKTRONIK & ALAT UJIAN"] },
  { id: "wallet", label: "Dompet & Kartu KTM", icon: Wallet, match: ["DOMPET & IDENTITAS"] },
  { id: "key", label: "Kunci & Kendaraan", icon: KeyRound, match: ["KUNCI & KENDARAAN"] },
];

export default function CategoryChips({ active, onChange, historyCount = 0 }) {
  return (
    <div className="chips">
      {categoryChips.slice(0, 1).map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`chip ${active === id ? "chip-active" : ""}`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}

      <Link to="/riwayat" className="chip chip-outline">
        <History size={14} />
        Riwayat Laporan Saya
        {historyCount > 0 && <span className="chip-badge">{historyCount}</span>}
      </Link>

      {categoryChips.slice(1).map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`chip ${active === id ? "chip-active" : ""}`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}