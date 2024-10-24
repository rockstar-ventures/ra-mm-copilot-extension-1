declare module 'mattermost-redux/types/store' {
    export interface GlobalState {
        entities: {
            teams: {
                currentTeamId: string;
            };
            channels: {
                currentChannelId: string;
            };
            users: {
                currentUserId: string;
            };
        };
    }
}

declare module 'mattermost-redux/types/plugins' {
    import { Store } from 'redux';
    import { GlobalState } from 'mattermost-redux/types/store';

    export interface PluginRegistry {
        registerWebSocketEventHandler(event: string, handler: (message: any) => void): void;
        registerMessageWillBePostedHook(hook: (post: any) => Promise<{ post: any }>): void;
    }
}

// Add Window augmentation for globals
declare global {
    interface Window {
        registerPlugin(id: string, plugin: any): void;
        store: {
            getState(): any;
        };
    }
}