const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Client', 'src', 'pages', 'dashboard', 'BillPaymentPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Define the updated ProviderLogo component with the overflow-wrapped scale prop
const scaledLogoComponent = `const ProviderLogo: React.FC<{ src: string; alt: string; padding?: string; scale?: number }> = ({ src, alt, padding = '6px', scale = 1.0 }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      borderRadius: '18px',
      backgroundColor: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          padding: padding,
          transform: \`scale(\${scale})\`,
          transition: 'transform 0.2s ease',
        }}
      />
    </div>
  );
};`;

// Replace the existing ProviderLogo definition
const startIdx = content.indexOf('const ProviderLogo: React.FC');
const endIdx = content.indexOf('const telecomProviders: BillProvider[]');

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + scaledLogoComponent + '\n\n' + content.substring(endIdx);
}

// 2. Refine all provider items with custom scales for visually balanced sizing
// Telecom
content = content.replace(
  /logo: <ProviderLogo src="\/logos\/etisalat\.png" alt="Etisalat" padding="6px" \/>/g,
  `logo: <ProviderLogo src="/logos/etisalat.png" alt="Etisalat" padding="6px" scale={1.1} />`
);
content = content.replace(
  /logo: <ProviderLogo src="\/logos\/orange\.png" alt="Orange" padding="0px" \/>/g,
  `logo: <ProviderLogo src="/logos/orange.png" alt="Orange" padding="0px" scale={1.0} />`
);
content = content.replace(
  /logo: <ProviderLogo src="\/logos\/vodafone\.png" alt="Vodafone" padding="4px" \/>/g,
  `logo: <ProviderLogo src="/logos/vodafone.png" alt="Vodafone" padding="4px" scale={1.1} />`
);
content = content.replace(
  /logo: <ProviderLogo src="\/logos\/we\.png" alt="WE" padding="4px" \/>/g,
  `logo: <ProviderLogo src="/logos/we.png" alt="WE" padding="4px" scale={1.15} />`
);

// Electricity (EEHC has circular margins, let's scale it to 1.3 to look nice and large!)
content = content.replace(
  /logo: <ProviderLogo src="\/logos\/eehc\.png" alt="EEHC" padding="3px" \/>/g,
  `logo: <ProviderLogo src="/logos/eehc.png" alt="EEHC" padding="3px" scale={1.3} />`
);

// Water (HCWW has high transparent whitespace, let's scale it to 1.4 to make it prominent and beautiful!)
content = content.replace(
  /logo: <ProviderLogo src="\/logos\/hcww\.png" alt="HCWW" padding="3px" \/>/g,
  `logo: <ProviderLogo src="/logos/hcww.png" alt="HCWW" padding="3px" scale={1.4} />`
);
content = content.replace(
  /logo: <ProviderLogo src="\/logos\/hcww\.png" alt="Alexandria Water" padding="3px" \/>/g,
  `logo: <ProviderLogo src="/logos/hcww.png" alt="Alexandria Water" padding="3px" scale={1.4} />`
);

// Gas
content = content.replace(
  /logo: <ProviderLogo src="\/logos\/petrotrade\.png" alt="Petrotrade" padding="3px" \/>/g,
  `logo: <ProviderLogo src="/logos/petrotrade.png" alt="Petrotrade" padding="3px" scale={1.2} />`
);
content = content.replace(
  /logo: <ProviderLogo src="\/logos\/town-gas\.png" alt="Town Gas" padding="1px" \/>/g,
  `logo: <ProviderLogo src="/logos/town-gas.png" alt="Town Gas" padding="1px" scale={1.2} />`
);
content = content.replace(
  /logo: <ProviderLogo src="\/logos\/natgas\.png" alt="Natgas" padding="0px" \/>/g,
  `logo: <ProviderLogo src="/logos/natgas.png" alt="Natgas" padding="0px" scale={1.1} />`
);
content = content.replace(
  /logo: <ProviderLogo src="\/logos\/taqa-gas\.png" alt="Taqa Gas" padding="3px" \/>/g,
  `logo: <ProviderLogo src="/logos/taqa-gas.png" alt="Taqa Gas" padding="3px" scale={1.25} />`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('[Scaling Optimization] Custom scales applied successfully to all 3 categories!');
