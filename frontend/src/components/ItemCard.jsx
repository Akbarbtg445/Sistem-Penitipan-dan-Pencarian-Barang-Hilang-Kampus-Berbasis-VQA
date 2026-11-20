import { MapPin, Building2, Clock, Package } from "lucide-react";

export default function ItemCard({ item }) {
  return (
    <article className="card">
      <div className="card-media">
        {item.image ? (
          <img src={item.image} alt={item.title} />
        ) : (
          <div className="card-placeholder">
            <Package size={40} />
          </div>
        )}
        <span className="tag tag-yellow">Menunggu Pengambilan</span>
        <span className="tag tag-green">Terverifikasi Satpam</span>
      </div>

      <div className="card-body">
        <div className="card-cat">{item.category}</div>
        <h3 className="card-title">{item.title}</h3>
        <p className="card-desc">{item.description}</p>

        <div className="card-info">
          <div>
            <MapPin size={13} /> Ditemukan di: <strong>{item.foundAt}</strong>
          </div>
          <div>
            <Building2 size={13} /> Diambil di: <strong>{item.pickupAt}</strong>
          </div>
        </div>

        <div className="card-foot">
          <span className="muted small">
            <Clock size={12} /> {item.time}
          </span>
          <button className="btn-primary btn-sm">Klaim Barang</button>
        </div>
      </div>
    </article>
  );
}