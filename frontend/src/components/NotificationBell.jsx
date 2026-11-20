import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellRing, BellOff, X, CheckCheck } from "lucide-react";
import { useNotif } from "../context/NotifContext";

export default function NotificationBell() {
  const { notifs, unread, markRead, markAllRead, remove, clearAll } = useNotif();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  // Banner "heads-up" seperti notifikasi HP: muncul sebentar setelah masuk
  useEffect(() => {
    const first = notifs.find((n) => !n.read);
    if (!first) return;
    const show = setTimeout(() => setToast(first), 1200);
    const hide = setTimeout(() => setToast(null), 6500);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tutup panel kalau klik di luar atau tekan Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openNotif = (n) => {
    markRead(n.id);
    setOpen(false);
    setToast(null);
    navigate(n.to);
  };

  const toggle = () => {
    setOpen((o) => !o);
    setToast(null);
  };

  return (
    <div className="notif-wrap" ref={wrapRef}>
      <button
        className={`icon-btn ${open ? "icon-btn-on" : ""}`}
        aria-label="Notifikasi"
        aria-expanded={open}
        onClick={toggle}
      >
        <Bell size={18} />
        {unread > 0 && <span className="notif">{unread}</span>}
      </button>

      {open && (
        <div className="notif-panel" role="dialog" aria-label="Notifikasi">
          <div className="notif-panel-head">
            <strong>Notifikasi</strong>
            {notifs.length > 0 && (
              <div className="notif-head-actions">
                {unread > 0 && (
                  <button onClick={markAllRead}>
                    <CheckCheck size={13} /> Tandai dibaca
                  </button>
                )}
                <button onClick={clearAll}>Hapus semua</button>
              </div>
            )}
          </div>

          {notifs.length === 0 ? (
            <div className="notif-empty">
              <BellOff size={28} />
              <p>Belum ada notifikasi</p>
            </div>
          ) : (
            <ul className="notif-list">
              {notifs.map((n) => (
                <li key={n.id} className={`notif-card ${n.read ? "" : "unread"}`}>
                  <button className="notif-main" onClick={() => openNotif(n)}>
                    <span className="notif-app-icon">
                      <BellRing size={14} />
                    </span>
                    <span className="notif-text">
                      <span className="notif-meta">Barang Hilang · {n.time}</span>
                      <strong>{n.title}</strong>
                      <span className="notif-body">{n.body}</span>
                    </span>
                  </button>
                  <button
                    className="notif-x"
                    aria-label="Hapus notifikasi"
                    onClick={() => remove(n.id)}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {toast && !open && (
        <button className="notif-toast" onClick={() => openNotif(toast)}>
          <span className="notif-app-icon">
            <BellRing size={14} />
          </span>
          <span className="notif-text">
            <span className="notif-meta">Barang Hilang · sekarang</span>
            <strong>{toast.title}</strong>
            <span className="notif-body">{toast.body}</span>
          </span>
        </button>
      )}
    </div>
  );
}