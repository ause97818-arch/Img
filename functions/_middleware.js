// Runs on every request to this site. Proxies file-delivery URLs
// (/img/<file>, /video/<file>, /audio/<file>, /sticker/<file>, /doc/<file>)
// through to Cloudinary, and lets everything else (the actual pages,
// like /video itself) pass through to be served normally.

const TYPE_MAP = {
  img: 'image',
  video: 'video',
  audio: 'video',   // Cloudinary stores audio under its "video" resource type
  sticker: 'image',
  doc: 'raw',
};

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Split "/img/abc123.jpg" into ["img", "abc123.jpg"]
  const parts = url.pathname.split('/').filter(Boolean);

  const isFileDeliveryRoute = parts.length === 2 && TYPE_MAP[parts[0]];

  if (!isFileDeliveryRoute) {
    // Not a delivery link — let Pages serve the page/static asset as normal.
    return context.next();
  }

  const [prefix, file] = parts;
  const resourceType = TYPE_MAP[prefix];
  const cloudName = env.CLOUD_NAME || 'wdhnno7y';

  const upstreamUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${file}`;

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
