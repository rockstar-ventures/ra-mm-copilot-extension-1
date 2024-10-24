import { Store } from 'redux';
import { GlobalState } from 'mattermost-redux/types/store';
import { PluginRegistry } from 'mattermost-redux/types/plugins';
export default class Plugin {
    private originalFetch;
    initialize(registry: PluginRegistry, store: Store<GlobalState>): Promise<void>;
    private handleCopilotRequest;
    private getMattermostContext;
    private transformResponse;
}
