import Plugin from './plugin';
import manifest from './manifest';

declare const React: typeof import('react');  // Add this declaration
declare const ReactDOM: typeof import('react-dom');  // Add this declaration

declare global {
    interface Window {
        registerPlugin(id: string, plugin: Plugin): void;
    }
}

window.registerPlugin(manifest.id, new Plugin());