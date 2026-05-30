const http = require('http');

async function test() {
  const loginPayload = JSON.stringify({ email: "admin@credify.com", password: "password" });
  const loginRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let body = ''; res.on('data', d => body += d); res.on('end', () => resolve(JSON.parse(body)));
    });
    req.write(loginPayload); req.end();
  });
  console.log("Login:", loginRes);
  const token = loginRes.token;

  const benPayload = JSON.stringify({
    type: "INTERNATIONAL",
    name: "John Doe INTL",
    accountNumber: "INTL1234567890",
    bankName: "Test Bank",
    swiftCode: "TEST1234",
    address: "123 Address St"
  });

  const benRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost', port: 3000, path: '/api/transfer/beneficiaries', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` }
    }, res => {
      let body = ''; res.on('data', d => body += d); res.on('end', () => resolve({ status: res.statusCode, data: body }));
    });
    req.write(benPayload); req.end();
  });
  console.log("Beneficiary Post:", benRes);
}
test();
