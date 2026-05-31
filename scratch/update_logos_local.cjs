const fs = require('fs');

const filePath = 'd:/Credify-2/Client/src/pages/dashboard/BillPaymentPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace Etisalat
content = content.replace(
  /logo: <img src="https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/8\/87\/Etisalat_Logo\.svg".*?\/>,/,
  "logo: <img src=\"/logos/etisalat.png\" alt=\"Etisalat\" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '18px', backgroundColor: '#fff', padding: '6px' }} />,"
);

// Replace Orange
content = content.replace(
  /logo: <img src="https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/c\/c8\/Orange_logo\.svg".*?\/>,/,
  "logo: <img src=\"/logos/orange.png\" alt=\"Orange\" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '18px', backgroundColor: '#fff' }} />,"
);

// Replace Vodafone
content = content.replace(
  /logo: <img src="https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/a\/a6\/Vodafone_icon\.svg".*?\/>,/,
  "logo: <img src=\"/logos/vodafone.png\" alt=\"Vodafone\" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '18px', backgroundColor: '#fff', padding: '4px' }} />,"
);

// Replace WE
content = content.replace(
  /logo: <img src="https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/b\/b5\/WE_logo\.svg".*?\/>,/,
  "logo: <img src=\"/logos/we.png\" alt=\"WE\" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '18px', backgroundColor: '#fff', padding: '4px' }} />,"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Logos updated successfully to local files!');
