import { DeepEqualEngine } from '../deep-equal'

import { string1, string2, obj1, obj2, obj3, arr1, arr2, arr3 } from './mocks.js'


describe('Comparator', () => {
    describe('Сравнивает примитивные значения, ', () => {
        it('строки', () => {
            const engine = new DeepEqualEngine();

            expect(engine.deepEqual(string1, string1)).toBe(true);
            expect(engine.deepEqual(string1, string2)).toBe(false);
        });

        it('числа', () => {
            const engine = new DeepEqualEngine();

            expect(engine.deepEqual(1, 1)).toBe(true);
            expect(engine.deepEqual(1, 2)).toBe(false);
        });  

         it('числа с проверкой знака', () => {
            const engine = new DeepEqualEngine();

            // В нашем случае они будут разными, т.к. есть сравнение Object.is
            expect(engine.deepEqual(+0, -0)).toBe(false);
        });  
        
        it('undefind и null', () => {
            const engine = new DeepEqualEngine();

            expect(engine.deepEqual(null, null)).toBe(true);
            expect(engine.deepEqual(undefined, undefined)).toBe(true);
            expect(engine.deepEqual(undefined, null)).toBe(false);
        });  
    })
   
    describe('Сравнивает объекты, ', () => {
        it('одинаковые по структуре и ссылке', () => {
            const engine = new DeepEqualEngine();

            expect(engine.deepEqual(obj1, obj1)).toBe(true);
        });
        it('одинаковые по структуре но разные по ссылке', () => {
            const engine = new DeepEqualEngine();

            expect(engine.deepEqual(obj1, obj2)).toBe(true);
        });

        it('разные по структуре и ссылке', () => {
            const engine = new DeepEqualEngine();

            expect(engine.deepEqual(obj1, obj3)).toBe(false);
        });

        it('с циклическими ссылками', () => {
            const engine = new DeepEqualEngine();

            const a = {};
            a.self = a;
            a.value = 1;

            const b = {};
            b.self = b;
            b.value = 2;

            expect(engine.deepEqual(a, b)).toBe(false);
        });

        it('с вложенными объектами имеющие циклические ссылки', () => {
            const engine = new DeepEqualEngine();

            const a = { child: {} };
            a.child.parent = a;

            const b = { child: {} };
            b.child.parent = b;

            expect(engine.deepEqual(a, b)).toBe(true);
        });

        it('функция deepEqual поверяет данные заново при каждом внешнем вызове', () => {
            const engine = new DeepEqualEngine();
            const a = { value: 1 };
            const b = { value: 1 };

            expect(engine.deepEqual(a, b)).toBe(true);
            expect(engine.deepEqual(a, b)).toBe(true);

            b.value = 2;
            expect(engine.deepEqual(a, b)).toBe(false);

            b.value = 1;
            expect(engine.deepEqual(a, b)).toBe(true);
        });
    })

    describe('Сравнимает массивы, ', () => {
        it('одинаковые по структуре но разные по ссылке', () => {
            const engine = new DeepEqualEngine();

            expect(engine.deepEqual(arr1, arr2)).toBe(true);
        });

        it('разные по структуре и ссылке', () => {
            const engine = new DeepEqualEngine();

            expect(engine.deepEqual(arr1, arr3)).toBe(false);
        });

        it('содержащие сами себя', () => {
            const engine = new DeepEqualEngine();

            const a = [];
            a.push(a);

            const b = [];
            b.push(b);

            expect(engine.deepEqual(a, b)).toBe(true);
        });
    })

    it('Сравнимает разные типы, ', () => {
        const engine = new DeepEqualEngine();
        
        expect(engine.deepEqual(1, '1')).toBe(false);
        expect(engine.deepEqual('1', 1)).toBe(false);
        expect(engine.deepEqual('0', 0)).toBe(false);

        expect(engine.deepEqual('undefined', undefined)).toBe(false);
        expect(engine.deepEqual('null', null)).toBe(false);

        expect(engine.deepEqual(1, {})).toBe(false);
        expect(engine.deepEqual(1, [])).toBe(false);
            
        expect(engine.deepEqual('test', [])).toBe(false);
        expect(engine.deepEqual('test', [])).toBe(false);

        expect(engine.deepEqual([], {})).toBe(false);
        expect(engine.deepEqual({}, [])).toBe(false);

        expect(engine.deepEqual(null, {})).toBe(false);
        expect(engine.deepEqual({}, null)).toBe(false);
    })
})