import Plugin from './plugin';
import manifest from './manifest';

declare const React: typeof import('react');  
declare const ReactDOM: typeof import('react-dom');

declare global {
    interface Window {
        registerPlugin(id: string, plugin: Plugin): void;
        React: typeof import('react');
        ReactDOM: typeof import('react-dom');
    }
}

window.registerPlugin(manifest.id, new Plugin());