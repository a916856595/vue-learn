'use strict';
(function (gobal) {
    var obj = {};

    function $() {
        this.ObjToString = ObjToString;
        this.isArray = isArray;
        this.isObject = isObject;
        this.isFunction = isFunction;
        this.isString = isString;
        this.clone = clone;
        this.cloneDeep = cloneDeep;
        this.forEach = forEach;
        this.map = map;
        this.findIndex = findIndex;
    }

    function ObjToString(value) {
        return obj.toString.call(value);
    }

    function isArray(value) {
        if (ObjToString(value) === '[object Array]') {
            return true;
        }
        return false;
    }

    function isObject(value) {
        if (ObjToString(value) === '[object Object]') {
            return true;
        }
        return false;
    }

    function isFunction(value) {
        if (ObjToString(value) === '[object Function]') {
            return true;
        }
        return false;
    }

    function isString(value) {
        if (typeof value === 'string') {
            return true;
        }
        return false;
    }

    function clone(value) {
        var result, flag;
        if (isArray(value)) {
            flag = true;
            result = [];
        } else if (isObject(value)) {
            flag = true;
            result = {};
        }
        if (flag) {
            forEach(value, function (value, index) {
                result[index] = value;
            });
        } else {
            result = value;
        }
        return result;
    }

    function cloneDeep(value) {
        var result, flag;
        if (isArray(value)) {
            flag = true;
            result = [];
        } else if (isObject(value)) {
            flag = true;
            result = {};
        }
        if (flag) {
            forEach(value, function (value, index) {
                if (isArray(value) || isObject(value)) {
                    result[index] = cloneDeep(value);
                } else {
                    result[index] = value;
                }
            });
            return result;
        } else {
            return value;
        }
    }

    function forEach(arr, callback) {
        if (isArray(arr)) {
            var length = arr.length;
            var index = 0;
            while (index < length) {
                callback(arr[index], index, arr);
                index++;
            }
        } else if (isObject(arr)) {
            for (var key in arr) {
                callback(arr[key], key, arr);
            }
        } else {
            return arr;
        }
    }

    function map(arr, callback) {
        var resultArr = [];
        if (isArray(arr)) {
            var length = arr.length;
            var index = 0;
            while (index < length) {
                resultArr.push(callback(arr[index], index, arr));
                index++;
            }
        } else if (isObject(arr)) {
            for (var key in arr) {
                resultArr.push(callback(arr[key], key, arr));
            }
        } else {
            return arr;
        }
        return resultArr;
    }

    function findIndex(arr, callback, isReverse) {
        if (isArray(arr) && !isReverse) {
            var length = arr.length;
            var index = 0;
            while (index < length) {
                if (callback(arr[index], index, arr)) {
                    return index;
                }
                index ++;
            }
            return -1;
        } else if (isArray(arr) && isReverse) {
            var length = arr.length;
            while (length > -1) {
                if (callback(arr[length], length, arr)) {
                    return length;
                }
                length--;
            }
            return length;
        } else {
            return -1;
        }
    }

    gobal.$ = new $();
})(window);