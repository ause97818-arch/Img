export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const CLOUD_NAME = 'wdhnno7y';

    // Exact page routes -> serve the matching static HTML page
    const pages = {
      '/img': '/index.html',
      '/video': '/video.html',
      '/audio': '/audio.html',
      '/sticker': '/sticker.html',
      '/doc': '/doc.html',
    };
    if (pages[path]) {
      return env.ASSETS.fetch(new URL(pages[path], url));
    }

    // File delivery -> proxy through to Cloudinary, own domain stays in the URL bar
    const proxies = {
      '/img/': `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/`,
      '/video/': `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/`,
      '/audio/': `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/`,
      '/sticker/': `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/`,
      '/doc/': `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/`,
    };
    for (const prefix in proxies) {
      if (path.startsWith(prefix)) {
        const rest = path.slice(prefix.length);
        const target = proxies[prefix] + rest + url.search;
        const resp = await fetch(target);
        return new Response(resp.body, {
          status: resp.status,
          headers: resp.headers,
        });
      }
    }

    // Everything else -> normal static file (index.html, common.js, etc.)
    return env.ASSETS.fetch(request);
  },
};
