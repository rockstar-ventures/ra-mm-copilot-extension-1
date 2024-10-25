import Plugin from './plugin';
import manifest from './manifest';

declare const React: typeof import('react');  
declare const ReactDOM: typeof import('react-dom');

declare global {
    interface Window {
        registerPlugin(id: string, plugin: Plugin): void;
    }
}

window.registerPlugin(manifest.id, new Plugin());