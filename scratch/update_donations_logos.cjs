const fs = require('fs');

const filePath = 'd:/Credify-2/Client/src/pages/dashboard/DonationsPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const imgStyle = "style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit', backgroundColor: '#fff', padding: '4px' }}";

content = content.replace(
  "logo: '❤️'",
  `logo: <img src="/logos/resala.png" alt="Resala" ${imgStyle} />`
);

content = content.replace(
  "logo: '🤝'",
  `logo: <img src="/logos/misr-el-kheir.png" alt="Misr El Kheir" ${imgStyle} />`
);

content = content.replace(
  "logo: '🎀'",
  `logo: <img src="/logos/baheya.png" alt="Baheya" ${imgStyle} />`
);

content = content.replace(
  "logo: '🏥'",
  `logo: <img src="/logos/hospital-57357.png" alt="57357" ${imgStyle} />`
);

content = content.replace(
  "logo: '💓'",
  `logo: <img src="/logos/magdi-yacoub.png" alt="Magdi Yacoub" ${imgStyle} />`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Donation logos updated successfully!');
