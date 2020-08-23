# clone-deep-circular-references

[![npm](https://img.shields.io/npm/v/clone-deep-circular-references.svg)](http://npm.im/clone-deep-circular-references)
[![travis](https://travis-ci.org/juanluispaz/clone-deep-circular-references.svg?branch=master)](https://travis-ci.org/juanluispaz/clone-deep-circular-references)
[![Coverage Status](https://img.shields.io/coveralls/juanluispaz/clone-deep-circular-references/master.svg)](https://coveralls.io/github/juanluispaz/clone-deep-circular-references?branch=master)
[![minified size](https://badgen.net/bundlephobia/min/clone-deep-circular-references)](https://bundlephobia.com/result?p=clone-deep-circular-references)
[![minified & gziped size](https://badgen.net/bundlephobia/minzip/clone-deep-circular-references)](https://bundlephobia.com/result?p=clone-deep-circular-references)

Shallow object colone and recursively (deep) clone JavaScript objects that handles circular references.

This is a reimplementation of the package [clone-deep](https://www.npmjs.com/package/clone-deep) to allow have circular references; as well, a reimplementation of [shallow-clone](https://www.npmjs.com/package/shallow-clone) to make it friendly with webpack.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save clone-deep-circular-references
```

## Basic usage

In this way you need to call the `cloneDeep` or the `cloneShallow` function passing as first argument the value to clone.

```js
import { cloneDeep, cloneShallow } from 'clone-deep-circular-references';

let obj = { a: 'b' };
let arr = [obj];
let deepCopy = cloneDeep(arr);
let shallowCopy = cloneShallow(arr);
obj.c = 'd';
shallowCopy.push('hello');

console.log(deepCopy);
//=> [{ a: 'b' }]

console.log(arr);
//=> [{ a: 'b', c: 'd' }]

console.log(shallowCopy);
//=> [{ a: 'b', c: 'd' }, 'hello']
```

## Cloning custom classes

By default, if a no plain object is found, no copy will be created; if you want to change it, you need to specify true as second argument. Note: in this way the class's constructor will not be called (a new object with the same prototype will be created), and then each property will be set.

```js
import { cloneDeep, cloneShallow } from 'clone-deep-circular-references';

class MyClass {
    constructor(value) {
        this.prop = value;
    }
}
let obj = { a: new MyClass('b') };

let deepCopy = cloneDeep(arr);
console.log(obj === deepCopy);
//=> true
console.log(obj.a === deepCopy.a);
//=> true

deepCopy = cloneDeep(arr, true);
console.log(obj === deepCopy);
//=> false
console.log(obj.a === deepCopy.a);
//=> false

let shallowCopy = cloneShallow(arr);
console.log(obj === shallowCopy);
//=> true
console.log(obj.a === shallowCopy.a);
//=> true

shallowCopy = cloneShallow(arr, true);
console.log(obj === shallowCopy);
//=> false
console.log(obj.a === shallowCopy.a);
//=> true
```

## Controlling how custom classes are cloned

If you want to control how how no plain objects are copied you can specify a function as second argument that copy the value; this function receives as first argument the value to clone and as second argument the a Map with the object already cloned.

**Note**: if inside the `cloneDeep` function you want to call the `cloneDeep` function you need to pass a third argument the map with the object already cloned.

```js
import { cloneDeep, cloneShallow } from 'clone-deep-circular-references';

class MyClass {
    constructor(value) {
        this.prop = value;
    }
}
let obj = { a: new MyClass('b') };

let deepCopy = cloneDeep(arr, function myCustomClone(value, instancesMap) {
    if (value instanceof MyClass) {
        return new MyClass(value.prop)
    }
    return cloneDeep(value, myCustomClone, instancesMap);
});

console.log(obj === deepCopy);
//=> false

console.log(obj.a === deepCopy.a);
//=> false

let shallowCopy = cloneShallow(arr, function myCustomClone(value) {
    if (value instanceof MyClass) {
        return new MyClass(value.prop)
    }
    return cloneShallow(value, myCustomClone);
});

console.log(obj === shallowCopy);
//=> false

console.log(obj.a === shallowCopy.a);
//=> true
```

## Handled types

The following types are handled recursively by the `cloneDeep` function:
* Plain objects
* No plain objects (see the previous documentation)
* Arrays
* Map
* Set

The other object types are copied using the `cloneShallow`function.

The following types are handled by the `cloneShallow` function:
* Plain objects
* No plain objects (see the previous documentation)
* Arrays
* Map
* Set
* Date
* RegExp
* Error

The following types are returned without create a copy:
* Symbol
* Promise
* WeakMap
* WeakSet
* Buffer (nodejs)
* ArrayBuffer
* Int8Array
* Uint8Array
* Uint8ClampedArray
* Int16Array
* Uint16Array
* Int32Array
* Uint32Array
* Float32Array
* Float64Array
* undefined
* null
* boolean
* string
* number
* function
* iterator
* any other special JavaScript object

## Related projects

You might also be interested in these projects:

* [clone-deep](https://www.npmjs.com/package/clone-deep): Recursively (deep) clone JavaScript native types, like Object, Array, RegExp, Date as well as primitives. | [homepage](https://github.com/jonschlinkert/clone-deep "Recursively (deep) clone JavaScript native types, like Object, Array, RegExp, Date as well as primitives.")
* [is-plain-object](https://www.npmjs.com/package/is-plain-object): Returns true if an object was created by the `Object` constructor. | [homepage](https://github.com/jonschlinkert/is-plain-object "Returns true if an object was created by the `Object` constructor.")
* [kind-of](https://www.npmjs.com/package/kind-of): Get the native type of a value. | [homepage](https://github.com/jonschlinkert/kind-of "Get the native type of a value.")
* [shallow-clone](https://www.npmjs.com/package/shallow-clone): Creates a shallow clone of any JavaScript value. | [homepage](https://github.com/jonschlinkert/shallow-clone "Creates a shallow clone of any JavaScript value.")

## License

MIT

<!--
Edited with: https://stackedit.io/app
-->