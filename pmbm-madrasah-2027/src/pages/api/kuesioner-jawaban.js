import mysql from 'mysql2/promise';

export const prerender = false;
const dbConfig = { host: 'localhost', user: 'root', password: '', database: 'pmbm_madrasah' };

export const GET = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const pendaftar_id = url.searchParams.get('pendaftar_id');
    
    if (!pendaftar_id) {
      return new Response(JSON.stringify({ success: false, jawaban: {}, rincian: [] }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    // Ambil rincian lengkap pertanyaan dan jawaban
    const [rows] = await connection.query(`
      SELECT kj.pertanyaan_id, kj.jawaban, kp.pertanyaan 
      FROM kuesioner_jawaban kj 
      JOIN kuesioner_pertanyaan kp ON kj.pertanyaan_id = kp.id 
      WHERE kj.pendaftar_id = ?
    `, [pendaftar_id]);
    
    await connection.end();

    const jawabanObj = {};
    const rincian = rows || [];
    rincian.forEach(r => {
      jawabanObj[r.pertanyaan_id] = r.jawaban;
    });

    return new Response(JSON.stringify({ success: true, jawaban: jawabanObj, rincian }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, jawaban: {}, rincian: [], error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST = async ({ request }) => {
  try {
    const data = await request.json();
    const connection = await mysql.createConnection(dbConfig);

    if (data.action === 'simpan_jawaban') {
      await connection.query('DELETE FROM kuesioner_jawaban WHERE pendaftar_id = ?', [data.pendaftar_id]);

      if (data.jawaban) {
        for (const [qId, ans] of Object.entries(data.jawaban)) {
          await connection.query(
            'INSERT INTO kuesioner_jawaban (pendaftar_id, pertanyaan_id, jawaban) VALUES (?, ?, ?)',
            [data.pendaftar_id, qId, ans]
          );
        }
      }
    } else if (data.action === 'hapus_jawaban') {
      await connection.query('DELETE FROM kuesioner_jawaban WHERE pendaftar_id = ?', [data.pendaftar_id]);
    }

    await connection.end();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};