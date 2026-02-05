/**
 * Simple Hash-based Router for PM Dashboard
 */

const Router = {
    routes: {},
    currentRoute: null,

    init() {
        window.addEventListener('hashchange', () => this.handleRouteChange());
        window.addEventListener('load', () => this.handleRouteChange());
    },

    register(path, handler) {
        this.routes[path] = handler;
    },

    handleRouteChange() {
        const hash = window.location.hash.slice(1) || '/';
        const { handler, params } = this.matchRoute(hash);

        if (handler) {
            this.currentRoute = hash;
            handler(params);
        } else {
            this.navigate('/');
        }
    },

    matchRoute(path) {
        if (this.routes[path]) {
            return { handler: this.routes[path], params: {} };
        }

        for (const [pattern, handler] of Object.entries(this.routes)) {
            const regex = this.patternToRegex(pattern);
            const match = path.match(regex);

            if (match) {
                const params = this.extractParams(pattern, match);
                return { handler, params };
            }
        }

        return { handler: null, params: {} };
    },

    patternToRegex(pattern) {
        const regexPattern = pattern
            .replace(/\//g, '\\/')
            .replace(/:([^/]+)/g, '([^/]+)');
        return new RegExp(`^${regexPattern}$`);
    },

    extractParams(pattern, match) {
        const params = {};
        const paramNames = pattern.match(/:([^/]+)/g) || [];

        paramNames.forEach((name, index) => {
            params[name.slice(1)] = match[index + 1];
        });

        return params;
    },

    navigate(path) {
        window.location.hash = path;
    },

    getCurrentRoute() {
        return this.currentRoute;
    }
};

function navigateTo(path) {
    Router.navigate(path);
}
