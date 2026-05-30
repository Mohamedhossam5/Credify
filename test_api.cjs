const fetch = require('node-fetch'); // wait node 18+ has fetch natively

async function test() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@credify.com', password: 'password' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  if (!token) {
    console.log("No token:", loginData);
    return;
  }

  const payload = {
    type: "INTERNATIONAL",
    name: "John Doe",
    accountNumber: "INTL1234567890",
    bankName: "Test Bank",
    swiftCode: "TEST1234",
    address: "123 Address"
  };

  const res = await fetch('http://localhost:3000/api/transfer/beneficiaries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  console.log('Save response:', res.status, text);
}
test();
