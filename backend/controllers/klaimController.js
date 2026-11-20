const supabase = require('../config/supabase');

// Mengajukan klaim barang temuan
exports.ajukanKlaim = async (req, res) => {
  try {
    const {
      id_temuan,
      id_pengklaim,
      email_pengklaim,
      nama_pengklaim,
      bukti_kepemilikan,
    } = req.body;

    // Validasi sederhana format UUID agar item dummy (id: 1, 2) memberi pesan jelas
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id_temuan || !uuidRegex.test(String(id_temuan))) {
      return res.status(400).json({
        status: 'error',
        message: 'Barang contoh statis tidak dapat diklaim. Silakan klaim barang yang dilaporkan dari database.',
      });
    }

    const { data, error } = await supabase
      .from('klaim_barang')
      .insert([{
        id_temuan,
        id_pengklaim: id_pengklaim && uuidRegex.test(String(id_pengklaim)) ? id_pengklaim : null,
        email_pengklaim: email_pengklaim || 'anonim@umy.ac.id',
        nama_pengklaim: nama_pengklaim || 'Mahasiswa UMY',
        bukti_kepemilikan,
        status_klaim: 'DIAJUKAN',
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      status: 'success',
      message: 'Klaim berhasil diajukan, menunggu verifikasi satpam.',
      data,
    });
  } catch (error) {
    console.error('Error ajukan klaim:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Satpam memverifikasi dan mencatat riwayat serah terima
exports.verifikasiKlaim = async (req, res) => {
  try {
    const { id_klaim } = req.params;
    const { status_klaim, id_petugas } = req.body; // 'DISETUJUI' atau 'DITOLAK'

    const { data: klaimUpdate, error: klaimError } = await supabase
      .from('klaim_barang')
      .update({ status_klaim })
      .eq('id_klaim', id_klaim)
      .select()
      .single();

    if (klaimError) throw klaimError;

    if (status_klaim === 'DISETUJUI') {
      const { id_temuan, id_pengklaim } = klaimUpdate;

      await supabase.from('riwayat_serah_terima').insert([{
        id_temuan,
        id_penerima: id_pengklaim || null,
        id_petugas: id_petugas || null,
        tanggal_serah_terima: new Date().toISOString(),
      }]);

      await supabase
        .from('barang_temuan')
        .update({ status_barang: 'DIKEMBALIKAN' })
        .eq('id_temuan', id_temuan);
    }

    res.status(200).json({
      status: 'success',
      message: `Klaim berhasil diproses dengan status: ${status_klaim}`,
    });
  } catch (error) {
    console.error('Error verifikasi klaim:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
};