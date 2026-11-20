import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, CheckCircle2, Send, Pencil } from "lucide-react";
import { useReports } from "../context/ReportsContext";

export default function PreviewModal({ title, rows, files = [], report, onClose }) {
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { addReport } = useReports();
  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

  const send = () => {
    // TODO: kirim ke backend (fetch POST /api/laporan) sebelum addReport
    addReport(report);
    setSent(true);
  };

  return (
    <div className="modal-overlay" onClick={sent ? undefined : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="modal-done">
            <CheckCircle2 size={54} />
            <h3>Laporan Berhasil Dikirim</h3>
            <p>
              Terima kasih. Petugas akan memverifikasi laporanmu dan
              mengabarimu lewat WhatsApp &amp; email SSO.
            </p>
            <button className="btn-primary" onClick={() => navigate("/riwayat")}>
              Lihat Riwayat Laporan
            </button>
          </div>
        ) : (
          <>
            <div className="modal-head">
              <div>
                <span className="modal-eyebrow">PRATINJAU</span>
                <h3>{title}</h3>
              </div>
              <button className="icon-btn" onClick={onClose} aria-label="Tutup">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p className="muted small">
                Periksa kembali data di bawah sebelum laporan dikirim.
              </p>

              {urls.length > 0 && (
                <div className="modal-photos">
                  {urls.map((u, i) => (
                    <img key={u} src={u} alt={`Foto ${i + 1}`} />
                  ))}
                </div>
              )}

              <dl className="modal-rows">
                {rows.map(({ label, value }) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value || "-"}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="modal-foot">
              <button className="btn-cancel" onClick={onClose}>
                <Pencil size={14} /> Kembali &amp; Ubah
              </button>
              <button className="btn-save" onClick={send}>
                <Send size={15} /> Kirim Laporan
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}