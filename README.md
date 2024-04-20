# electron-extensions-suit

### Notice
   this project is a fork of the electron-extensions package, read the legal-stuff.md file for me info.

`electron-extensions` will allow you to use Chrome extensions APIs with Electron.

# Installation

```bash
$ npm install electron-extensions-suit
```

# Usage

The library is really easy-to-use. All you have to do is to put the following code in your main process:

```typescript
import { ExtensibleSession } from 'electron-extensions/main';
import { app } from 'electron';

const extensions = new ExtensibleSession();

(async () => {
  await app.whenReady();
  extensions.loadExtension('C:/.../abcdefghijklmnoprstuwxyz'); // Path to the extension to load
})();
```

# Documentation

## Class `ExtensibleSession` `main`

### `new ExtensibleSession(options: IOptions)`

- `options` object
  - `partition` string - By default `null`. It's used for injecting preloads to
    load `content_scripts` in all webContents within a given Electron `session`. Must be called in `app` `ready` event.
  - `preloadPath` string - Path to content preload script. The option can be useful for bundlers like `webpack` if you're using `CopyWebpackPlugin`.
  - `blacklist` string[] - List of URLs or glob patterns preventing from injecting `content_scripts` to. For example `[wexond://*/*]`.

It's only for the main process. It's used to load extensions and handle their events.

### Instance methods

#### `loadExtension(path: string)`

Loads an extension from a given path.

#### `addWindow(window: Electron.BrowserWindow)`

Adds a BrowserWindow to send and observe UI related events such as

- `chrome.browserAction.onClicked`

### Instance properties

#### `blacklist` string[]

List of URLs or glob patterns preventing from injecting `content_scripts` to. For example `[wexond://*]`.

### Events

#### `set-badge-text`

Emitted when `chrome.browserAction.setBadgeText` has been called in an extension.

Returns:

- `extensionId` string
- `details` chrome.browserAction.BadgeTextDetails

#### `create-tab`

Emitted when `chrome.tabs.create` has been called in an extension.

##### Example:

```typescript
import { extensionsRenderer } from 'electron-extensions';

extensionsRenderer.on('create-tab', (details, callback) => {
  const tab = createTab(details); // Some create tab method...
  callback(tab.id);
});
```

#### More Complex Example withen the window-service.ts file:

```typescript
import { AppWindow } from './windows/app';
import { extensions } from 'electron-extensions-suit';
import { app, BrowserWindow, ipcMain } from 'electron';
import { SessionsService } from './sessions-service';

export class WindowsService {
  public list: AppWindow[] = [];

  public current: AppWindow;

  public lastFocused: AppWindow;

  constructor() {
    if (process.env.ENABLE_EXTENSIONS) {
      extensions.tabs.on('activated', (tabId, windowId, focus) => {
        const win = this.list.find((x) => x.id === windowId);
        win.viewManager.select(tabId, focus === undefined ? true : focus);
      });

      extensions.tabs.onCreateDetails = (tab, details) => {
        const win = this.findByWebContentsView(tab.id);
        details.windowId = win.id;
      };

      extensions.windows.onCreate = async (details) => {
        return this.open(details.incognito).id;
      };

      extensions.tabs.onCreate = async (details) => {
        const win =
          this.list.find((x) => x.id === details.windowId) || this.lastFocused;

        if (!win) return -1;

        const view = win.viewManager.create(details);
        return view.id;
      };
    }

    ipcMain.handle('get-tab-zoom', (e, tabId) => {
      return this.findByWebContentsView(tabId).viewManager.views.get(tabId)
        .webContents.zoomFactor;
    });
  }

  public open(incognito = false) {
    const window = new AppWindow(incognito);
    this.list.push(window);

    if (process.env.ENABLE_EXTENSIONS) {
      extensions.windows.observe(window.win);
    }

    window.win.on('focus', () => {
      this.lastFocused = window;
    });

    return window;
  }

  public findByWebContentsView(webContentsId: number) {
    return this.list.find((x) => !!x.viewManager.views.get(webContentsId));
  }

  public fromBrowserWindow(browserWindow: BrowserWindow) {
    return this.list.find((x) => x.id === browserWindow.id);
  }

  public broadcast(channel: string, ...args: unknown[]) {
    this.list.forEach((appWindow) =>
      appWindow.win.webContents.send(channel, ...args),
    );
  }
}
```

Returns:

- `details` chrome.tabs.CreateProperties
- `callback` (tabId: number) => void - Must be called with the created tab id as an argument. Also, the `tabId` must be the same as any attached `webContents` id

## Object `extensionsRenderer`

### Usage in `renderer`

```typescript
import { extensionsRenderer } from 'electron-extensions/renderer';
```

### Instance methods

#### `browserAction.onClicked(extensionId: string, tabId: number)`

Emits `chrome.browserAction.onClicked` event in a given extension.
