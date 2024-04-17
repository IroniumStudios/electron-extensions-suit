import { PROTOCOL_SCHEME } from '../constants';
import { randomId } from './string';
import { ipcMain } from 'electron';

// Check if the given WebContents object is a background page
export const isBackgroundPage = (wc: Electron.WebContents) =>
  // Using wc.getType() to check if the WebContents is of type 'backgroundPage'
  wc.getType() === 'backgroundPage';

// Send a message to a WebContents object and return a promise that resolves with the response
export const webContentsInvoke = (
  wc: Electron.WebContents,
  channel: string,
  ...args: any[]
): Promise<any> =>
  new Promise((resolve) => {
    const id = randomId();

    // Listen for a response from the WebContents
    ipcMain.once(`${channel}-${id}`, (e: any, ...a: any[]) => resolve(...a));

    // Send the message to the WebContents with an ID
    wc.send(channel, ...args, id);
  });