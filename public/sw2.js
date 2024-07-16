// public/service-worker.js

// import { registerRoute } from "workbox-routing";
// import { CacheFirst } from "workbox-strategies";

const cacheAssets = [
  'world.pmtiles',
  'nyc.pmtiles'
]

self.addEventListener('install', (e) => {
  console.log("service worker installed")

  e.waitUntil(
    caches
      .open("pmtiles-cache")
      .then((cache) => {
         return cache.addAll(cacheAssets)
       })
       .catch((err) => {
          console.log("error caching assets")
        })
        .then(() => {
           self.skipWaiting()
         })
  )
})

self.addEventListener('activate', (e) => {
  console.log("service worker activated")
})

self.addEventListener('fetch', (e) => {
  console.log("service worker fetching 2")

  if(e.request.url.endsWith(".pmtiles")) {
    console.log('service worker fetching pmtiles')
    async ({ request }) => {
      try {
        // Use CacheFirst strategy
        const cacheStrategy = new CacheFirst({
          cacheName: "pmtiles-cache",
          plugins: [
            {
              // Ensure the entire response is cached
              cacheWillUpdate: async ({ response }) => {
                if (response && response.ok) {
                  return response;
                }
                return null;
              },
            },
          ],
        });

        // Attempt to serve from cache first
        let response = await cacheStrategy.handle({ request });

        // If not found in cache, fetch the full file from the network
        if (!response) {
          const headers = new Headers(request.headers);
          headers.delete("range"); // Remove range request headers

          const fullRequest = new Request(request.url, {
            headers: headers,
            method: "GET", // Ensure it's a GET request
          });

          console.log("fetching full request from network");

          response = await fetch(fullRequest);

          // Ensure the response is valid before caching
          if (response.ok) {
            const cache = await caches.open("pmtiles-cache");
            await cache.put(request, response.clone());
          }
        }

        return response;
      } catch (error) {
        console.error("Error in service worker:", error);
        throw error;
      }
    }
  }
})
