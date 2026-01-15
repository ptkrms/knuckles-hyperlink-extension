// ============================================================
// Chrome Extension - Hyperlink Copier (Versão Refatorada)
// Autor: [Seu Nome]
// Objetivo: Copiar links de abas abertas no Chrome para a área de transferência
// Funcionalidades: Copiar como texto simples ou como link enriquecido (HTML)
// ============================================================

// IDs dos menus de contexto
const COPY_AS_PLAIN_MENU_ITEM_ID = 'copy-as-plain';
const COPY_LINK_MENU_ITEM_ID = 'copy-as-html';

// ------------------------------
// Inicializa os menus de contexto
// ------------------------------
chrome.contextMenus.removeAll(); // Remove menus antigos para evitar duplicação

// Menu: Copiar como texto simples
chrome.contextMenus.create({
  id: COPY_AS_PLAIN_MENU_ITEM_ID,
  title: "Copy as Plain Text",
  contexts: ["action"]
});

// Menu: Copiar como link enriquecido (HTML)
chrome.contextMenus.create({
  id: COPY_LINK_MENU_ITEM_ID,
  title: "Copy Link as Rich Text",
  contexts: ["action"]
});

// ------------------------------
// Ação ao clicar em um item de menu
// ------------------------------
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case COPY_AS_PLAIN_MENU_ITEM_ID:
      copyTabLinkToClipboard(tab, false); // texto simples
      break;

    case COPY_LINK_MENU_ITEM_ID:
      copyTabLinkToClipboard(tab, true); // link HTML
      break;

    default:
      console.error('Menu item desconhecido: ' + info.menuItemId);
  }
});

// ------------------------------
// Ação ao clicar no botão da extensão
// ------------------------------
chrome.action.onClicked.addListener(function(tab) {
  copyTabLinkToClipboard(tab, true); // padrão: link HTML
});

// ------------------------------
// Atalhos do teclado
// ------------------------------
chrome.commands.onCommand.addListener(function(command) {
  getActiveTab(function(tab) {
    switch (command) {
      case 'copy-link':
        copyTabLinkToClipboard(tab, true);
        break;

      case 'copy-as-plain':
        copyTabLinkToClipboard(tab, false);
        break;

      default:
        console.error('Comando desconhecido: ' + command);
    }
  });
});

// ------------------------------
// Função para obter a aba ativa
// ------------------------------
function getActiveTab(callback) {
  chrome.tabs.query({ lastFocusedWindow: true, active: true }, function(tabs) {
    if (tabs && tabs.length > 0) {
      callback(tabs[0]);
    } else {
      showNotification('Erro', 'Nenhuma aba ativa encontrada.');
    }
  });
}

// ------------------------------
// Função para exibir notificações
// ------------------------------
function showNotification(title, message) {
  chrome.permissions.request({ permissions: ['notifications'] }, function(granted) {
    if (granted) {
      chrome.notifications.create('', {
        type: 'basic',
        title: title,
        message: message,
        iconUrl: 'icon.png' // Certifique-se de ter o ícone
      });
    } else {
      console.log('Permissão de notificações negada. Mensagem não exibida.');
    }
  });
}

// ------------------------------
// Documento offscreen para copiar conteúdo
// ------------------------------
let offscreenDocumentCreating; // Garante que só um documento seja criado por vez

async function setupOffscreenDocument(path) {
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) return; // Já existe

  if (offscreenDocumentCreating) {
    await offscreenDocumentCreating;
  } else {
    offscreenDocumentCreating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['CLIPBOARD'],
      justification: 'Copiar link para área de transferência'
    });
    await offscreenDocumentCreating;
    offscreenDocumentCreating = null;
  }
}

// ------------------------------
// Função para enviar link ao offscreen document
// ------------------------------
async function copyToOffscreenClipboard(url, title, as_html) {
  await setupOffscreenDocument('offscreen.html');
  await chrome.runtime.sendMessage({
    type: 'copyToClipboard',
    target: 'offscreen-document',
    url: url,
    title: title,
    as_html: as_html
  });
}

// ------------------------------
// Função principal de cópia de link
// ------------------------------
function copyTabLinkToClipboard(tab, as_html) {
  const url = tab.url;
  const title = tab.title;

  console.log('Copiando para a área de transferência:', url, title);

  copyToOffscreenClipboard(url, title, as_html)
    .then(() => {
      showNotification('Link copiado!', `"${title}" foi copiado para a área de transferência.`);
    })
    .catch(error => {
      showNotification('Erro ao copiar', 'Não foi possível copiar o link.');
      console.error('Erro ao copiar via offscreen:', error);
    });
}
