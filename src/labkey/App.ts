type OnInitCallback<CTX> = (target: string, ctx: CTX) => void;

interface AppRegistryItem<CTX = any> {
    appName: string;
    contexts: CTX[];
    hot: boolean;
    onInit: OnInitCallback<CTX>;
    targets: string[];
}

type AppRegistry = {
    isDOMContentLoaded: boolean;
    registry: { [appName: string]: AppRegistryItem };
};

/**
 * @hidden
 * @private
 */
declare const LABKEY: any;

/**
 * Returns the App registry shared across all "instances" of @labkey/api.
 * @hidden
 * @private
 */
function getRegistry(): AppRegistry {
    if (!LABKEY.App.__app__) {
        throw new Error('App registry not initialized. Must call init() prior to getRegistry()');
    }
    return LABKEY.App.__app__;
}

/**
 * Attaches the App registry to a global namespace. This registry must be shared across
 * "instances" of @labkey/api so this method is defensive against subsequent calls.
 * @hidden
 * @private
 */
export function init(LABKEY: any) {
    // Hook loadApp and prepare global registry shared across apps
    if (LABKEY?.App) {
        // Defensively avoid redundant calls to init()
        if (!LABKEY.App.__app__) {
            LABKEY.App.__app__ = {
                isDOMContentLoaded: false,
                registry: {},
            };
        }
    } else {
        console.log('LABKEY.App is not available. Unable to initialize application registry.');
    }
}

/**
 * Load/initialize applications that are registered via [[registerApp]].
 * @param appName
 * @param appTarget
 * @param appContext
 */
export function loadApp<CTX = any>(appName: string, appTarget: string, appContext: CTX): void {
    const appRegistry = getRegistry();

    if (appRegistry.registry.hasOwnProperty(appName)) {
        if (appRegistry.registry[appName].hot) {
            appRegistry.registry[appName].contexts.push(appContext);
            appRegistry.registry[appName].targets.push(appTarget);
        }

        if (appRegistry.isDOMContentLoaded) {
            appRegistry.registry[appName].onInit(appTarget, appContext);
        } else {
            window.addEventListener(
                'DOMContentLoaded',
                () => {
                    appRegistry.isDOMContentLoaded = true;
                    appRegistry.registry[appName].onInit(appTarget, appContext);
                },
                { once: true }
            );
        }
    } else {
        throw Error(`Application "${appName}" is not a registered application. Unable to initialize.`);
    }
}

/**
 * Registers an app by "appName". When the app is requested to be loaded (via [[loadApp]]) the onInit()
 * callback will be invoked to initialize the app.
 * @param appName The unique name for this app type.
 * @param onInit Callback that will be invoked when the app is loaded.
 * @param hot If this app is running in a "hot" module reload context you'll want to set this to "true" so the
 * app can be properly initialized after module reloads.
 */
export function registerApp<CTX>(appName: string, onInit: OnInitCallback<CTX>, hot?: boolean): void {
    const appRegistry = getRegistry();

    if (!appRegistry.registry.hasOwnProperty(appName)) {
        appRegistry.registry[appName] = {
            appName,
            contexts: [],
            hot: hot === true,
            onInit,
            targets: [],
        };
    } else if (appRegistry.registry[appName].hot) {
        runHot(appRegistry.registry[appName]);
    }
}

/**
 * @hidden
 * @private
 */
function runHot(item: AppRegistryItem): void {
    if (!item.hot) {
        throw Error(`Attempting to run application ${item.appName} hot when hot is not enabled.`);
    }

    if (item.targets.length !== item.contexts.length) {
        throw Error(
            `Application registry for "${item.appName}" is in an invalid state. Expected targets and contexts to align.`
        );
    }

    for (let i = 0; i < item.targets.length; i++) {
        item.onInit(item.targets[i], item.contexts[i]);
    }
}