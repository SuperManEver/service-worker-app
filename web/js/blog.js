(function Blog() {
  "use strict";

  var offlineIcon;
  var svcworker;
  var usingSW = "serviceWorker" in navigator;
  var swRegistration;
  var isOnline = "onLine" in navigator ? navigator.onLine : true;
  var isLoggedIn = /isLoggedIn=1/.test(document.cookie.toString() || "");

  document.addEventListener("DOMContentLoaded", ready, false);

  initServiceWorker().catch(console.error);

  // **********************************

  function ready() {
    offlineIcon = document.getElementById("connectivity-status");

    if (!isOnline) {
      offlineIcon.classList.remove("hidden");
    }

    window.addEventListener("online", function() {
      offlineIcon.classList.add("hidden");
      isOnline = true;
      sendStatusUpdate();
    });

    window.addEventListener("offline", function() {
      offlineIcon.classList.remove("hidden");
      isOnline = false;
      sendStatusUpdate();
    });
  }

  async function initServiceWorker() {
    swRegistration = await navigator.serviceWorker.register("/sw.js", {
      updateViaCache: "none"
    });

    var wState =
      swRegistration.installing ||
      swRegistration.waiting ||
      swRegistration.active;

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      function onControllerChange() {
        svcworker = navigator.serviceWorker.controller;
        sendStatusUpdate(svcworker);
      }
    );

    navigator.serviceWorker.addEventListener("message", onSWMessage);
  }

  function onSWMessage(evt) {
    const { data } = evt;

    if (data.requestStatusUpdate) {
      const msg =
        "Received status update request from service worker, responding...";
      console.log(msg);
      sendStatusUpdate(evt.ports && evt.ports[0]);
    }
  }

  function sendStatusUpdate(target) {
    const payload = { statusUpdate: { isOnline, isLoggedIn } };
    sendSWMessage(payload, target);
  }

  function sendSWMessage(msg, target) {
    if (target) {
      target.postMessage(msg);
    } else if (svcworker) {
      svcworker.postMessage(msg);
    } else {
      navigator.serviceWorker.controller.postMessage(msg);
    }
  }
})();
