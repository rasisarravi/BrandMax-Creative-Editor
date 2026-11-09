/* Browser-local project storage. Files and Blobs are retained by IndexedDB. */
(() => {
  'use strict';
  const NAME = 'brandmax-creative-projects';
  let databasePromise;
  const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const nameFor = (value, fallback) => String(value ?? '').trim() || fallback;

  function openDatabase() {
    if (databasePromise) return databasePromise;
    if (!globalThis.indexedDB) return Promise.reject(new Error('Project storage is unavailable in this browser.'));
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('projects')) {
          const projects = db.createObjectStore('projects', { keyPath: 'id' });
          projects.createIndex('folderId', 'folderId', { unique: false });
          projects.createIndex('deletedAt', 'deletedAt', { unique: false });
        }
        if (!db.objectStoreNames.contains('folders')) db.createObjectStore('folders', { keyPath: 'id' });
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => { db.close(); databasePromise = undefined; };
        resolve(db);
      };
      request.onerror = () => { databasePromise = undefined; reject(request.error || new Error('Project storage could not be opened.')); };
      request.onblocked = () => { databasePromise = undefined; reject(new Error('Close other BrandMax tabs, then try again.')); };
    });
    return databasePromise;
  }

  async function transact(names, mode, operation) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(names, mode);
      let result;
      let settled = false;
      transaction.oncomplete = () => { if (!settled) resolve(result); };
      transaction.onerror = () => { settled = true; reject(transaction.error || new Error('Project storage failed.')); };
      transaction.onabort = () => { settled = true; reject(transaction.error || new Error('Project storage was interrupted.')); };
      try { operation(transaction, (value) => { result = value; }); }
      catch (error) { settled = true; try { transaction.abort(); } catch (_) {} reject(error); }
    });
  }

  function get(id) {
    return transact(['projects'], 'readonly', (tx, setResult) => {
      tx.objectStore('projects').get(id).onsuccess = (event) => setResult(event.target.result || null);
    });
  }
  function list(options = {}) {
    return transact(['projects'], 'readonly', (tx, setResult) => {
      tx.objectStore('projects').getAll().onsuccess = (event) => {
        const records = event.target.result.filter((project) => {
          if (options.onlyTrashed) { if (!project.deletedAt) return false; }
          else if (!options.includeTrashed && project.deletedAt) return false;
          if (Object.prototype.hasOwnProperty.call(options, 'folderId')) {
            return (project.folderId ?? null) === (options.folderId ?? null);
          }
          return true;
        });
        records.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        setResult(records);
      };
    });
  }
  function save(project) {
    if (!project || typeof project !== 'object' || Array.isArray(project)) throw new TypeError('A project object is required.');
    const id = project.id || makeId();
    const now = Date.now();
    return transact(['projects'], 'readwrite', (tx, setResult) => {
      const projects = tx.objectStore('projects');
      projects.get(id).onsuccess = (event) => {
        const previous = event.target.result;
        const record = {
          ...previous, ...project, id,
          name: nameFor(project.name ?? previous?.name, 'Untitled project'),
          folderId: project.folderId === undefined ? (previous?.folderId ?? null) : project.folderId,
          createdAt: previous?.createdAt || project.createdAt || now,
          updatedAt: now,
          deletedAt: project.deletedAt === undefined ? (previous?.deletedAt ?? null) : project.deletedAt,
          data: project.data === undefined ? (previous?.data ?? {}) : project.data,
        };
        projects.put(record);
        setResult(record);
      };
    });
  }
  // Refresh only an old low-resolution thumbnail. Keep the project's edit
  // timestamp and editable data untouched, and do not overwrite a newer save.
  function upgradePreview(id, expectedUpdatedAt, preview) {
    return transact(['projects'], 'readwrite', (tx, setResult) => {
      const projects = tx.objectStore('projects');
      projects.get(id).onsuccess = (event) => {
        const current = event.target.result;
        if (!current || current.updatedAt !== expectedUpdatedAt) { setResult(false); return; }
        projects.put({ ...current, preview });
        setResult(true);
      };
    });
  }
  function changeProject(id, change) {
    return transact(['projects'], 'readwrite', (tx, setResult) => {
      const projects = tx.objectStore('projects');
      projects.get(id).onsuccess = (event) => {
        const current = event.target.result;
        if (!current) { tx.abort(); return; }
        const updated = { ...current, ...change(current), updatedAt: Date.now() };
        projects.put(updated);
        setResult(updated);
      };
    });
  }
  async function duplicate(id) {
    const original = await get(id);
    if (!original) throw new Error('Project was not found.');
    return save({ ...original, id: makeId(), name: `${original.name} (copy)`, createdAt: undefined, updatedAt: undefined, deletedAt: null });
  }
  const rename = (id, name) => changeProject(id, () => ({ name: nameFor(name, 'Untitled project') }));
  const setFavorite = (id, favorite) => changeProject(id, () => ({ favorite: Boolean(favorite) }));
  const moveToFolder = (id, folderId) => changeProject(id, () => ({ folderId: folderId ?? null }));
  const trash = (id) => changeProject(id, () => ({ deletedAt: Date.now() }));
  const restore = (id) => changeProject(id, () => ({ deletedAt: null }));
  const permanentDelete = (id) => transact(['projects'], 'readwrite', (tx) => { tx.objectStore('projects').delete(id); });
  // Delete only the exact Trash items the user confirmed. A project restored
  // in another tab before this transaction is protected by the deletedAt check.
  function permanentDeleteTrashed(ids) {
    const targets = [...new Set(Array.isArray(ids) ? ids.filter(id => typeof id === 'string' && id) : [])];
    if (!targets.length) return Promise.resolve(0);
    return transact(['projects'], 'readwrite', (tx, setResult) => {
      const projects = tx.objectStore('projects');
      let deleted = 0;
      setResult(0);
      targets.forEach(id => {
        projects.get(id).onsuccess = (event) => {
          if (!event.target.result?.deletedAt) return;
          projects.delete(id);
          setResult(++deleted);
        };
      });
    });
  }
  const listFolders = () => transact(['folders'], 'readonly', (tx, setResult) => {
    tx.objectStore('folders').getAll().onsuccess = (event) => setResult(event.target.result.sort((a, b) => a.name.localeCompare(b.name)));
  });
  function createFolder(name) {
    const now = Date.now();
    const folder = { id: makeId(), name: nameFor(name, 'New folder'), createdAt: now, updatedAt: now };
    return transact(['folders'], 'readwrite', (tx, setResult) => { tx.objectStore('folders').add(folder); setResult(folder); });
  }
  function renameFolder(id, name) {
    return transact(['folders'], 'readwrite', (tx, setResult) => {
      const folders = tx.objectStore('folders');
      folders.get(id).onsuccess = (event) => {
        const current = event.target.result;
        if (!current) { tx.abort(); return; }
        const updated = { ...current, name: nameFor(name, 'New folder'), updatedAt: Date.now() };
        folders.put(updated);
        setResult(updated);
      };
    });
  }
  function setFolderFavorite(id, favorite) {
    return transact(['folders'], 'readwrite', (tx, setResult) => {
      const folders = tx.objectStore('folders');
      folders.get(id).onsuccess = (event) => {
        const current = event.target.result;
        if (!current) { tx.abort(); return; }
        const updated = { ...current, favorite: Boolean(favorite), updatedAt: Date.now() };
        folders.put(updated);
        setResult(updated);
      };
    });
  }
  function deleteFolder(id) {
    return transact(['folders', 'projects'], 'readwrite', (tx) => {
      const folders = tx.objectStore('folders');
      const projects = tx.objectStore('projects');
      folders.get(id).onsuccess = (event) => {
        if (!event.target.result) { tx.abort(); return; }
        projects.index('folderId').getAll(id).onsuccess = (projectEvent) => {
          for (const project of projectEvent.target.result) projects.put({ ...project, folderId: null, updatedAt: Date.now() });
          folders.delete(id);
        };
      };
    });
  }
  async function usage() {
    if (!navigator.storage?.estimate) return { usage: null, quota: null };
    const estimate = await navigator.storage.estimate();
    return { usage: estimate.usage ?? null, quota: estimate.quota ?? null };
  }
  window.BrandMaxProjectStore = Object.freeze({ list, get, save, upgradePreview, duplicate, rename, setFavorite, moveToFolder, trash, restore, permanentDelete, permanentDeleteTrashed,
    listFolders, createFolder, renameFolder, setFolderFavorite, deleteFolder, usage });
})();
