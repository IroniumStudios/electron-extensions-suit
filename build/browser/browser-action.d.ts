/// <reference types="node" />
import { EventEmitter } from 'events';
import { Session, Extension } from 'electron';

// Define IconType and IBrowserActionInfo interfaces

interface IBrowserAction extends IBrowserActionInfo {
    baseUrl: string;
    extensionId: string;
    tabs: Map<number, IBrowserAction>;
}

export declare interface BrowserActionAPI {
    on(event: 'updated', listener: (action: IBrowserAction) => void): this;
    on(event: 'loaded', listener: (action: IBrowserAction) => void): this;
    on(event: string, listener: Function): this;
}

export declare class BrowserActionAPI extends EventEmitter {
    private sessionActionMap;
    constructor();
    private getAllHandler;
    private getOrCreate;
    loadFromManifest(session: Session, extension: Extension): IBrowserAction; // Use Session and Extension types
    getAllInSession(session: Session): IBrowserAction[];
    getAllInTab(tabId: number): IBrowserAction[];
    onClicked(extensionId: string): void;
}

export {};