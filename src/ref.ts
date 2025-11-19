import { Subscriber, Updater } from "./types";

export class Ref<T> {
    private value: T;
    private readonly subs: Set<Subscriber> = new Set();

    constructor(value: T) {
        this.value = value;
    }

    get(): T {
        return this.value;
    }

    set(value: T | Updater<T>): T {
        let newValue: T;

        if (typeof value === "function") {
            const update = value as Updater<T>;
            newValue = update(this.value);
        } else {
            newValue = value;
        }

        if (Object.is(this.value, newValue)) {
            return this.value;
        }

        this.value = newValue;

        for (const fn of this.subs) {
            try {
                fn();
            } catch {
                // ignore fn() errors so others still run
            }
        }
        
        return this.value;
    }

    subscribe(fn: Subscriber) {
        this.subs.add(fn);
    }

    unsub(fn: Subscriber) {
        this.subs.delete(fn);
    }
}

export function ref<T>(value: T): Ref<T> {
    return new Ref(value);
}
