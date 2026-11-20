import { createContext, useContext, useState } from "react";

// TODO: ganti dengan data dari backend (GET /api/notifikasi)
const initial = [
  {
    id: 1,
    title: "Kemungkinan barang Anda ditemukan",
    body: "Tumbler Stainless Hijau terdaftar di Perpus Pusat.",
    time: "Baru saja",
    to: "/daftar-temuan",
    read: false,
  },
  {
    id: 2,
    title: "Laporan kehilangan diterima",
    body: "Laporan Laptop Asus Zenbook 14 OLED sudah masuk radar petugas.",
    time: "2 jam lalu",
    to: "/riwayat",
    read: false,
  },
  {
    id: 3,
    title: "Klaim disetujui",
    body: "Ambil barangmu di Pos Satpam AR Fachruddin A dengan membawa KTM asli.",
    time: "Kemarin",
    to: "/riwayat",
    read: true,
  },
];

const NotifContext = createContext(null);

export function NotifProvider({ children }) {
  const [notifs, setNotifs] = useState(initial);

  const unread = notifs.filter((n) => !n.read).length;
  const markRead = (id) =>
    setNotifs((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = () =>
    setNotifs((l) => l.map((n) => ({ ...n, read: true })));
  const remove = (id) => setNotifs((l) => l.filter((n) => n.id !== id));
  const clearAll = () => setNotifs([]);

  return (
    <NotifContext.Provider
      value={{ notifs, unread, markRead, markAllRead, remove, clearAll }}
    >
      {children}
    </NotifContext.Provider>
  );
}

export const useNotif = () => useContext(NotifContext);