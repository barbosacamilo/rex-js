import { Ref } from "./ref.js";
import type { Child, Hole, Props } from "./types.js";

type UnmountFn = () => void;

const cleanupFns = new Set<UnmountFn>();

export function runAllCleanups(): void {
    for (const fn of cleanupFns) {
        try {
            fn();
        } catch {}
    }
    cleanupFns.clear();
}

function onUnmount(fn: UnmountFn): void {
    cleanupFns.add(fn);
}

function isHole(v: unknown): v is Hole {
    return v == null || typeof v === "boolean";
}

function setProps<K extends keyof HTMLElementTagNameMap>(
    el: HTMLElementTagNameMap[K],
    props?: Props<K> | null
): void {
    if (!props) return;

    for (const [name, value] of Object.entries(props)) {
        if (value == null) continue;

        if (name === "style") {
            if (typeof value === "string") {
                el.setAttribute("style", value);
            } else if (typeof value === "object") {
                Object.assign(el.style, value);
            } else {
                throw new Error("Invalid value for 'props.style'");
            }
            continue;
        }

        if (name.startsWith("on") && typeof value === "function") {
            const type = name.slice(2).toLowerCase();
            const listener = value as EventListener;
            el.addEventListener(type, listener);
            onUnmount(() => el.removeEventListener(type, listener));
            continue;
        }

        if (name in el) {
            (el as any)[name] = value;
        } else {
            el.setAttribute(name, String(value));
        }
    }
}

function appendChild(parent: Node, child: Child): void {
    if (isHole(child)) return;

    if (child instanceof Ref) {
        appendRefChild(parent, child);
        return;
    }

    if (child instanceof Node) {
        parent.appendChild(child);
        return;
    }

    parent.appendChild(document.createTextNode(String(child)));
}

function appendRefChild(parent: Node, ref: Ref<unknown>): void {
    const textNode = document.createTextNode("");
    parent.appendChild(textNode);

    const render = () => {
        const v = ref.get();
        textNode.textContent = isHole(v) ? "" : String(v);
    };

    render();

    ref.subscribe(render);
    onUnmount(() => ref.unsub(render));
}

function appendChildren(parent: Node, children: Child[]): void {
    for (const c of children) {
        appendChild(parent, c);
    }
}

export function h<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    props: Props<K> | null,
    ...children: Child[]
): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);
    setProps(el, props);
    appendChildren(el, children);
    return el;
}
