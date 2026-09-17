import mysql from 'mysql2/promise';

export const prerender = false;
const dbConfig = { host: 'localhost', user: 'root', password: '', database: 'pmbm_madrasah' };

export const GET = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query('SELECT * FROM kuesioner_pertanyaan ORDER BY id ASC');
    await connection.end();
    return new Response(JSON.stringify({ success: true, pertanyaan: rows }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, pertanyaan: [] }), { status: 500 });
  }
};

export const POST = async ({ request }) => {
  try {
    const data = await request.json();
    const connection = await mysql.createConnection(dbConfig);

    if (data.action === 'tambah_pertanyaan') {
      await connection.query(
        'INSERT INTO kuesioner_pertanyaan (pertanyaan, tipe_input, pilihan_opsi) VALUES (?, ?, ?)',
        [data.pertanyaan, data.tipe_input || 'text', data.pilihan_opsi || '']
      );
    } else if (data.action === 'hapus_pertanyaan') {
      await connection.query('DELETE FROM kuesioner_pertanyaan WHERE id = ?', [data.id]);
    }

    await connection.end();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
};