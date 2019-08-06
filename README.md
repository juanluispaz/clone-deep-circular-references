# clone-deep-circular-references

[![npm](https://img.shields.io/npm/v/clone-deep-circular-references.svg)](http://npm.im/clone-deep-circular-references)
[![travis](https://travis-ci.org/juanluispaz/clone-deep-circular-references.svg?branch=master)](https://travis-ci.org/juanluispaz/clone-deep-circular-references)
[![Coverage Status](https://img.shields.io/coveralls/juanluispaz/clone-deep-circular-references/master.svg)](https://coveralls.io/github/juanluispaz/clone-deep-circular-references?branch=master)
[![minified size](https://badgen.net/bundlephobia/min/clone-deep-circular-references)](https://bundlephobia.com/result?p=clone-deep-circular-references)
[![minified & gziped size](https://badgen.net/bundlephobia/minzip/clone-deep-circular-references)](https://bundlephobia.com/result?p=clone-deep-circular-references)

Recursively (deep) clone JavaScript objects and handles circular references.

This is a reimplementation of the package [clone-deep](https://www.npmjs.com/package/clone-deep) to allow have circular references.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save clone-deep-circular-references
```

## Basic usage

In this way you need to call the `cloneDeep` function passing as first argument the value to clone.

```js
import cloneDeep from 'clone-deep-circular-references';

let obj = { a: 'b' };
let arr = [obj];
let copy = cloneDeep(arr);
obj.c = 'd';

console.log(copy);
//=> [{ a: 'b' }]

console.log(arr);
//=> [{ a: 'b', c: 'd' }]
```

## Cloning custom classes

By default, if a no plain object is found, no copy will be created, if you want to change it you need to specify true as second argument. Note: in this way the class's constructor will be called with no argument, and then each property will be set.

```js
import cloneDeep from 'clone-deep-circular-references';

class MyClass {
    constructor(value) {
        this.prop = value;
    }
}

let obj = { a: new MyClass('b') };
let copy = cloneDeep(arr);

console.log(obj === copy);
//=> false

console.log(obj.a === copy.a);
//=> false
```

## Cloning custom classes

If you want to control how how no plain objects are copied you can specify a function as second argument that copy the value; this function receives as first argument the value to clone and as second argument the a Map with the object already cloned.

**Note**: if inside this function you want to call the `cloneDeep` function you need to pass a third argument the map with the object already cloned.

```js
import cloneDeep from 'clone-deep-circular-references';

class MyClass {
    constructor(value) {
        this.prop = value;
    }
}

let obj = { a: new MyClass('b') };
let copy = cloneDeep(arr, function myCustomClone(value, instancesMap) {
    if (value instanceof MyClass) {
        return new MyClass(value.prop)
    }
    return cloneDeep(value, myCustomClone, instancesMap);
});

console.log(obj === copy);
//=> false

console.log(obj.a === copy.a);
//=> false
```

## Handled types

The following types are handled recursively by the `cloneDeep` function:
* Plain objects
* No plain objects (see the previous documentation)
* Arrays
* Map
* Set

The other object types are copied using [shallow-clone](https://www.npmjs.com/package/shallow-clone), see the [shallow-clone](https://www.npmjs.com/package/shallow-clone) documentation to know what kind of object are handled.

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