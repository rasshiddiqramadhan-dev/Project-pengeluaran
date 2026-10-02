import mysql from 'mysql2/promise';
import 'dotenv/config';

async function init() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('Connected to MySQL server');

    await conn.query('DROP DATABASE IF EXISTS db_pengeluaran');
    console.log('Dropped existing db_pengeluaran');

    await conn.query('CREATE DATABASE db_pengeluaran CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('Created db_pengeluaran');

    await conn.query('USE db_pengeluaran');

    await conn.query(`
      CREATE TABLE kategori (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL
      ) ENGINE=InnoDB;
    `);
    console.log('Created table kategori');

    await conn.query(`
      CREATE TABLE pengeluaran (
        id INT AUTO_INCREMENT PRIMARY KEY,
        judul VARCHAR(255) NOT NULL,
        nominal INT NOT NULL,
        tanggal DATE NOT NULL,
        id_kategori INT NULL,
        catatan TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_kategori) REFERENCES kategori(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);
    console.log('Created table pengeluaran');

    await conn.query(`
      INSERT INTO kategori (id, nama) VALUES 
      (1, 'Makanan'),
      (2, 'Pendidikan'),
      (3, 'Transportasi'),
      (4, 'Hiburan'),
      (5, 'Kebutuhan');
    `);
    console.log('Inserted categories');

    await conn.query(`
      INSERT INTO pengeluaran (judul, nominal, tanggal, id_kategori, catatan) VALUES
      ('R.Asshiddiq Ramadhan', 30000, '2026-09-24', NULL, NULL),
      ('Kopi', 18000, '2026-03-04', 1, 'Kopi santai'),
      ('Buku catatan', 25000, '2026-03-04', 2, 'Buku tulis'),
      ('Bensin Motor', 20000, '2026-03-02', 3, 'Pertamax'),
      ('Snack Sore', 15000, '2026-03-01', 1, 'Roti dan susu');
    `);
    console.log('Inserted initial expenses');

    const [rows] = await conn.query(`
      SELECT p.id, p.judul, p.nominal, p.tanggal, p.catatan, k.nama AS kategori 
      FROM pengeluaran p 
      LEFT JOIN kategori k ON p.id_kategori = k.id
    `);
    console.log('Query result count:', rows.length);
    console.log('Query rows:', rows);

    await conn.end();
    console.log('Database initialized successfully!');
  } catch (err) {
    console.error('Initialization error:', err);
    process.exit(1);
  }
}

init();
