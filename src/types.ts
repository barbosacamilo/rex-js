import { Ref } from "./ref.js";

export type Subscriber = () => void;

/**
 * Functional updater to derive the next value from the current one.
 */
export type Updater<T> = (curr: T) => T;

/**
 * Native DOM properties for a given tag.
 */
export type Props<K extends keyof HTMLElementTagNameMap> =
    Partial<HTMLElementTagNameMap[K]>;

/**
 * "Hole" = values that should render as "nothing".
 * Useful to allow expressions like condition && <child/>.
 */
export type Hole = boolean | null | undefined;

/**
 * What can appear as a child in your UI tree.
 *
 * - string | number: rendered as text nodes
 * - Ref<any>: reactive values that h()/appendChild know how to handle
 * - Hole: treated as "no child"
 * - Node: real DOM nodes (HTMLElement, Text, DocumentFragment, etc.)
 */
export type Child = string | number | Ref<any> | Hole | Node;

/**
 * Minimal component type: just a function returning a DOM Node.
 */
export type Component = () => Node;
