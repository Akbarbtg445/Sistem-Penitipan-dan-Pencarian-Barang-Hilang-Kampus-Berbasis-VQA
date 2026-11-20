const supabase = require('../config/supabase');

// Helper untuk upload foto base64 ke Supabase Storage bucket 'foto_barang'
async function uploadFotoKeStorage(imageBase64, folderPrefix) {
  if (!imageBase64 || !imageBase64.startsWith('data:image')) {
    return null;
  }

  const matches = imageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!matches) return null;

  const mimeType = matches[1];
  const ext = mimeType.split('/')[1] || 'jpg';
  const buffer = Buffer.from(matches[2], 'base64');
  const fileName = `${folderPrefix}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('foto_barang')
    .upload(fileName, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    console.error('Gagal upload ke Storage:', uploadError.message);
    return null;
  }

  const { data: publicData } = supabase.storage
    .from('foto_barang')
    .getPublicUrl(fileName);

  return publicData?.publicUrl || null;
}

exports.buatLaporan = async (req, res) => {
  try {
    const {
      type,
      title,
      category,
      description,
      place,
      pickupAt,
      date,
      time,
      catatan,
      reporterEmail,
      imageBase64,
    } = req.body;

    const isLost = type === 'lost';
    const namaTabel = isLost ? 'laporan_kehilangan' : 'barang_temuan';
    const tanggalStr = date || new Date().toISOString().split('T')[0];
    const jamStr = time ? `${time}:00` : '00:00:00';
    const waktuTimestamp = `${tanggalStr}T${jamStr}`;

    // Upload foto ke bucket 'foto_barang' jika user melampirkan foto
    const folder = isLost ? 'kehilangan' : 'temuan';
    const uploadedUrl = await uploadFotoKeStorage(imageBase64, folder);

    const deskripsiLengkap = catatan
      ? `${description || '-'} (Catatan: ${catatan})`
      : description || '-';

    const payload = isLost
      ? {
          nama_barang: title,
          kategori: category || 'Lainnya',
          kategori_barang: (category || 'Lainnya').slice(0, 50),
          ciri_khusus: deskripsiLengkap,
          deskripsi_ciri: deskripsiLengkap,
          lokasi_hilang: (place || '-').slice(0, 255),
          tanggal_hilang: tanggalStr,
          waktu_hilang: waktuTimestamp,
          foto_referensi: uploadedUrl || 'https://placehold.co/600x400?text=Foto+Referensi',
          email_pelapor: reporterEmail || 'anonim@umy.ac.id',
          status_laporan: 'DICARI',
        }
      : {
          nama_barang: title,
          kategori: category || 'Lainnya',
          kategori_barang: (category || 'Lainnya').slice(0, 50),
          ciri_khusus: description || '-',
          deskripsi_barang: description || '-',
          lokasi_ditemukan: (place || '-').slice(0, 255),
          pos_penyimpanan: pickupAt || 'Pos Satpam Induk',
          tanggal_ditemukan: tanggalStr,
          waktu_ditemukan: waktuTimestamp,
          foto_barang: uploadedUrl || 'https://placehold.co/600x400?text=Foto+Barang',
          email_penemu: reporterEmail || 'anonim@umy.ac.id',
          status_barang: 'MENUNGGU_VERIFIKASI',
        };

    const { data, error } = await supabase
      .from(namaTabel)
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ status: 'success', data });
  } catch (error) {
    console.error('Error simpan:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.ambilLaporan = async (req, res) => {
  try {
    const [resTemuan, resHilang] = await Promise.all([
      supabase
        .from('barang_temuan')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('laporan_kehilangan')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    if (resTemuan.error) throw resTemuan.error;
    if (resHilang.error) throw resHilang.error;

    const formattedTemuan = (resTemuan.data || []).map((item) => ({
      id: item.id_temuan,
      type: 'found',
      category: (item.kategori || item.kategori_barang || 'LAINNYA').toUpperCase(),
      title: item.nama_barang || item.kategori_barang || 'Barang Temuan',
      description: item.deskripsi_barang || item.ciri_khusus || '-',
      place: item.lokasi_ditemukan || '-',
      foundAt: item.lokasi_ditemukan || '-',
      pickupAt: item.pos_penyimpanan || 'Pos Satpam Induk',
      date: item.tanggal_ditemukan || '-',
      time: item.tanggal_ditemukan || 'Baru saja',
      image: item.foto_barang || '',
      status: item.status_barang || 'Menunggu Verifikasi',
      tone: item.status_barang === 'TERVERIFIKASI' ? 'green' : 'yellow',
    }));

    const formattedHilang = (resHilang.data || []).map((item) => ({
      id: item.id_laporan,
      type: 'lost',
      category: (item.kategori || item.kategori_barang || 'LAINNYA').toUpperCase(),
      title: item.nama_barang || item.kategori_barang || 'Barang Hilang',
      description: item.deskripsi_ciri || item.ciri_khusus || '-',
      place: item.lokasi_hilang || '-',
      foundAt: item.lokasi_hilang || '-',
      pickupAt: 'Menunggu Temuan',
      date: item.tanggal_hilang || '-',
      time: item.tanggal_hilang || 'Baru saja',
      image: item.foto_referensi || '',
      status: item.status_laporan || 'DICARI',
      tone: 'yellow',
    }));

    res.status(200).json({
      status: 'success',
      data: [...formattedTemuan, ...formattedHilang],
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};