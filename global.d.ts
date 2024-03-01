// type Win = {
//   ZoteroPane: Pane;
// };
// type Pane = {
//   getSelectedItems(): Item[];
// };

// // https://github.com/zotero/zotero/blob/cffb5cdd4b8db0a2124288cb48f6040555b31b3b/chrome/content/zotero/xpcom/data/item.js#L4733
// type Item = {
//   clone(libraryID: number, { skipTags: boolean, includeCollections: boolean });
//   isAttachment(): boolean;
//   getAttachments(): number[];
// };

// type Attachment = {
//   libraryID: number;
//   attachmentLinkMode: string;
// };

// declare var PathUtils: {
//   join(a: string, b: string): string;
//   filename(a: string): string;
// };

// declare var IOUtils: {
//   exists(file_path: string): Promise<boolean>;
//   move(source_path: string, dest_path: string): Promise<void>;
// };

// declare var Zotero: {
//   warn: typeof console.warn;
//   debug: typeof console.debug;
//   log: typeof console.log;

//   getMainWindows(): Win[];
//   Prefs: {
//     /**
//      * get a preference's value
//      * @param id preference id
//      * @param global if false, add name prefix `extensions.zotero.` or not
//      */
//     get(id: string, global: boolean): string;
//   };
//   PreferencePanes: {
//     register(info: { pluginID: string; src: string; scripts: string[] }): void;
//   };

//   getActiveZoteroPane(): Pane;

//   Items: {
//     get(idList: number[]): Attachment[];
//   };

//   Libraries: {
//     userLibraryID: number;
//   };

//   Attachments: {
//     LINK_MODE_EMBEDDED_IMAGE: 4;
//     LINK_MODE_IMPORTED_FILE: 0;
//     LINK_MODE_IMPORTED_URL: 1;
//     LINK_MODE_LINKED_FILE: 2;
//     LINK_MODE_LINKED_URL: 3;
//   };
// };

// declare var Services: {
//   scriptloader: {
//     loadSubScript(url: string): void;
//   };
// };
