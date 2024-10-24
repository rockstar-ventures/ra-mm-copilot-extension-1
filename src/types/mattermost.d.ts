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
    export interface PluginRegistry {
        registerWebSocketEventHandler(event: string, handler: (message: any) => void): void;
        registerMessageWillBePostedHook(hook: (post: any) => Promise<{ post: any }>): void;
    }
}