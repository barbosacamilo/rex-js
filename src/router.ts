import { h } from "./h.js";
import type { Child, Component, Props } from "./types.js";

type RoutesConfig = Record<string, Component>;

const ROUTES = new Map<string, Component>();
let routerRoot: HTMLElement | null = null;

function setRoute(path: string, component: Component): void {
    ROUTES.set(path, component);
}

function setRoutes(config: RoutesConfig): void {
    ROUTES.clear();
    for (const [path, component] of Object.entries(config)) {
        setRoute(path, component);
    }
}

function getCurrentRouteFromHash(): string {
    // "" -> "/", "#/about" -> "/about"
    return location.hash.slice(1) || "/";
}

function ensureRouterRoot(): HTMLElement {
    if (!routerRoot) {
        throw new Error("Router not initialized. Call createRouter(...) first.");
    }
    return routerRoot;
}

function renderPage(route: string): void {
    const root = ensureRouterRoot();
    const component = ROUTES.get(route);

    if (!component) {
        root.replaceChildren(document.createTextNode("Not found"));
        return;
    }

    const node = component();
    root.replaceChildren(node);
}

export function navigate(path: string): void {
    // normalize: "about" -> "/about"
    if (!path.startsWith("/")) {
        path = `/${path}`;
    }
    // Changing the hash triggers "hashchange", which will call renderPage().
    location.hash = path;
}

export function Link(
    props: (Props<"a"> & { href?: string }) | null,
    ...children: Child[]
): HTMLElementTagNameMap["a"] {
    const href = props?.href ?? "/";

    const onClick = (e: MouseEvent) => {
        e.preventDefault();
        navigate(href);
    };

    const configuredProps: Props<"a"> = {
        ...(props ?? {}),
        href: `#${href}`,
        onclick: onClick
    };

    return h("a", configuredProps, ...children);
}

export function createRouter(
    root: HTMLElement,
    routes: RoutesConfig
): void {
    routerRoot = root;
    setRoutes(routes);

    const handleHashChange = () => {
        const route = getCurrentRouteFromHash();
        renderPage(route);
    };

    window.addEventListener("hashchange", handleHashChange);

    // Initial render
    handleHashChange();
}
