import {ComparatorType, ContextType, PrimitiveOrFunction, VisitedPairs} from "./types";


export class Comparator<T = unknown> implements ComparatorType<T> {
  compare(_a: T, _b: T, _context: ContextType): boolean {
    throw new Error("Метод compare должен быть переопределён");
  }

  canHandle(_value: unknown): _value is T {
    throw new Error("Метод canHandle должен быть переопределён");
  }
}

function readProperty(target: object, key: PropertyKey): unknown {
  return Reflect.get(target, key);
}

function compareProperties(
    a: object,
    b: object,
    context: ContextType,
): boolean {
  const keysA = Reflect.ownKeys(a);
  const keysB = Reflect.ownKeys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  return keysA.every(
      (key) =>
          Object.hasOwn(b, key) &&
          context.ctxDeepEqual(readProperty(a, key), readProperty(b, key)),
  );
}

export class PrimitiveComparator extends Comparator<PrimitiveOrFunction> {
  override canHandle(value: unknown): value is PrimitiveOrFunction {
    return value === null || typeof value !== "object";
  }

  override compare(a: PrimitiveOrFunction, b: PrimitiveOrFunction): boolean {
    return Object.is(a, b);
  }
}
export class ArrayComparator extends Comparator<unknown[]> {
  override canHandle(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  override compare(
      a: unknown[],
      b: unknown[],
      context: ContextType,
  ): boolean {
    if (!Array.isArray(b) || a.length !== b.length) {
      return false;
    }

    return compareProperties(a, b, context);
  }
}

export class ObjectComparator extends Comparator<object> {
  override canHandle(value: unknown): value is object {
    if (value === null || typeof value !== "object") {
      return false;
    }

    const prototype = Object.getPrototypeOf(value);

    return prototype === Object.prototype || prototype === null;
  }

  override compare(
      a: object,
      b: object,
      context: ContextType,
  ): boolean {
    if (!this.canHandle(b)) {
      return false;
    }

    return compareProperties(a, b, context);
  }
}

export class DeepEqualEngine {
  comparators: ComparatorType[];

  constructor() {
    this.comparators = [
      new PrimitiveComparator(),
      new ArrayComparator(),
      new ObjectComparator(),
    ];
  }

  deepEqual(a: unknown, b: unknown): boolean {
    const visited: VisitedPairs = new WeakMap<object, WeakSet<object>>();

    const context: ContextType = {
      ctxDeepEqual: (left, right) => this.#compare(left, right, visited, context),
    };

    return context.ctxDeepEqual(a, b);
  }

  #compare(
      a: unknown,
      b: unknown,
      visited: VisitedPairs,
      context: ContextType,
  ): boolean {
    if (Object.is(a, b)) {
      return true;
    }

    const comparatorA = this.findComparator(a);
    const comparatorB = this.findComparator(b);

    if (!comparatorA || !comparatorB) {
      throw new TypeError("Для этого типа нужен отдельный компаратор");
    }

    if (!comparatorA.canHandle(a) || !comparatorA.canHandle(b)) {
      return false;
    }

    const bothObjects =
        a !== null &&
        b !== null &&
        typeof a === "object" &&
        typeof b === "object";

    if (bothObjects) {
      let partners = visited.get(a);

      if (partners?.has(b)) {
        return true;
      }

      if (!partners) {
        partners = new WeakSet<object>();
        visited.set(a, partners);
      }

      partners.add(b);
    }

    return comparatorA.compare(a, b, context);
  }

  findComparator(value: unknown): ComparatorType | undefined {
    return this.comparators.find((comparator) => comparator.canHandle(value));
  }

  addComparator<T>(comparator: Comparator<T>): void {
    if (!(comparator instanceof Comparator)) {
      throw new Error("Компаратор должен наследоваться от класса Comparator");
    }

    this.comparators.unshift(comparator);
  }
}