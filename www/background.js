// Background service worker for network fetches (MV3)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'fetchRss' && message.url) {
    fetch(message.url)
      .then(res => res.text())
      .then(text => sendResponse({ ok: true, text }))
      .catch(err => sendResponse({ ok: false, error: err?.message || String(err) }));
    return true; // keep the message channel open for async response
  }
});

