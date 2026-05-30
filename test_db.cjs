const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'admin',
  database: 'credify_users'
});

async function run() {
  await client.connect();
  try {
    const query = \`
      INSERT INTO beneficiaries (
        user_id, type, name, account_number, bank_name, swift_code, address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id, account_number) DO UPDATE
      SET name = EXCLUDED.name, 
          type = EXCLUDED.type, 
          bank_name = EXCLUDED.bank_name, 
          swift_code = EXCLUDED.swift_code, 
          address = EXCLUDED.address
      RETURNING *
    \`;
    const values = [
      7,
      'INTERNATIONAL',
      'John Doe',
      'INTL1234567890',
      'Test Bank',
      'TEST1234',
      '123 Address St'
    ];
    const res = await client.query(query, values);
    console.log("Success:", res.rows[0]);
  } catch (err) {
    console.error("DB Error:", err);
  }
  await client.end();
}
run();
