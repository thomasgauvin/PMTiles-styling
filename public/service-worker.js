// service-worker.js
self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    event.waitUntil(self.skipWaiting()); // Activate worker immediately
});

self.addEventListener('activate', event => {
    console.log('Service Worker activating.');
    event.waitUntil(self.clients.claim()); // Become available to all pages
});

self.addEventListener('fetch', event => {
    const request = event.request;
    console.log("Service Worker handling network request for: ", request.url);
    console.log((new URL(request.url)).pathname)

    if ((new URL(request.url)).pathname !== "/world.pmtiles" && (new URL(request.url)).pathname !== "/nyc.pmtiles") {
        return event.respondWith(fetch(request));
    }

    event.respondWith(handleRangeRequest(request));
});

async function fetchPmtilesFile(path) {
    const cache = await caches.open("pmtiles-file-cache");
    const cachedResponse = await cache.match(path);

    if (cachedResponse) {
        return cachedResponse.arrayBuffer();
    }

    console.log("Fetching from network");
    const response = await fetch(path);
    const responseClone = response.clone()
    const responseBuffer = await response.arrayBuffer();

    try {
        await cache.put(path, responseClone);
    } catch (e) {
        console.log("Problem writing to cache: ", e);
    }

    return responseBuffer;
}

async function handleRangeRequest(request) {
    console.log("Service Worker handling range request for: ", request.url);
    const path = (new URL(request.url)).pathname;
    const pmtilesFile = await fetchPmtilesFile(path);
    const rangeHeader = request.headers.get('Range');

    if (rangeHeader) {
        const rangeMatch = rangeHeader.match(/bytes=(\d+)-(\d+)?/);
        if (rangeMatch) {
            const start = parseInt(rangeMatch[1], 10);
            const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : pmtilesFile.byteLength - 1;

            const chunk = pmtilesFile.slice(start, end + 1);
            return new Response(chunk, {
                status: 206,
                statusText: 'Partial Content',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Length': chunk.byteLength,
                    'Content-Range': `bytes ${start}-${end}/${pmtilesFile.byteLength}`,
                    'X-Sw-Tag': 'Served by Service Worker'
                }
            });
        }
    }

    // If no Range header, return the entire file
    return new Response(pmtilesFile, {
        status: 200,
        statusText: 'OK',
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Length': pmtilesFile.byteLength
        }
    });
}
