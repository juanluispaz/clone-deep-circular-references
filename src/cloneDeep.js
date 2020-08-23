'use strict';

var typeOf = require('kind-of');
var isPlainObject = require('is-plain-object');

function cloneDeep(val, instanceClone, instancesMap) {
    if (instancesMap) {
        var cached = instancesMap.get(val);
        if (cached !== undefined) {
            return cached;
        }
    } else {
        instancesMap = new Map();
    }
    var type = typeOf(val)
    switch (type) {
        case 'object':
            return cloneObjectDeep(val, instanceClone, instancesMap);
        case 'array':
            return cloneArrayDeep(val, instanceClone, instancesMap);
        case 'map':
            return cloneMapDeep(val, instanceClone, instancesMap);
        case 'set':
            return cloneSetDeep(val, instanceClone, instancesMap);
        default: {
            return cloneShallow(val, false, type);
        }
    }
}

function cloneObjectDeep(val, instanceClone, instancesMap) {
    if (typeof instanceClone === 'function' && instanceClone.lastValue !== val) {
        instanceClone.lastValue = val;
        var res = instanceClone(val, instancesMap);
        instanceClone.lastValue = null;
        instancesMap.set(val, res);
        return res;
    }
    if (instanceClone || isPlainObject(val)) {
        var res = Object.create(Object.getPrototypeOf(val));
        instancesMap.set(val, res);
        copyPropsDeep(res, val, instanceClone, instancesMap);
        return res;
    }
    instancesMap.set(val, val);
    return val;
}

function copyPropsDeep(res, val, instanceClone, instancesMap, filter) {
    var ownProperties = Object.getOwnPropertyNames(val);
    if (filter) {
        ownProperties = ownProperties.filter(function (prop) {
            return !(prop in res);
        });
    }
    setValueCloneDeep(val, res, ownProperties, instanceClone, instancesMap);
    if (Object.getOwnPropertySymbols) {
        setValueCloneDeep(val, res, Object.getOwnPropertySymbols(val), instanceClone, instancesMap);
    }
}

function setValueCloneDeep(val, res, keys, instanceClone, instancesMap) {
    for (var i = 0, length = keys.length; i < length; i++) {
        var key = keys[i];
        var descriptor = Object.getOwnPropertyDescriptor(val, key);
        var newDescriptor = Object.assign({}, descriptor);
        if ('value' in newDescriptor) {
            newDescriptor.value = cloneDeep(val[key], instanceClone, instancesMap);
        }
        Object.defineProperty(res, key, newDescriptor);
    }
}

function cloneArrayDeep(val, instanceClone, instancesMap) {
    var res = new val.constructor(val.length);
    instancesMap.set(val, res);
    for (var i = 0; i < val.length; i++) {
        res[i] = cloneDeep(val[i], instanceClone, instancesMap);
    }
    copyPropsDeep(res, val, instanceClone, instancesMap, true);
    return res;
}

function cloneMapDeep(val, instanceClone, instancesMap) {
    var res = new val.constructor();
    instancesMap.set(val, res);
    val.forEach(function (value, key) {
        res.set(key, cloneDeep(value, instanceClone, instancesMap));
    });
    copyPropsDeep(res, val, instanceClone, instancesMap);
    return res;
}

function cloneSetDeep(val, instanceClone, instancesMap) {
    var res = new val.constructor();
    instancesMap.set(val, res);
    val.forEach(function (value) {
        res.add(cloneDeep(value, instanceClone, instancesMap));
    });
    copyPropsDeep(res, val, instanceClone, instancesMap);
    return res;
}

// Shallow clone

function cloneShallow(val, instanceClone, type) {
    if (!type) {
        type = typeOf(val);
    }
    switch (type) {
        case 'array':
            return cloneArrayShallow(val);
        case 'object':
            return cloneObjectShallow(val, instanceClone);
        case 'date': {
            var res = new val.constructor(Number(val));
            copyPropsShallow(res, val);
            return res;
        }
        case 'map': {
            var res = new Map(val);
            copyPropsShallow(res, val);
            return res;
        }
        case 'set': {
            var res = new Set(val);
            copyPropsShallow(res, val);
            return res;
        }
        case 'regexp':
            return cloneRegExpShallow(val);
        case 'error':
            return cloneObjectShallow(val, true);
        default: {
            return val;
        }
    }
}

function cloneObjectShallow(val, instanceClone) {
    if (typeof instanceClone === 'function' && instanceClone.lastValue !== val) {
        instanceClone.lastValue = val;
        var res = instanceClone(val);
        instanceClone.lastValue = null;
        return res;
    }
    if (instanceClone || isPlainObject(val)) {
        var res = Object.create(Object.getPrototypeOf(val));
        copyPropsShallow(res, val);
        return res;
    }
    return val;
}

function copyPropsShallow(res, val, filter) {
    var ownProperties = Object.getOwnPropertyNames(val);
    if (filter) {
        ownProperties = ownProperties.filter(function (prop) {
            return !(prop in res);
        });
    }
    setValueCloneShallow(val, res, Object.getOwnPropertyNames(val));
    if (Object.getOwnPropertySymbols) {
        setValueCloneShallow(val, res, Object.getOwnPropertySymbols(val));
    }
}

function setValueCloneShallow(val, res, keys) {
    for (var i = 0, length = keys.length; i < length; i++) {
        var key = keys[i];
        var descriptor = Object.getOwnPropertyDescriptor(val, key);
        var newDescriptor = Object.assign({}, descriptor);
        if ('value' in newDescriptor) {
            newDescriptor.value = val[key];
        }
        Object.defineProperty(res, key, newDescriptor);
    }
}

function cloneArrayShallow(val) {
    var res = new val.constructor(val.length);
    for (var i = 0; i < val.length; i++) {
        res[i] = val[i];
    }
    copyPropsShallow(res, val, true);
    return res;
}

function cloneRegExpShallow(val) {
    var res = new val.constructor(val.source, val.flags || '');
    res.lastIndex = val.lastIndex;
    copyPropsShallow(res, val, true);
    return res;
}

// Exports

Object.defineProperty(exports, "__esModule", { value: true });
module.exports.default = cloneDeep;
module.exports.cloneDeep = cloneDeep;
module.exports.cloneShallow = cloneShallow;
