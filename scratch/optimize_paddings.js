const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Client', 'src', 'pages', 'dashboard', 'BillPaymentPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Refine paddings for Gas Providers
content = content.replace(
  /logo: <ProviderLogo src="\/logos\/petrotrade\.png" alt="Petrotrade" padding="6px" \/>/g,
  `logo: <ProviderLogo src="/logos/petrotrade.png" alt="Petrotrade" padding="3px" />`
);
content = content.replace(
  /logo: <ProviderLogo src="\/logos\/town-gas\.png" alt="Town Gas" padding="4px" \/>/g,
  `logo: <ProviderLogo src="/logos/town-gas.png" alt="Town Gas" padding="1px" />`
);
content = content.replace(
  /logo: <ProviderLogo src="\/logos\/natgas\.png" alt="Natgas" padding="4px" \/>/g,
  `logo: <ProviderLogo src="/logos/natgas.png" alt="Natgas" padding="0px" />`
);
content = content.replace(
  /logo: <ProviderLogo src="\/logos\/taqa-gas\.png" alt="Taqa Gas" padding="6px" \/>/g,
  `logo: <ProviderLogo src="/logos/taqa-gas.png" alt="Taqa Gas" padding="3px" />`
);

// 2. Refine paddings for Water Providers (using hcww.png)
content = content.replace(
  /logo: <ProviderLogo src="\/logos\/hcww\.png" alt="HCWW" padding="6px" \/>/g,
  `logo: <ProviderLogo src="/logos/hcww.png" alt="HCWW" padding="3px" />`
);
content = content.replace(
  /logo: <ProviderLogo src="\/logos\/hcww\.png" alt="Alexandria Water" padding="4px" \/>/g,
  `logo: <ProviderLogo src="/logos/hcww.png" alt="Alexandria Water" padding="3px" />`
);

// 3. Refine paddings for Electricity Providers (using eehc.png)
content = content.replace(
  /logo: <ProviderLogo src="\/logos\/eehc\.png" alt="EEHC" padding="6px" \/>/g,
  `logo: <ProviderLogo src="/logos/eehc.png" alt="EEHC" padding="3px" />`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('[Padding Optimization] Finished refactoring paddings across all 3 utility categories!');
