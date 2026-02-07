// Offscreen Document Script - Knuckles Hyperlinks
// Responsável exclusivamente por copiar o hyperlink para a área de transferência

function copyHyperlinkToClipboard(url, title) {
  const link = document.createElement('a');
  link.href = url;
  link.textContent = title;

  document.body.appendChild(link);

  try {
    link.focus();
    document.execCommand('selectAll');
    document.execCommand('copy');
    return true;
  } catch (error) {
    console.error('Failed to copy hyperlink:', error);
    return false;
  } finally {
    link.remove();
  }
}

// Listener de mensagens vindas do Service Worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'COPY_HYPERLINK') {
    return;
  }

  const { url, title } = message.payload;

  const success = copyHyperlinkToClipboard(url, title);
  sendResponse({ success });
});
