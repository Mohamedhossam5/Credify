export function sendSms(phoneNumber: string, otp: string): void {
  const divider = "═".repeat(52);
  console.log("");
  console.log(`  ╔${divider}╗`);
  console.log(`  ║  📱 MOCK SMS GATEWAY                               ║`);
  console.log(`  ╠${divider}╣`);
  console.log(`  ║  To:   ${phoneNumber.padEnd(43)}║`);
  console.log(`  ║  Code: ${otp.padEnd(43)}║`);
  console.log(`  ║  Message: Your CredifyBank verification code is ${otp}  ║`);
  console.log(`  ╚${divider}╝`);
  console.log("");
}
