const pluginID = 'zotstorage';

function error() {
  if (arguments[0] instanceof Error) {
    Zotero.logError(arguments[0]);
    return;
  }
  const m = [].slice
    .apply(arguments)
    .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
    .join(' ');
  Zotero.logError(new Error(`[${pluginID}] ${m}`));
}

function log() {
  const m = [].slice
    .apply(arguments)
    .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
    .join(' ');
  Zotero.log(`[${pluginID}] ${m}`);
}

// eslint-disable-next-line no-unused-vars
function install() {
  log('Installed 2.0');
}

/**
 * @param {Object} param0
 * @param {string} param0.id
 * @param {string} param0.version
 * @param {string} param0.rootURI
 */
// eslint-disable-next-line no-unused-vars
function startup({ id, version, rootURI }) {
  log('Starting 2.0');

  Zotero.PreferencePanes.register({
    pluginID,
    src: rootURI + 'preferences.xhtml',
    scripts: [rootURI + 'preferences.js'],
  });

  ZotStorage.init({ id, version, rootURI });
}

// eslint-disable-next-line no-unused-vars
function onMainWindowLoad({ window }) {}

// eslint-disable-next-line no-unused-vars
function onMainWindowUnload({ window }) {}

// eslint-disable-next-line no-unused-vars
function shutdown() {
  log('Shutting down 2.0');
  ZotStorage.removeFromAllWindows();
}

// eslint-disable-next-line no-unused-vars
function uninstall() {
  log('Uninstalled 2.0');
}

// ─── Main ────────────────────────────────────────────────────────────────────

var ZotStorage = (() => {
  return {
    id: null,
    version: null,
    rootURI: null,
    initialized: false,
    addedElementIDs: [],
    /**
     * @type {(()=>void)[]}
     */
    destroyCallBacks: [],

    init({ id, version, rootURI }) {
      log({ id, version, rootURI });
      if (this.initialized) return;
      this.id = id;
      this.version = version;
      this.rootURI = rootURI;
      this.initialized = true;
      this.addToAllWindows();
    },

    /**
     * @param {Window} window
     */
    addToWindow(window) {
      // Use Fluent for localization
      window.MozXULElement.insertFTLIfNeeded('zot-storage.ftl');

      const that = this;

      const doc = window.document;
      addToItemMenu(doc, doc.createXULElement('menuseparator'));

      /**
       * @type {Element}
       */
      const el = doc.createXULElement('menuitem');
      that.destroyCallBacks.push(() => {
        el.remove();
      });

      el.addEventListener('command', moveSelectedItems);
      el.setAttribute('data-l10n-id', 'move-and-rename');

      addToItemMenu(doc, el);
    },

    addToAllWindows() {
      var windows = Zotero.getMainWindows();
      for (let win of windows) {
        if (!win.ZoteroPane) continue;
        this.addToWindow(win);
      }
    },

    removeFromAllWindows() {
      log('remove all elements');
      this.destroyCallBacks.map((item) => item());
      this.destroyCallBacks = [];
    },
  };
})();

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @returns {Zotero.Item[]}
 */
function getAttachmentsOfSelectedItems() {
  const items = Zotero.getActiveZoteroPane().getSelectedItems();
  const result = [];

  items.map((item) => {
    if (item.isAttachment()) {
      result.push(item);
    } else {
      const ids = item.getAttachments();
      result.push(...Zotero.Items.get(ids));
    }
  });

  return result;
}

function moveSelectedItems() {
  const attachments = getAttachmentsOfSelectedItems();
  const targetDir = getLinkedDir();

  for (const a of attachments) {
    if (
      a.attachmentLinkMode !== Zotero.Attachments.LINK_MODE_IMPORTED_FILE &&
      a.attachmentLinkMode !== Zotero.Attachments.LINK_MODE_IMPORTED_URL
    ) {
      continue;
    }

    const originalPath = a.getFilePath();
    const targetPath = PathUtils.join(
      targetDir,
      PathUtils.filename(originalPath)
    );
    log(originalPath, targetPath);
    (async () => {
      const existed = await IOUtils.exists(targetPath);
      if (existed) {
        error(`failed to move attachment: ${targetPath} exists`);
        return;
      }
      const cloned = a.clone(null, { includeCollections: true });
      cloned.attachmentLinkMode = Zotero.Attachments.LINK_MODE_LINKED_FILE;
      cloned.attachmentPath = targetPath;
      cloned.setField('title', PathUtils.filename(targetPath));
      await IOUtils.move(originalPath, targetPath, {
        noOverwrite: true,
      });
      const id = await cloned.saveTx();
      // delete original one
      await a.eraseTx();
      Zotero.Fulltext.indexItems(id);
    })().catch((e) => {
      error(e);
    });
  }
}

/**
 * get user preference linked file folder
 * @returns {string}
 */
function getLinkedDir() {
  return Zotero.Prefs.get('extensions.zotero.baseAttachmentPath', true);
}

/**
 * add an element to item menu
 * @param {Document} doc
 * @param {Element} elm
 */
function addToItemMenu(doc, elm) {
  const zotero_itemmenu = doc.getElementById('zotero-itemmenu');
  zotero_itemmenu.appendChild(elm);
}
