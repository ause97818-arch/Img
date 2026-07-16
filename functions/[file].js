// Proxies https://<your-domain>/doc/<file> → Cloudinary raw-file delivery.

export async function onRequestGet(context) {
  const { params, env } = context;
  const cloudName = env.CLOUD_NAME || 'wdhnno7y';
  const file = params.file;

  const upstreamUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/${file}`;

  const upstream = await fetch(upstreamUrl, {
    cf: { cacheTtl: 31536000, cacheEverything: true },
  });

  if (!upstream.ok) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers(upstream.headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(upstream.body, { status: 200, headers });
}
