export type ContextType = {
    ctxDeepEqual: (left: unknown, right: unknown) => boolean;
};

export type ComparatorType<T = unknown> = {
    canHandle(value: unknown): value is T;
    compare(a: T, b: T, context: ContextType): boolean;
};

export type PrimitiveTypes =
    | string
    | number
    | bigint
    | boolean
    | symbol
    | null
    | undefined;

export type PrimitiveOrFunction = PrimitiveTypes | Function;

export type VisitedPairs = WeakMap<object, WeakSet<object>>;