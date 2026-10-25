export class Comparator {
  compare(a, b, context) {
    throw new Error("Метод compare должен быть переопределён");
  }

  canHandle(value) {
    throw new Error("Метод canHandle должен быть переопределён");
  }
}

// Общая проверка собственных свойств объектов и массивов
function compareProperties(a, b, context) {
  const keysA = Reflect.ownKeys(a);
  const keysB = Reflect.ownKeys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  return keysA.every(
    (key) =>
      Object.hasOwn(b, key) &&
      context.ctxDeepEqual(a[key], b[key])
  );
}

export class PrimitiveComparator extends Comparator {
  canHandle(value) {
    return value === null || typeof value !== "object";
  }

  compare(a, b) {
    return Object.is(a, b);
  }
}

export class ArrayComparator extends Comparator {
  canHandle(value) {
    return Array.isArray(value);
  }

  compare(a, b, context) {
    if (!Array.isArray(b) || a.length !== b.length) {
      return false;
    }

    return compareProperties(a, b, context);
  }
}

export class ObjectComparator extends Comparator {
  canHandle(value) {
    if (value === null || typeof value !== "object") {
      return false;
    }

    const prototype = Object.getPrototypeOf(value);

    return prototype === Object.prototype || prototype === null;
  }

  compare(a, b, context) {
    if (!this.canHandle(b)) {
      return false;
    }

    return compareProperties(a, b, context);
  }
}

export class DeepEqualEngine {
  constructor() {
    this.comparators = [
      new PrimitiveComparator(),
      new ArrayComparator(),
      new ObjectComparator(),
    ];
  }

  // Каждый раз создаём новую историю сравнений, т.к. объекты могут меняться и в этом случае будет ошибка.
  deepEqual(a, b) {
    // Создает структуру WeakMap: ключ-значение
    const visited = new WeakMap();

    const context = {
      ctxDeepEqual: (left, right) => this.#compare(left, right, visited, context),
    };

    return context.ctxDeepEqual(a, b);
  }

  // Рекурсивное сравнение: использует общую историю конкретного сравнения созраненную в WeakMap.
  #compare(a, b, visited, context) {
    // Быстрая проверка, если значения равны, не нужно искать компаратор и выйти из сравнения сразу.
    // Небольшой дубль из PrimitiveComparator, но с ним сравнение будет быстрее.
    if (Object.is(a, b)) {
      return true;
    }

    const comparatorA = this.findComparator(a);
    const comparatorB = this.findComparator(b);

    // Сообщаем пользователю если нет подходящего компаратора
    if (!comparatorA || !comparatorB) {
      throw new TypeError("Для этого типа нужен отдельный компаратор");
    }

    const bothObjects =
      a !== null &&
      b !== null &&
      typeof a === "object" &&
      typeof b === "object";

    // Для каждого объекта в WeakMap мы создаем значение WeakSet и помещаем в него все объекты с которыми его сравнивали.
    // То есть, мы сохраняем именно пары!
    if (bothObjects) {
      let partners = visited.get(a);

      // Эту пару уже начали сравнивать:
      // повторно углубляться в неё не нужно.
      if (partners?.has(b)) {
        return true;
      }

      if (!partners) {
        partners = new WeakSet();
        visited.set(a, partners);
      }

      partners.add(b);
    }

    return comparatorA.compare(a, b, context);
  }

  findComparator(value) {
    return this.comparators.find(
      (comparator) => comparator.canHandle(value)
    );
  }

  addComparator(comparator) {
    if (!(comparator instanceof Comparator)) {
      throw new Error(
        "Компаратор должен наследоваться от класса Comparator"
      );
    }

    this.comparators.unshift(comparator);
  }
}