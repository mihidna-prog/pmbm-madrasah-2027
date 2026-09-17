import mysql from 'mysql2/promise';

export const prerender = false;

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pmbm_madrasah',
};

// GET: Ambil Pesan Chat
export const GET = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const wa = url.searchParams.get('wa');
    const connection = await mysql.createConnection(dbConfig);

    let rows;
    if (wa) {
      [rows] = await connection.query('SELECT * FROM chat_messages WHERE sender_wa = ? ORDER BY id ASC', [wa]);
    } else {
      [rows] = await connection.query('SELECT * FROM chat_messages ORDER BY id ASC');
    }

    await connection.end();
    return new Response(JSON.stringify({ success: true, chats: rows }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, chats: [] }), { status: 500 });
  }
};

// POST: Kirim Pesan Chat Baru
export const POST = async ({ request }) => {
  try {
    const data = await request.json();
    const connection = await mysql.createConnection(dbConfig);
    await connection.query(
      'INSERT INTO chat_messages (sender_name, sender_wa, message, sender_type) VALUES (?, ?, ?, ?)',
      [data.sender_name, data.sender_wa, data.message, data.sender_type || 'user']
    );

    await connection.end();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
};

// DELETE: Hapus Seluruh Percakapan Berdasarkan No. WA
export const DELETE = async ({ request }) => {
  try {
    const data = await request.json();
    if (!data.wa) {
      return new Response(JSON.stringify({ success: false, message: 'No. WA tidak ditemukan' }), { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);
    await connection.query('DELETE FROM chat_messages WHERE sender_wa = ?', [data.wa]);
    await connection.end();

    return new Response(JSON.stringify({ success: true, message: 'Obrolan berhasil dihapus' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Gagal menghapus obrolan' }), { status: 500 });
  }
};