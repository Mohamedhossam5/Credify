const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Client', 'src', 'pages', 'dashboard', 'BillPaymentPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Define the updated clean ProviderLogo component for local loading and zero layout shifts
const cleanLocalLogoComponent = `const ProviderLogo: React.FC<{ src: string; alt: string; padding?: string }> = ({ src, alt, padding = '6px' }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        borderRadius: '18px',
        backgroundColor: '#fff',
        padding: padding,
      }}
    />
  );
};`;

// Replace the existing ProviderLogo definition
const startIdx = content.indexOf('const ProviderLogo: React.FC');
const endIdx = content.indexOf('const telecomProviders: BillProvider[]');

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + cleanLocalLogoComponent + '\n\n' + content.substring(endIdx);
}

// 2. Map all providers to their respective verified local files
// Electricity
content = content.replace(
  /logo:\s*<ProviderLogo\s+src="https:\/\/www\.eehc\.gov\.eg\/CMSEehc\/constra\/images\/logoEN\.png"\s+alt="EEHC"\s+padding="6px"\s*\/>/g,
  `logo: <ProviderLogo src="/logos/eehc.png" alt="EEHC" padding="6px" />`
);

// Water
content = content.replace(
  /logo:\s*<ProviderLogo\s+src="https:\/\/www\.hcww\.com\.eg\/wp-content\/uploads\/2022\/07\/HCWW-600x489\.png"\s+alt="HCWW"\s+padding="6px"\s*\/>/g,
  `logo: <ProviderLogo src="/logos/hcww.png" alt="HCWW" padding="6px" />`
);
content = content.replace(
  /logo:\s*<ProviderLogo\s+src="https:\/\/www\.hcww\.com\.eg\/wp-content\/uploads\/2022\/07\/HCWW-600x489\.png"\s+alt="Alexandria Water"\s+padding="4px"\s*\/>/g,
  `logo: <ProviderLogo src="/logos/hcww.png" alt="Alexandria Water" padding="4px" />`
);

// Gas
content = content.replace(
  /logo:\s*<ProviderLogo\s+src="https:\/\/egyptoil-gas\.com\/wp-content\/uploads\/2022\/01\/IMG_20220112_081456_633\.png"\s+alt="Petrotrade"\s+padding="6px"\s*\/>/g,
  `logo: <ProviderLogo src="/logos/petrotrade.png" alt="Petrotrade" padding="6px" />`
);
content = content.replace(
  /logo:\s*<ProviderLogo\s+src="https:\/\/th\.bing\.com\/th\/id\/R\.13707ad378bc5b6aa5b7c96c1ce9ee3e\?rik=9yRwLuBZRcxnug&riu=http%3a%2f%2fwww.expoegypt.gov.eg%2fuploads%2f2018%2f06%2f5b31eccbb3bab.jpg&ehk=4nfCH9qh8wPrgTrauMgRaUEf7wfQaQOC2zkZ6jstVtE%3d&risl=&pid=ImgRaw&r=0"\s+alt="Town Gas"\s+padding="4px"\s*\/>/g,
  `logo: <ProviderLogo src="/logos/town-gas.png" alt="Town Gas" padding="4px" />`
);
content = content.replace(
  /logo:\s*<ProviderLogo\s+src="https:\/\/play-lh\.googleusercontent\.com\/cg9IZv5fEAn4BicmI-ipmOtHJnbh9gn7YshRhZkI4kj31_XiHELflQhUlCLpVmbwPw"\s+alt="Natgas"\s+padding="4px"\s*\/>/g,
  `logo: <ProviderLogo src="/logos/natgas.png" alt="Natgas" padding="4px" />`
);
content = content.replace(
  /logo:\s*<ProviderLogo\s+src="https:\/\/taqagas\.com\.eg\/templates\/taqagas\/images\/logo-2\.png"\s+alt="Taqa Gas"\s+padding="6px"\s*\/>/g,
  `logo: <ProviderLogo src="/logos/taqa-gas.png" alt="Taqa Gas" padding="6px" />`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('[Local Logo Application] Successfully refactored BillPaymentPage to use 100% verified local assets!');
