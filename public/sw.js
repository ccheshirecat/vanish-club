const CACHE_NAME = "wrkx-app-v1"
const urlsToCache = ["/", "/listings", "/vendor/dashboard", "/styles/globals.css", "/manifest.json"]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

self.addEventListener("fetch", (event) => {
  event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)))
})

