const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'postgres',
  database: 'credify'
});

async function run() {
  await client.connect();
  const res = await client.query('SELECT * FROM beneficiaries ORDER BY created_at DESC LIMIT 5');
  console.log(res.rows);
  await client.end();
}
run();
