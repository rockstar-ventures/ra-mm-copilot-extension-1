import Plugin from './plugin';
declare global {
    interface Window {
        registerPlugin(id: string, plugin: Plugin): void;
    }
}
