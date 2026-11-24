import { createContext, useContext, useState } from "react";

// TODO: ganti dengan data dari backend (GET /api/notifikasi)
const initial = [
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