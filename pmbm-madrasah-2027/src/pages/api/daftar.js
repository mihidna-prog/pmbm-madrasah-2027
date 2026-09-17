import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pmbm_madrasah',
};

export const POST = async ({ request }) => {
  try {
    const data = await request.json();

    if (!data.nama_siswa || !data.nik_siswa || !data.no_kk || !data.nama_ayah || !data.hp_ayah) {
      return new Response(
        JSON.stringify({ success: false, message: 'Harap lengkapi semua data wajib (*)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const connection = await mysql.createConnection(dbConfig);
    
    const [countRow] = await connection.execute('SELECT COUNT(*) as total FROM pendaftar');
    const nextNum = (countRow[0].total + 1).toString().padStart(3, '0');
    const noPendaftaran = `PMBM-2027-${nextNum}`;

    const query = `
      INSERT INTO pendaftar (
        no_pendaftaran, nama_siswa, nisn, asal_sekolah, nik_siswa, tempat_lahir, tanggal_lahir,
        anak_ke, jumlah_saudara, agama, alamat_rt, alamat_rw, alamat_desa, alamat_kecamatan,
        tinggi_badan, berat_badan, no_kk,
        nama_ayah, nik_ayah, pekerjaan_ayah, hp_ayah, penghasilan_ayah,
        nama_ibu, nik_ibu, pekerjaan_ibu, hp_ibu, penghasilan_ibu, 
        alamat_ortu, ortu_rt, ortu_rw, ortu_desa, ortu_kecamatan,
        bantuan_sosial, ukuran_atasan, ukuran_bawahan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const bantuanStr = Array.isArray(data.bantuan_sosial) ? data.bantuan_sosial.join(', ') : (data.bantuan_sosial || '-');

    await connection.execute(query, [
      noPendaftaran, data.nama_siswa, data.nisn || '', data.asal_sekolah || '', data.nik_siswa,
      data.tempat_lahir, data.tanggal_lahir, data.anak_ke || 1, data.jumlah_saudara || 1,
      data.agama || 'Islam', data.alamat_rt || '', data.alamat_rw || '', data.alamat_desa,
      data.alamat_kecamatan, data.tinggi_badan || 0, data.berat_badan || 0, data.no_kk,
      data.nama_ayah, data.nik_ayah, data.pekerjaan_ayah || '', data.hp_ayah, data.penghasilan_ayah || '',
      data.nama_ibu, data.nik_ibu, data.pekerjaan_ibu || '', data.hp_ibu || '', data.penghasilan_ibu || '',
      data.alamat_ortu || '', data.ortu_rt || '', data.ortu_rw || '', data.ortu_desa || '', data.ortu_kecamatan || '',
      bantuanStr, data.ukuran_atasan, data.ukuran_bawahan
    ]);

    await connection.end();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Pendaftaran Berhasil!',
        noPendaftaran: noPendaftaran,
        namaSiswa: data.nama_siswa,
        tglDaftar: new Date().toLocaleDateString('id-ID')
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error DB:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Terjadi kesalahan sistem database.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};