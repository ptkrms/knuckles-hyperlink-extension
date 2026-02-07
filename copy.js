// Service Worker - Knuckles Hyperlinks
// Responsável por capturar a aba ativa e delegar a cópia do hyperlink
// para o documento offscreen (Manifest V3)

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.url || !tab.title) {
    showNotification(
      'Erro',
      'Não foi possível obter informações da aba ativa.'
    );
    return;
  }

  try {
    await copyLinkToClipboard(tab.url, tab.title);
    showNotification(
      'Link copiado',
      `"${tab.title}" foi copiado para a área de transferência`
    );
  } catch (error) {
    console.error('Erro ao copiar link:', error);
    showNotification(
      'Erro',
      'Não foi possível copiar o link.'
    );
  }
});

// =========================
// Offscreen Document Logic
// =========================

let offscreenCreating = null;

async function ensureOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL('offscreen.html');

  const existing = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl],
  });

  if (existing.length > 0) {
    return;
  }

  if (!offscreenCreating) {
    offscreenCreating = chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['CLIPBOARD'],
      justification: 'Copy hyperlink to clipboard',
    });
  }

  await offscreenCreating;
  offscreenCreating = null;
}

async function copyLinkToClipboard(url, title) {
  await ensureOffscreenDocument();

  return chrome.runtime.sendMessage({
    type: 'COPY_HYPERLINK',
    payload: {
      url,
      title,
    },
  });
}

// =========================
// Notifications
// =========================

function showNotification(title, message) {
  chrome.permissions.request(
    { permissions: ['notifications'] },
    (granted) => {
      if (!granted) return;

      chrome.notifications.create({
        type: 'basic',
        title,
        message,
        iconUrl: 'icon.png',
      });
    }
  );
}
