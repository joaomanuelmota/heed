// app/sitemap.js

export async function GET(request) {
  const baseUrl = 'https://myheed.app';
  const urls = [
    '',
    '/login',
    '/signup',
    '/privacy',
    '/terms'
    // Adiciona outras rotas públicas relevantes aqui
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
      (url) => `  <url><loc>${baseUrl}${url}</loc></url>`
    )
    .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}