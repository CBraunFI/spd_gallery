/**
 * Resize iFrame Script for WordPress Integration
 *
 * This script should be included in the WordPress page that embeds the gallery.
 * It listens for postMessage events from the gallery iframe and adjusts the height accordingly.
 *
 * Usage in WordPress Custom HTML Block:
 *
 * <iframe id="spd-gallery"
 *         src="https://YOUR-USERNAME.github.io/spd-gallery/"
 *         style="width:100%;border:0;min-height:600px"
 *         loading="lazy">
 * </iframe>
 * <script src="https://YOUR-USERNAME.github.io/spd-gallery/resize-iframe.js"></script>
 *
 * Or inline version:
 *
 * <iframe id="spd-gallery"
 *         src="https://YOUR-USERNAME.github.io/spd-gallery/"
 *         style="width:100%;border:0;min-height:600px"
 *         loading="lazy">
 * </iframe>
 * <script>
 *   window.addEventListener("message", function(e) {
 *     if (e?.data?.type === "spd-gallery-height") {
 *       var iframe = document.getElementById("spd-gallery");
 *       if (iframe) {
 *         iframe.style.height = e.data.value + "px";
 *       }
 *     }
 *   });
 * </script>
 */

(function() {
  'use strict';

  // Configuration
  const IFRAME_ID = 'spd-gallery';
  const MESSAGE_TYPE = 'spd-gallery-height';
  const MIN_HEIGHT = 400;
  const MAX_HEIGHT = 10000;

  // Find the iframe
  function getIframe() {
    return document.getElementById(IFRAME_ID) ||
           document.querySelector('iframe[src*="spd-gallery"]');
  }

  // Handle resize messages
  function handleMessage(event) {
    // Security: Only accept messages from expected origin
    // Uncomment and configure if needed:
    // if (!event.origin.includes('github.io')) return;

    if (!event.data || event.data.type !== MESSAGE_TYPE) {
      return;
    }

    const iframe = getIframe();
    if (!iframe) {
      console.warn('SPD Gallery: iframe not found');
      return;
    }

    const height = parseInt(event.data.value, 10);

    // Validate height
    if (isNaN(height) || height < MIN_HEIGHT || height > MAX_HEIGHT) {
      console.warn('SPD Gallery: invalid height', height);
      return;
    }

    // Apply height with smooth transition
    iframe.style.transition = 'height 0.3s ease';
    iframe.style.height = height + 'px';
  }

  // Initialize
  function init() {
    window.addEventListener('message', handleMessage, false);

    // Set initial min-height
    const iframe = getIframe();
    if (iframe && !iframe.style.minHeight) {
      iframe.style.minHeight = MIN_HEIGHT + 'px';
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
