"use strict";

// TODO
const version = 1;

self.addEventListener("install", onInstall);
self.addEventListener("activate", onActivate);

main().catch(console.error);

// *********************************************************

async function main() {
  console.log(`Service worker (${version}) is started...`);
}

async function onInstall(evt) {
  console.log("Installed");
  self.skipWaiting();
}

async function onActivate(evt) {
  evt.waitUntil(handleActivation());
}

async function handleActivation() {
  await clients.claim();
  console.log("Actived");
}
