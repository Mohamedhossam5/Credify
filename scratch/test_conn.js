const { Client } = require('pg');

async function testConnection(host, port, user, password, database) {
  const client = new Client({ host, port, user, password, database });
  try {
    await client.connect();
    console.log(`[SUCCESS] Connected to ${database} on port ${port} with user ${user} (password: ${password})`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`[FAIL] Connection to ${database} on port ${port} failed: ${err.message}`);
    return false;
  }
}

async function run() {
  const configs = [
    // Standard Port 5432 configurations
    { port: 5432, password: 'admin', db: 'postgres' },
    { port: 5432, password: 'postgres', db: 'postgres' },
    { port: 5432, password: '1272004', db: 'postgres' },
    { port: 5432, password: 'admin', db: 'credify_users' },
    { port: 5432, password: '1272004', db: 'credify_users' },

    // Alternative Port 5433 configurations
    { port: 5433, password: 'admin', db: 'postgres' },
    { port: 5433, password: 'postgres', db: 'postgres' },
    { port: 5433, password: '1272004', db: 'postgres' },
    { port: 5433, password: 'admin', db: 'credify_users' },
    { port: 5433, password: '1272004', db: 'credify_users' }
  ];

  for (const config of configs) {
    await testConnection('localhost', config.port, 'postgres', config.password, config.db);
  }
}

run();
