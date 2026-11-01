export type MixedArray = (number | number[] | { d: number })[];

export interface ObjType {
    a: number
    b: number[]
    c: {
        d: number
    }
}

export const string1 = 'string1'
export const string2 = 'string2'

export const obj1: ObjType = { a: 1, b: [2, 3], c: { d: 4 } };
export const obj2: ObjType = { a: 1, b: [2, 3], c: { d: 4 } };
export const obj3: ObjType = { a: 1, b: [1, 2], c: { d: 4 } };

export const arr1: MixedArray = [1, [2, 3], { d: 4 } ];
export const arr2: MixedArray = [1, [2, 3], { d: 4 }];
export const arr3: MixedArray = [1, [1, 2], { d: 4 }];