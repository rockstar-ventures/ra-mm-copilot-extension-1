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
        registerChannelHeaderButtonAction(
            icon: React.ReactElement,
            action: () => void,
            tooltipText: string,
            ariaLabel?: string
        ): void;
    }
}

declare global {
    interface Window {
        React: any;
        ReactDOM: any;
        registerPlugin(id: string, plugin: any): void;
        store: {
            getState(): any;
        };
    }
}