import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const connection: any = await mysql.createConnection({
      host: 'localhost', user: 'root', password: '', database: 'pmbm_madrasah',
    });
    
    const [rows]: any = await connection.query('SELECT * FROM settings WHERE id = 1');
    await connection.end();

    if (rows.length > 0) {
      return new Response(JSON.stringify({ success: true, settings: rows[0] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ success: false, message: 'Settings tidak ditemukan' }), { status: 404 });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}

export async function POST({ request }: any) {
  try {
    const body = await request.json();
    const { status_pendaftaran, gelombang, pesan_tutup, alur_text, jadwal_text } = body;

    const connection: any = await mysql.createConnection({
      host: 'localhost', user: 'root', password: '', database: 'pmbm_madrasah',
    });

    await connection.query(
      'UPDATE settings SET status_pendaftaran = ?, gelombang = ?, pesan_tutup = ?, alur_text = ?, jadwal_text = ? WHERE id = 1',
      [status_pendaftaran, gelombang, pesan_tutup, alur_text, jadwal_text]
    );
    await connection.end();

    return new Response(JSON.stringify({ success: true, message: 'Pengaturan berhasil diperbarui' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}