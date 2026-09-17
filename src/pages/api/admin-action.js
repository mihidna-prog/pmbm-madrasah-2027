import mysql from 'mysql2/promise';

export const prerender = false;

const dbConfig = { 
  host: 'localhost', 
  user: 'root', 
  password: '', 
  database: 'pmbm_madrasah' 
};

export const POST = async ({ request }) => {
  try {
    const data = await request.json();
    const connection = await mysql.createConnection(dbConfig);

    // 1. Update Status Validasi & Biaya Saja
    if (data.action === 'update_validasi') {
      await connection.query(
        'UPDATE pendaftar SET status_pendaftaran = ?, biaya_pendaftaran = ?, biaya_seragam = ? WHERE id = ?',
        [data.status_pendaftaran, data.biaya_pendaftaran || 0, data.biaya_seragam || 0, data.id]
      );
    } 
    // 2. Update Koreksi Penuh (Biodata, Ukuran Seragam, Bantuan, & 5 Foto/Dokumen Base64)
    else if (data.action === 'update_full_pendaftar') {
      await connection.query(`
        UPDATE pendaftar SET 
          status_pendaftaran = ?, biaya_pendaftaran = ?, biaya_seragam = ?,
          foto_siswa = ?, foto_akta = ?, foto_kk = ?, foto_rumah = ?, 
          foto_pkh = ?, foto_pip = ?, foto_kip = ?, foto_bpnt = ?,
          nama_siswa = ?, nik_siswa = ?, nisn = ?, asal_sekolah = ?, 
          tempat_lahir = ?, tanggal_lahir = ?, anak_ke = ?, jumlah_saudara = ?, 
          no_kk = ?, tinggi_badan = ?, berat_badan = ?, 
          alamat_rt = ?, alamat_rw = ?, alamat_desa = ?, alamat_kecamatan = ?,
          nama_ayah = ?, nik_ayah = ?, hp_ayah = ?, pekerjaan_ayah = ?, penghasilan_ayah = ?,
          nama_ibu = ?, nik_ibu = ?, hp_ibu = ?, pekerjaan_ibu = ?, penghasilan_ibu = ?,
          bantuan_sosial = ?, ukuran_atasan = ?, ukuran_bawahan = ?
        WHERE id = ?
      `, [
        data.status_pendaftaran, data.biaya_pendaftaran || 0, data.biaya_seragam || 0,
        data.foto_siswa || '', data.foto_akta || '', data.foto_kk || '', data.foto_rumah || '',
        data.foto_pkh || '', data.foto_pip || '', data.foto_kip || '', data.foto_bpnt || '',
        data.nama_siswa, data.nik_siswa, data.nisn || '', data.asal_sekolah || '',
        data.tempat_lahir, data.tanggal_lahir, data.anak_ke || 1, data.jumlah_saudara || 0,
        data.no_kk, data.tinggi_badan || 0, data.berat_badan || 0,
        data.alamat_rt || '', data.alamat_rw || '', data.alamat_desa, data.alamat_kecamatan,
        data.nama_ayah, data.nik_ayah || '', data.hp_ayah || '', data.pekerjaan_ayah || '', data.penghasilan_ayah || '',
        data.nama_ibu, data.nik_ibu || '', data.hp_ibu || '', data.pekerjaan_ibu || '', data.penghasilan_ibu || '',
        data.bantuan_sosial || '-', data.ukuran_atasan || 'S', data.ukuran_bawahan || 'S',
        data.id
      ]);
    }

    // 3. Update Kelulusan Massal
    else if (data.action === 'update_kelulusan') {
      const ids = Array.isArray(data.ids) ? data.ids : [data.ids];
      await connection.query(
        'UPDATE pendaftar SET status_kelulusan = ? WHERE id IN (?)',
        [data.status_kelulusan, ids]
      );
    } 
    // 4. Hapus Pendaftar
    else if (data.action === 'hapus_siswa') {
      await connection.query('DELETE FROM pendaftar WHERE id = ?', [data.id]);
    }

    await connection.end();
    return new Response(JSON.stringify({ success: true, message: 'Berhasil diperbarui' }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error admin-action:", error);
    return new Response(JSON.stringify({ success: false, message: 'Gagal memproses aksi: ' + error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};