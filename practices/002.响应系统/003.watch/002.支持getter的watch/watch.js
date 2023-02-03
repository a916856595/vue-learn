// page 73
import { effect } from './proxy.js';

// 遍历读取对象的键值，以触发track
function traverse(value, seen = new Set()) {
  // 目前只考虑简单的对象，简单值和已在seen集合中的对象不在track范围内
  if (
    typeof value !== 'object'
    || value === null
    || seen.has(value)
  ) return;

  // 读取过对象后，存储到seen集合中，避免循环引用的对象导致死循环
  seen.add(value);
  // 深层遍历对象，读取所有字段，触发track
  for (const key in value) {
    // 递归调用读取对象属性
    traverse(value[key], seen);
  }

  return value;
}

/**
 * 根据source参数生成读取对象属性的函数
 * @param {Object | Function} source 需要监听的响应式对象或包含响应式对象的函数
 * @returns {(function(): undefined)|*}
 */
function getEffectFn(source) {
  const type = typeof source;
  // 如果是对象，则使用traverse读取对象
  if (type === 'object') {
    return () => traverse(source);
    // 如果是包含响应式对象的函数，则直接返回
  } else if (type === 'function') {
    return source;
  }
}

/**
 * 监听对象
 * @param {Object} source 需要监听的对象
 * @param {Function} callback 监听回调
 */
function watch(source, callback) {
  // 使用effect触发对象的track及trigger
  effect(
    // 生成副作用函数
    getEffectFn(source),
    // 副作用执行后，触发callback
    {
      scheduler() {
        // 调用callback
        callback();
      }
  });
}

export { watch };
