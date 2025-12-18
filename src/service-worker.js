
    // Based off of https://github.com/pwa-builder/PWABuilder/blob/main/docs/sw.js

    /*
      Welcome to our basic Service Worker! This Service Worker offers a basic offline experience
      while also being easily customizeable. You can add in your own code to implement the capabilities
      listed below, or change anything else you would like.


      Need an introduction to Service Workers? Check our docs here: https://docs.pwabuilder.com/#/home/sw-intro
      Want to learn more about how our Service Worker generation works? Check our docs here: https://docs.pwabuilder.com/#/studio/existing-app?id=add-a-service-worker

      Did you know that Service Workers offer many more capabilities than just offline? 
        - Background Sync: https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/advanced-capabilities/06
        - Periodic Background Sync: https://web.dev/periodic-background-sync/
        - Push Notifications: https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/advanced-capabilities/07?id=push-notifications-on-the-web
        - Badges: https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/advanced-capabilities/07?id=application-badges
    */

    const HOSTNAME_WHITELIST = [
        self.location.hostname,
        'fonts.gstatic.com',
        'fonts.googleapis.com',
        'cdn.jsdelivr.net'
    ]

    // The Util Function to hack URLs of intercepted requests
    const getFixedUrl = (req) => {
        var now = Date.now()
        var url = new URL(req.url)

        // 1. fixed http URL
        // Just keep syncing with location.protocol
        // fetch(httpURL) belongs to active mixed content.
        // And fetch(httpRequest) is not supported yet.
        url.protocol = self.location.protocol

        // 2. add query for caching-busting.
        // Github Pages served with Cache-Control: max-age=600
        // max-age on mutable content is error-prone, with SW life of bugs can even extend.
        // Until cache mode of Fetch API landed, we have to workaround cache-busting with query string.
        // Cache-Control-Bug: https://bugs.chromium.org/p/chromium/issues/detail?id=453190
        if (url.hostname === self.location.hostname) {
            url.search += (url.search ? '&' : '?') + 'cache-bust=' + now
        }
        return url.href
    }

    /**
     *  @Lifecycle Activate
     *  New one activated when old isnt being used.
     *
     *  waitUntil(): activating ====> activated
     */
    self.addEventListener('activate', event => {
      event.waitUntil(self.clients.claim())
    })

    /**
     *  @Functional Fetch
     *  All network requests are being intercepted here.
     *
     *  void respondWith(Promise<Response> r)
     */
    self.addEventListener('fetch', event => {
    // Skip some of cross-origin requests, like those for Google Analytics.
    if (HOSTNAME_WHITELIST.indexOf(new URL(event.request.url).hostname) > -1) {
        // Stale-while-revalidate
        // similar to HTTP's stale-while-revalidate: https://www.mnot.net/blog/2007/12/12/stale
        // Upgrade from Jake's to Surma's: https://gist.github.com/surma/eb441223daaedf880801ad80006389f1
        const cached = caches.match(event.request)
        const fixedUrl = getFixedUrl(event.request)
        const fetched = fetch(fixedUrl, { cache: 'no-store' })
        const fetchedCopy = fetched.then(resp => resp.clone())

        // Call respondWith() with whatever we get first.
        // If the fetch fails (e.g disconnected), wait for the cache.
        // If there’s nothing in cache, wait for the fetch.
        // If neither yields a response, return offline pages.
        event.respondWith(
        Promise.race([fetched.catch((cached) => cached), cached])
            .then(resp => resp || fetched)
            .catch((error) => { console.log(error); /* eat any errors */ })
        )

        // Update the cache with the version we fetched (only for ok status)
        event.waitUntil(
        Promise.all([fetchedCopy, caches.open("pwa-cache")])
            .then(([response, cache]) => response.ok && cache.put(event.request, response))
            .catch((error) => {console.log(error); /* eat any errors */ })
        )
    }
    })


/* --------------------------------------------------------------------------
   Notification & Background sync helpers
   - Handles messages from clients (save task, show notification)
   - Supports Push API (server-sent) and Background Sync / Periodic Sync
   - Uses a small IndexedDB store "todo-db" / "tasks" to persist scheduled tasks
   Note: For reliable background notifications when the app is closed, use the
   Push API from a server that sends a push at the scheduled time.
   -------------------------------------------------------------------------- */

const DB_NAME = 'todo-db';
const DB_VERSION = 1;
const STORE_NAME = 'tasks';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveTask(task) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(task);
    return tx.complete;
  } catch (err) {
    console.error('saveTask error', err);
  }
}

async function getDueTasks(now = Date.now()) {
  const result = [];
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.openCursor();
    return await new Promise((resolve) => {
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          const item = cursor.value;
          // item.datetime is expected to be an ISO string or timestamp
          const itemTime = typeof item.datetime === 'number' ? item.datetime : new Date(item.datetime).getTime();
          if (!itemTime || itemTime <= now) {
            result.push(item);
          }
          cursor.continue();
        } else {
          resolve(result);
        }
      };
      req.onerror = () => resolve(result);
    });
  } catch (err) {
    console.error('getDueTasks error', err);
    return result;
  }
}

async function deleteTask(id) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    return tx.complete;
  } catch (err) {
    console.error('deleteTask error', err);
  }
}

async function checkAndNotify() {
  const now = Date.now();
  const dueTasks = await getDueTasks(now);
  if (dueTasks.length === 0) return;

  const notifications = dueTasks.map(async (task) => {
    const title = task.title || 'Task Reminder';
    const options = task.options || {
      body: `Please complete the task: ${task.task || ''}`,
      icon: task.icon || '/pwa-48x48.png',
      badge: task.badge || '/pwa-48x48.png',
      tag: `task-${task.id}`,
      data: { url: task.url || '/' }
    };

    await self.registration.showNotification(title, options);
    await deleteTask(task.id);
  });

  await Promise.all(notifications);
}

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !data.type) return;
  if (data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = data;
    event.waitUntil(self.registration.showNotification(title, options));
  } else if (data.type === 'SAVE_TASK') {
    // Expect task to contain { id, task, datetime, title?, options? }
    const task = data.task;
    if (task && task.id) {
      saveTask(task);
    }
  } else if (data.type === 'SYNC_NOW') {
    event.waitUntil(checkAndNotify());
  }
});

self.addEventListener('push', (event) => {
  const payload = event.data ? (event.data.json ? event.data.json() : JSON.parse(event.data.text())) : {};
  const title = payload.title || 'Task Reminder';
  const options = payload.options || {
    body: payload.body || (payload.task ? `Reminder: ${payload.task}` : 'You have a scheduled task'),
    icon: payload.icon || '/pwa-48x48.png',
    badge: payload.badge || '/pwa-48x48.png',
    data: payload.data || { url: '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(checkAndNotify());
  }
});

self.addEventListener('periodicsync', (event) => {
  // Requires Periodic Background Sync support and registration from the client
  if (event.tag === 'task-check') {
    event.waitUntil(checkAndNotify());
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = (event.notification && event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

