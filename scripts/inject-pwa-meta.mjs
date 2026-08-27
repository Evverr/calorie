import { readFileSync, writeFileSync } from 'node:fs';

const indexPath = new URL('../dist/index.html', import.meta.url);
const pwaHead = `
    <meta name="theme-color" content="#F9F1FF" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Калории" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="/app-icon.png" />
    <style>@media (max-width: 500px) { html, body, #root { background: #F9F1FF !important; } }</style>`;

const html = readFileSync(indexPath, 'utf8')
  .replace('<html lang="en">', '<html lang="ru">')
  .replace(
    'width=device-width, initial-scale=1, shrink-to-fit=no',
    'width=device-width, initial-scale=1, viewport-fit=cover, shrink-to-fit=no',
  )
  .replace('</head>', `${pwaHead}\n  </head>`);

writeFileSync(indexPath, html);
