'use strict';

const cloneDeep = require('../src/cloneDeep').cloneDeep;
const cloneShallow = require('../src/cloneDeep').cloneShallow;

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
        var obj = { value: 1 };
        obj.obj = obj;
        var obj2 = cloneDeep(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2).toBe(obj2.obj);
    });

    it('clone circular reference with instanceClone self defined', function () {
        var obj = { value: 1 };
        obj.obj = obj;
        var obj2 = cloneDeep(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2).toBe(obj2.obj);
    });

    it('clone with enumerable symbol', function () {
        var obj = {};
        var value = { value: 1 };
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

        const a = new A({ x: 11 });
        const b = cloneDeep(a, true);

        expect(a).toEqual(b);

        b.x = 12;
        expect(a).not.toEqual(b);
    });

    it('preserve property accesors', function () {
        var person = {
            firstName: 'Jimmy',
            lastName: 'Smith',
            get fullName() {
                return this.firstName + ' ' + this.lastName;
            },
            set fullName(name) {
                var words = name.toString().split(' ');
                this.firstName = words[0] || '';
                this.lastName = words[1] || '';
            }
        }

        const person2 = cloneDeep(person, true);

        expect(person2).toEqual(person);

        person2.fullName = 'Other Name';
        expect(person2).not.toEqual(person);
        expect(person2.firstName).toEqual('Other');
        expect(person2.lastName).toEqual('Name');
    });

    it('copy enumerable properties in object', function () {
        var obj = {};
        var symbol = Symbol.for('mySymbol');
        obj.prop = { a: 10 };
        Object.defineProperty(obj, symbol, { value: { b: 11 }, enumerable: true, writable: true });

        const obj2 = cloneDeep(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop.a).toBe(10);
        expect(obj2[symbol].b).toBe(11);

        obj2.prop.a = 12;
        obj2[symbol].b = 13;

        expect(obj.prop.a).toBe(10);
        expect(obj[symbol].b).toBe(11);
        expect(obj2.prop.a).toBe(12);
        expect(obj2[symbol].b).toBe(13);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(true);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(true);
    });

    it('copy non enumerable properties in object', function () {
        var obj = {};
        var symbol = Symbol.for('mySymbol');
        Object.defineProperty(obj, 'prop', { value: { a: 10 }, writable: true });
        Object.defineProperty(obj, symbol, { value: { b: 11 }, enumerable: false, writable: true });

        const obj2 = cloneDeep(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop.a).toBe(10);
        expect(obj2[symbol].b).toBe(11);

        obj2.prop.a = 12;
        obj2[symbol].b = 13;

        expect(obj.prop.a).toBe(10);
        expect(obj[symbol].b).toBe(11);
        expect(obj2.prop.a).toBe(12);
        expect(obj2[symbol].b).toBe(13);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(false);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(false);
    });

    it('copy enumerable properties in array', function () {
        var obj = [];
        var symbol = Symbol.for('mySymbol');
        obj.prop = { a: 10 };
        Object.defineProperty(obj, symbol, { value: { b: 11 }, enumerable: true, writable: true });

        const obj2 = cloneDeep(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop.a).toBe(10);
        expect(obj2[symbol].b).toBe(11);

        obj2.prop.a = 12;
        obj2[symbol].b = 13;

        expect(obj.prop.a).toBe(10);
        expect(obj[symbol].b).toBe(11);
        expect(obj2.prop.a).toBe(12);
        expect(obj2[symbol].b).toBe(13);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(true);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(true);
    });

    it('copy non enumerable properties in array', function () {
        var obj = [];
        var symbol = Symbol.for('mySymbol');
        Object.defineProperty(obj, 'prop', { value: { a: 10 }, writable: true });
        Object.defineProperty(obj, symbol, { value: { b: 11 }, enumerable: false, writable: true });

        const obj2 = cloneDeep(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop.a).toBe(10);
        expect(obj2[symbol].b).toBe(11);

        obj2.prop.a = 12;
        obj2[symbol].b = 13;

        expect(obj.prop.a).toBe(10);
        expect(obj[symbol].b).toBe(11);
        expect(obj2.prop.a).toBe(12);
        expect(obj2[symbol].b).toBe(13);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(false);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(false);
    });

    it('copy enumerable properties in map', function () {
        var obj = new Map();
        var symbol = Symbol.for('mySymbol');
        obj.prop = { a: 10 };
        Object.defineProperty(obj, symbol, { value: { b: 11 }, enumerable: true, writable: true });

        const obj2 = cloneDeep(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop.a).toBe(10);
        expect(obj2[symbol].b).toBe(11);

        obj2.prop.a = 12;
        obj2[symbol].b = 13;

        expect(obj.prop.a).toBe(10);
        expect(obj[symbol].b).toBe(11);
        expect(obj2.prop.a).toBe(12);
        expect(obj2[symbol].b).toBe(13);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(true);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(true);
    });

    it('copy non enumerable properties in map', function () {
        var obj = new Map();
        var symbol = Symbol.for('mySymbol');
        Object.defineProperty(obj, 'prop', { value: { a: 10 }, writable: true });
        Object.defineProperty(obj, symbol, { value: { b: 11 }, enumerable: false, writable: true });

        const obj2 = cloneDeep(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop.a).toBe(10);
        expect(obj2[symbol].b).toBe(11);

        obj2.prop.a = 12;
        obj2[symbol].b = 13;

        expect(obj.prop.a).toBe(10);
        expect(obj[symbol].b).toBe(11);
        expect(obj2.prop.a).toBe(12);
        expect(obj2[symbol].b).toBe(13);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(false);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(false);
    });

    it('copy enumerable properties in set', function () {
        var obj = new Set();
        var symbol = Symbol.for('mySymbol');
        obj.prop = { a: 10 };
        Object.defineProperty(obj, symbol, { value: { b: 11 }, enumerable: true, writable: true });

        const obj2 = cloneDeep(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop.a).toBe(10);
        expect(obj2[symbol].b).toBe(11);

        obj2.prop.a = 12;
        obj2[symbol].b = 13;

        expect(obj.prop.a).toBe(10);
        expect(obj[symbol].b).toBe(11);
        expect(obj2.prop.a).toBe(12);
        expect(obj2[symbol].b).toBe(13);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(true);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(true);
    });

    it('copy non enumerable properties in set', function () {
        var obj = new Set();
        var symbol = Symbol.for('mySymbol');
        Object.defineProperty(obj, 'prop', { value: { a: 10 }, writable: true });
        Object.defineProperty(obj, symbol, { value: { b: 11 }, enumerable: false, writable: true });

        const obj2 = cloneDeep(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop.a).toBe(10);
        expect(obj2[symbol].b).toBe(11);

        obj2.prop.a = 12;
        obj2[symbol].b = 13;

        expect(obj.prop.a).toBe(10);
        expect(obj[symbol].b).toBe(11);
        expect(obj2.prop.a).toBe(12);
        expect(obj2[symbol].b).toBe(13);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(false);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(false);
    });
});

describe('cloneShallow()', () => {
    it('should shallow clone an array of primitives', function () {
        expect(cloneShallow(['alpha', 'beta', 'gamma'])).toEqual(['alpha', 'beta', 'gamma']);
    });

    it('should shallow clone an array with varied elements', function () {
        const val = [0, 'a', {}, [{}], [function () { }], function () { }];
        const val2 = cloneShallow(val);
        expect(val2).toEqual(val);
        expect(val2).not.toBe(val);
    });

    it('should clone Map', function () {
        const a = new Map([[1, 5]]);
        const b = cloneShallow(a);
        a.set(2, 4);
        expect(a).not.toEqual(b);
    });

    it('should clone Set', function () {
        const a = new Set([2, 1, 3]);
        const b = cloneShallow(a);
        a.add(8);
        expect(a).not.toEqual(b);
    });

    it('should shallow clone arrays', function () {
        const val = [1, 2, 3];
        const val2 = cloneShallow(val);
        expect(val2).not.toBe(val);
        expect(val2).toEqual(val);
    });

    it('should shallow clone a regex with flags', function () {
        const val = /foo/g;
        const val2 = cloneShallow(val);
        expect(val2).not.toBe(val);
        expect(val2).toEqual(val);
    });

    it('should shallow clone a regex without any flags', function () {
        const val = /foo/;
        const val2 = cloneShallow(val);
        expect(val2).not.toBe(val);
        expect(val2).toEqual(val);
    });

    it('should shallow clone a date', function () {
        const val = new Date();
        const val2 = cloneShallow(val);
        expect(val2).not.toBe(val);
        expect(val2).toEqual(val);
    });

    it('should shallow clone objects', function () {
        expect(cloneShallow({ a: 1, b: 2, c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should shallow clone an array of objects.', function () {
        const val = [{ a: 0 }, { b: 1 }];
        const val2 = cloneShallow(val);

        expect(val2).not.toBe(val);
        expect(val2).toEqual(val);
        expect(val2[0]).toEqual(val[0]);
    });

    it('should return primitives', function () {
        expect(cloneShallow(0)).toBe(0);
        expect(cloneShallow(1)).toBe(1);
        expect(cloneShallow('foo')).toBe('foo');
    });

    it('should clone instances with instanceClone true', function () {
        function A(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        function B(x) {
            this.x = x;
        }

        const a = new A({ x: 11, y: 12, z: () => 'z' }, new B(2), 7);
        const b = cloneShallow(a, true);

        expect(a).toEqual(b);

        b.y.x = 1;
        b.z = 2;
        expect(a).not.toEqual(b);
        expect(a.z).not.toBe(b.z); // 'Root property of original object not expected to be changed'
        expect(a.y.x).toBe(b.y.x); // 'Nested property of original object expected to be changed'
    });

    it('should not clone instances', function () {
        function A(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        function B(x) {
            this.x = x;
        }

        const a = new A({ x: 11, y: 12, z: () => 'z' }, new B(2), 7);
        const b = cloneShallow(a);

        expect(a).toEqual(b);

        b.y.x = 1;
        b.z = 2;
        expect(a).toEqual(b);
        expect(a.z).toBe(b.z);
        expect(a.y.x).toBe(b.y.x);
    });

    it('should clone instances with instanceClone self defined', function () {
        function A(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        function B(x) {
            this.x = x;
        }

        const a = new A({ x: 11, y: 12, z: () => 'z' }, new B(2), 7);
        const b = cloneShallow(a, function myCustomClone(val) {
            if (val instanceof A) {
                const res = new A();
                for (const key in val) {
                    res[key] = cloneShallow(val[key], myCustomClone);
                }
                return res;
            } else {
                return cloneShallow(val, myCustomClone);
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

    it('clone with enumerable symbol', function () {
        var obj = {};
        var value = { value: 1 };
        var symbol = Symbol.for('test');
        Object.defineProperty(obj, symbol, {
            value: value,
            enumerable: true
        });

        var obj2 = cloneShallow(obj, function myCustomClone(val) {
            return cloneShallow(val, myCustomClone);
        });
        expect(obj2[symbol]).toBe(obj[symbol]);
    });

    it('should clone instances with instanceClone true', function () {
        function A(x) {
            if (!x) {
                throw new Error('x is missing')
            }
            this.x = x;
        }

        const a = new A({ x: 11 });
        const b = cloneShallow(a, true);

        expect(a).toEqual(b);

        b.x = 12;
        expect(a).not.toEqual(b);
    });

    it('preserve property accesors', function () {
        var person = {
            firstName: 'Jimmy',
            lastName: 'Smith',
            get fullName() {
                return this.firstName + ' ' + this.lastName;
            },
            set fullName(name) {
                var words = name.toString().split(' ');
                this.firstName = words[0] || '';
                this.lastName = words[1] || '';
            }
        }

        const person2 = cloneShallow(person, true);

        expect(person2).toEqual(person);

        person2.fullName = 'Other Name';
        expect(person2).not.toEqual(person);
        expect(person2.firstName).toEqual('Other');
        expect(person2.lastName).toEqual('Name');
    });

    it('copy enumerable properties in object', function () {
        var obj = {};
        var symbol = Symbol.for('mySymbol');
        obj.prop = { a: 10 };
        Object.defineProperty(obj, symbol, { value: {b: 11}, enumerable: true, writable: true });

        const obj2 = cloneShallow(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop).toBe(obj.prop);
        expect(obj2[symbol]).toBe(obj[symbol]);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(true);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(true);
    });

    it('copy non enumerable properties in object', function () {
        var obj = {};
        var symbol = Symbol.for('mySymbol');
        Object.defineProperty(obj, 'prop', { value: { a: 10 }, writable: true });
        Object.defineProperty(obj, symbol, { value: { b: 11 }, enumerable: false, writable: true });

        const obj2 = cloneShallow(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop).toBe(obj.prop);
        expect(obj2[symbol]).toBe(obj[symbol]);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(false);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(false);
    });

    it('copy enumerable properties in array', function () {
        var obj = [];
        var symbol = Symbol.for('mySymbol');
        obj.prop = { a: 10 };
        Object.defineProperty(obj, symbol, { value: {b: 11}, enumerable: true, writable: true });

        const obj2 = cloneShallow(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop).toBe(obj.prop);
        expect(obj2[symbol]).toBe(obj[symbol]);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(true);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(true);
    });

    it('copy non enumerable properties in array', function () {
        var obj = [];
        var symbol = Symbol.for('mySymbol');
        Object.defineProperty(obj, 'prop', { value: { a: 10 }, writable: true });
        Object.defineProperty(obj, symbol, { value: { b: 11 }, enumerable: false, writable: true });

        const obj2 = cloneShallow(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop).toBe(obj.prop);
        expect(obj2[symbol]).toBe(obj[symbol]);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(false);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(false);
    });

    it('copy enumerable properties in map', function () {
        var obj = new Map();
        var symbol = Symbol.for('mySymbol');
        obj.prop = { a: 10 };
        Object.defineProperty(obj, symbol, { value: {b: 11}, enumerable: true, writable: true });

        const obj2 = cloneShallow(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop).toBe(obj.prop);
        expect(obj2[symbol]).toBe(obj[symbol]);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(true);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(true);
    });

    it('copy non enumerable properties in map', function () {
        var obj = new Map();
        var symbol = Symbol.for('mySymbol');
        Object.defineProperty(obj, 'prop', { value: { a: 10 }, writable: true });
        Object.defineProperty(obj, symbol, { value: { b: 11 }, enumerable: false, writable: true });

        const obj2 = cloneShallow(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop).toBe(obj.prop);
        expect(obj2[symbol]).toBe(obj[symbol]);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(false);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(false);
    });

    it('copy enumerable properties in set', function () {
        var obj = new Set();
        var symbol = Symbol.for('mySymbol');
        obj.prop = { a: 10 };
        Object.defineProperty(obj, symbol, { value: {b: 11}, enumerable: true, writable: true });

        const obj2 = cloneShallow(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop).toBe(obj.prop);
        expect(obj2[symbol]).toBe(obj[symbol]);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(true);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(true);
    });

    it('copy non enumerable properties in set', function () {
        var obj = new Set();
        var symbol = Symbol.for('mySymbol');
        Object.defineProperty(obj, 'prop', { value: { a: 10 }, writable: true });
        Object.defineProperty(obj, symbol, { value: { b: 11 }, enumerable: false, writable: true });

        const obj2 = cloneShallow(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop).toBe(obj.prop);
        expect(obj2[symbol]).toBe(obj[symbol]);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(false);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(false);
    });

    it('copy enumerable properties in date', function () {
        var obj = new Date();
        var symbol = Symbol.for('mySymbol');
        obj.prop = { a: 10 };
        Object.defineProperty(obj, symbol, { value: {b: 11}, enumerable: true, writable: true });

        const obj2 = cloneShallow(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop).toBe(obj.prop);
        expect(obj2[symbol]).toBe(obj[symbol]);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(true);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(true);
    });

    it('copy non enumerable properties in date', function () {
        var obj = new Date();
        var symbol = Symbol.for('mySymbol');
        Object.defineProperty(obj, 'prop', { value: { a: 10 }, writable: true });
        Object.defineProperty(obj, symbol, { value: { b: 11 }, enumerable: false, writable: true });

        const obj2 = cloneShallow(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop).toBe(obj.prop);
        expect(obj2[symbol]).toBe(obj[symbol]);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(false);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(false);
    });

    it('copy enumerable properties in regexp', function () {
        var obj = /.*/g;
        var symbol = Symbol.for('mySymbol');
        obj.prop = { a: 10 };
        Object.defineProperty(obj, symbol, { value: {b: 11}, enumerable: true, writable: true });

        const obj2 = cloneShallow(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop).toBe(obj.prop);
        expect(obj2[symbol]).toBe(obj[symbol]);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(true);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(true);
    });

    it('copy non enumerable properties in regexp', function () {
        var obj = /.*/g;
        var symbol = Symbol.for('mySymbol');
        Object.defineProperty(obj, 'prop', { value: { a: 10 }, writable: true });
        Object.defineProperty(obj, symbol, { value: { b: 11 }, enumerable: false, writable: true });

        const obj2 = cloneShallow(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop).toBe(obj.prop);
        expect(obj2[symbol]).toBe(obj[symbol]);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(false);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(false);
    });

    it('copy enumerable properties in error', function () {
        var obj = new Error();
        var symbol = Symbol.for('mySymbol');
        obj.prop = { a: 10 };
        Object.defineProperty(obj, symbol, { value: {b: 11}, enumerable: true, writable: true });

        const obj2 = cloneShallow(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop).toBe(obj.prop);
        expect(obj2[symbol]).toBe(obj[symbol]);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(true);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(true);
    });

    it('copy non enumerable properties in error', function () {
        var obj = new Error();
        var symbol = Symbol.for('mySymbol');
        Object.defineProperty(obj, 'prop', { value: { a: 10 }, writable: true });
        Object.defineProperty(obj, symbol, { value: { b: 11 }, enumerable: false, writable: true });

        const obj2 = cloneShallow(obj, true);

        expect(obj2).toEqual(obj);
        expect(obj2).not.toBe(obj);
        expect(obj2.prop).toBe(obj.prop);
        expect(obj2[symbol]).toBe(obj[symbol]);

        expect(Object.getOwnPropertyDescriptor(obj2, 'prop').enumerable).toBe(false);
        expect(Object.getOwnPropertyDescriptor(obj2, symbol).enumerable).toBe(false);
    });

    it('should clone errors', function () {
        const err = new Error('My Error');
        const err2 = cloneShallow(err);
        expect(err2).toEqual(err);
        expect(err2).not.toBe(err);
    });
});