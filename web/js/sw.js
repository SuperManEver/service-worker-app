"use strict";

// TODO
const version = 2;
var isOnline = true;
var isLoggedIn = false;

self.addEventListener("install", onInstall);
self.addEventListener("activate", onActivate);
self.addEventListener("message", onMessage);

main().catch(console.error);

// *********************************************************

async function main() {
  await sendMessage({ requestStatusUpdate: true });
}

async function sendMessage(payload) {
  // because we potentially can have many clients
  var allClients = await clients.matchAll({ includeUncontrolled: true });

  return Promise.all(
    allClients.map(function clientMsg(client) {
      var chan = new MessageChannel();
      chan.port1.onmessage = onMessage;
      return client.postMessage(payload, [chan.port2]);
    })
  );
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

function onMessage({ data }) {
  if (data.statusUpdate) {
    ({ isOnline, isLoggedIn } = data.statusUpdate);

    console.log(
      `Service Worker (v${version}) status update, isOnline: ${isOnline}, isLoggedIn: ${isLoggedIn}`
    );
  }
}
