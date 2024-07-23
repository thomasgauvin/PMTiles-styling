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
    console.log("Handling network request for: ", request.url);
    console.log((new URL(request.url)).pathname)

    if((new URL(request.url)).pathname === "/checkSw"){
        console.log("returning A-OK")
        return event.respondWith(new Response("A-OK", {
            status: 202, // Use 200 to indicate successful response
            headers: {
                'Content-Type': 'text/plain', // Set appropriate content type
                'X-Sw-Tag': 'Served by Service Worker'
            }
        }));
    }
    if ((new URL(request.url)).pathname !== "/world.pmtiles") {
        return event.respondWith(fetch(request));
    }


    event.respondWith(handleRangeRequest(request));
});

async function fetchPmtilesFile() {
    const cache = await caches.open("pmtiles-file-cache");
    const cachedResponse = await cache.match('/world.pmtiles');

    if (cachedResponse) {
        return cachedResponse.arrayBuffer();
    }

    console.log("Fetching from network");
    const response = await fetch('/world.pmtiles');
    const responseClone = response.clone()
    const responseBuffer = await response.arrayBuffer();

    try {
        await cache.put('/world.pmtiles', responseClone);
    } catch (e) {
        console.log("Problem writing to cache: ", e);
    }

    return responseBuffer;
}

async function handleRangeRequest(request) {
    const pmtilesFile = await fetchPmtilesFile();
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
