'use strict';

const clone = require('shallow-clone');
const typeOf = require('kind-of');
const isPlainObject = require('is-plain-object');

function cloneDeep(val, instanceClone, instancesMap) {
    if (instancesMap) {
        var cached = instancesMap.get(val);
        if (cached !== undefined) {
            return cached;
        }
    } else {
        instancesMap = new Map();
    }
    switch (typeOf(val)) {
        case 'object':
            return cloneObjectDeep(val, instanceClone, instancesMap);
        case 'array':
            return cloneArrayDeep(val, instanceClone, instancesMap);
        case 'map':
            return cloneMapDeep(val, instanceClone, instancesMap);
        case 'set':
            return cloneSetDeep(val, instanceClone, instancesMap);
        default: {
            return clone(val);
        }
    }
}

function cloneObjectDeep(val, instanceClone, instancesMap) {
    if (typeof instanceClone === 'function' && instancesMap.lastValue !== val) {
        instancesMap.lastValue = val;
        const res = instanceClone(val, instancesMap);
        instancesMap.lastValue = null;
        instancesMap.set(val, res);
        return res;
    }
    if (instanceClone || isPlainObject(val)) {
        const res = Object.create(Object.getPrototypeOf(val));
        instancesMap.set(val, res);
        for (let key in val) {
            res[key] = cloneDeep(val[key], instanceClone, instancesMap);
        }
        if (Object.getOwnPropertySymbols) {
            const symbols = Object.getOwnPropertySymbols(val);
            for (var i = 0, length = symbols.length; i < length; i++) {
                var symbol = symbols[i];
                if (val.propertyIsEnumerable(symbol)) {
                    res[symbol] = cloneDeep(val[symbol], instanceClone, instancesMap);
                }
            }
        }
        return res;
    }
    instancesMap.set(val, val);
    return val;
}

function cloneArrayDeep(val, instanceClone, instancesMap) {
    const res = new val.constructor(val.length);
    instancesMap.set(val, res);
    for (let i = 0; i < val.length; i++) {
        res[i] = cloneDeep(val[i], instanceClone, instancesMap);
    }
    return res;
}

function cloneMapDeep(val, instanceClone, instancesMap) {
    const res = new val.constructor();
    instancesMap.set(val, res);
    val.forEach(function(value, key) {
        res.set(key, cloneDeep(value, instanceClone, instancesMap));
    });
    return res;
}

function cloneSetDeep(val, instanceClone, instancesMap) {
    const res = new val.constructor();
    instancesMap.set(val, res);
    val.forEach(function(value) {
        res.add(cloneDeep(value, instanceClone, instancesMap));
    });
    return res;
}

Object.defineProperty(exports, "__esModule", { value: true });
module.exports.default = cloneDeep;