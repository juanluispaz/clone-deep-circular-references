'use strict';

const cloneDeep = require('../src/cloneDeep').default;

describe('cloneDeep()', function () {
    it('should clone arrays', function () {
        expect(cloneDeep(['alpha', 'beta', 'gamma'])).toEqual(['alpha', 'beta', 'gamma']);
        expect(cloneDeep([1, 2, 3])).toEqual([1, 2, 3]);

        const a = [{ 'a': 0 }, { 'b': 1 }];
        const b = cloneDeep(a);

        expect(b).toEqual(a);
        expect(b[0]).toEqual(a[0]);

        const val = [0, 'a', {}, [{}], [function () { }], function () { }];
        expect(cloneDeep(val)).toEqual(val);
    });

    it('should deeply clone an array', function () {
        const fixture = [[{ a: 'b' }], [{ a: 'b' }]];
        const result = cloneDeep(fixture);
        expect(fixture !== result).toBe(true);
        expect(fixture[0] !== result[0]).toBe(true);
        expect(fixture[1] !== result[1]).toBe(true);
        expect(fixture).toEqual(result);
    });

    it('should deeply clone object', function () {
        const one = { a: 'b' };
        const two = cloneDeep(one);
        two.c = 'd';
        expect(one).not.toEqual(two);
    });

    it('should deeply clone arrays', function () {
        const one = { a: 'b' };
        const arr1 = [one];
        const arr2 = cloneDeep(arr1);
        one.c = 'd';
        expect(arr1).not.toEqual(arr2);
    });

    it('should deeply clone Map', function () {
        const a = new Map([[1, 5]]);
        const b = cloneDeep(a);
        a.set(2, 4);
        expect(Array.from(a)).not.toEqual(Array.from(b));
        expect(Array.from(a)[0]).not.toBe(Array.from(b)[0]);
        expect(Array.from(a)[0]).toEqual(Array.from(b)[0]);
    });

    it('should deeply clone Set', function () {
        const a = new Set([[2, 1, 3]]);
        const b = cloneDeep(a);
        a.add(8);
        expect(Array.from(a)).not.toEqual(Array.from(b));
        expect(Array.from(a)[0]).not.toBe(Array.from(b)[0]);
        expect(Array.from(a)[0]).toEqual(Array.from(b)[0]);
    });

    it('should return primitives', function () {
        expect(cloneDeep(0)).toBe(0);
        expect(cloneDeep('foo')).toBe('foo');
    });

    it('should clone a regex', function () {
        expect(cloneDeep(/foo/g)).toEqual(/foo/g);
    });

    it('should clone objects', function () {
        expect(cloneDeep({ a: 1, b: 2, c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should deeply clone objects', function () {
        expect(cloneDeep({ a: { a: 1, b: 2, c: 3 }, b: { a: 1, b: 2, c: 3 }, c: { a: 1, b: 2, c: 3 } })).toEqual({ a: { a: 1, b: 2, c: 3 }, b: { a: 1, b: 2, c: 3 }, c: { a: 1, b: 2, c: 3 } });
    });

    it('should deep clone instances with instanceClone true', function () {
        function A(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        function B(x) {
            this.x = x;
        }

        const a = new A({ x: 11, y: 12, z: () => 'z' }, new B(2), 7);
        const b = cloneDeep(a, true);

        expect(a).toEqual(b);

        b.y.x = 1;
        b.z = 2;
        expect(a).not.toEqual(b);
        expect(a.z).not.toBe(b.z); // 'Root property of original object not expected to be changed'
        expect(a.y.x).not.toBe(b.y.x); // 'Nested property of original object not expected to be changed'
    });

    it('should not deep clone instances', function () {
        function A(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        function B(x) {
            this.x = x;
        }

        const a = new A({ x: 11, y: 12, z: () => 'z' }, new B(2), 7);
        const b = cloneDeep(a);

        expect(a).toEqual(b);

        b.y.x = 1;
        b.z = 2;
        expect(a).toEqual(b);
        expect(a.z).toBe(b.z);
        expect(a.y.x).toBe(b.y.x);
    });

    it('should deep clone instances with instanceClone self defined', function () {
        function A(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        function B(x) {
            this.x = x;
        }

        const a = new A({ x: 11, y: 12, z: () => 'z' }, new B(2), 7);
        const b = cloneDeep(a, function myCustomClone(val, instancesMap) {
            if (val instanceof A) {
                const res = new A();
                for (const key in val) {
                    res[key] = cloneDeep(val[key], myCustomClone, instancesMap);
                }
                return res;
            } else {
                return cloneDeep(val, myCustomClone, instancesMap);
            }
        });

        expect(a).toEqual(b);

        b.y.x = 1;
        b.z = 2;
        expect(a).not.toEqual(b);
        expect(a.z).not.toBe(b.z); // 'Root property of original object not expected to be changed'
        expect(a.y).not.toBe(b.y);
        expect(a.y.x).not.toBe(b.y.x);
    });

    it('clone circular reference', function () {
        var obj = {value: 1};
        obj.obj = obj;
        var obj2 = cloneDeep(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2).toBe(obj2.obj);
    });

    it('clone circular reference with instanceClone self defined', function () {
        var obj = {value: 1};
        obj.obj = obj;
        var obj2 = cloneDeep(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2).toBe(obj2.obj);
    });

    it('clone with enumerable symbol', function() {
        var obj = {};
        var value = {value: 1};
        var symbol = Symbol.for('test');
        Object.defineProperty(obj, symbol, {
            value: value,
            enumerable: true
        });

        var obj2 = cloneDeep(obj, function myCustomClone(val, instancesMap) {
            return cloneDeep(val, myCustomClone, instancesMap);
        });
        expect(obj2[symbol]).not.toBe(obj[symbol]);
        expect(obj2[symbol]).toEqual(obj[symbol]);
    });

    it('should deep clone instances with instanceClone true', function () {
        function A(x) {
            if (!x) {
                throw new Error('x is missing')
            }
            this.x = x;
        }

        const a = new A({ x: 11});
        const b = cloneDeep(a, true);

        expect(a).toEqual(b);

        b.x = 12;
        expect(a).not.toEqual(b);
    });
});