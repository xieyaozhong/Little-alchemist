"use strict";

const CACHE_NAME = "little-alchemist-v5";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./enhancements.css",
  "./config.js",
  "./recipes.js",
  "./recipe-factory.js",
  "./recipes-common-01.js",
  "./recipes-common-02.js",
  "./recipes-common-03.js",
  "./recipes-common-04.js",
  "./recipes-common-05.js",
  "./recipes-common-06.js",
  "./recipes-common-07.js",
  "./recipes-common-08.js",
  "./recipes-common-09.js",
  "./recipes-common-10.js",
  "./recipes-common-11.js",
  "./recipes-common-12.js",
  "./recipes-common-13.js",
  "./diagrams.js",
  "./app.js",
  "./manifest.webmanifest",
  "./icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request)
        .then(response => {
          if (response.ok && new URL(event.request.url).origin === self.location.origin) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached || caches.match("./index.html"));
      return cached || network;
    })
  );
});
