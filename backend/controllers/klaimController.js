const supabase = require('../config/supabase');

// Mengajukan klaim barang temuan
exports.ajukanKlaim = async (req, res) => {
    try {
        const { id_barang, id_pengklaim, bukti_kepemilikan } = req.body;

        // Simpan pengajuan ke tabel klaim_barang
        const { data, error } = await supabase
            .from('klaim_barang')
            .insert([{
                id_barang,
                id_pengklaim,
                bukti_kepemilikan,
                status_klaim: 'MENUNGGU_VERIFIKASI'
            }])
            .select();

        if (error) throw error;

        res.status(201).json({
            status: 'success',
            message: 'Klaim berhasil diajukan, menunggu verifikasi satpam.',
            data: data[0]
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Satpam memverifikasi dan mencatat riwayat serah terima
exports.verifikasiKlaim = async (req, res) => {
    try {
        const { id_klaim } = req.params;
        const { status_klaim, id_petugas } = req.body; // status: 'DISETUJUI' atau 'DITOLAK'

        // 1. Update status klaim
        const { data: klaimUpdate, error: klaimError } = await supabase
            .from('klaim_barang')
            .update({ status_klaim })
            .eq('id', id_klaim)
            .select()
            .single();

        if (klaimError) throw klaimError;

        // 2. Jika disetujui, catat ke riwayat serah terima & ubah status barang
        if (status_klaim === 'DISETUJUI') {
            const { id_barang, id_pengklaim } = klaimUpdate;

            // Catat serah terima
            await supabase.from('riwayat_serah_terima').insert([{
                id_barang,
                id_penerima: id_pengklaim,
                id_petugas,
                tanggal_serah_terima: new Date()
            }]);

            // Ubah status barang temuan menjadi 'DIKEMBALIKAN'
            await supabase.from('barang_temuan')
                .update({ status_barang: 'DIKEMBALIKAN' })
                .eq('id', id_barang);
        }

        res.status(200).json({
            status: 'success',
            message: `Klaim berhasil diproses dengan status: ${status_klaim}`
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};