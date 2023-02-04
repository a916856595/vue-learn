// page 80
import { effect } from './proxy.js';

/**
 *
 * 1. 要避免竟态问题，需要在调用下一次用户回调前将上一次的状态设置为过期，这里的实现方式是给用户一个onCleanup函数，在调用后会缓存用户的cleanup
 * 清空函数，在执行下次监听回调之前调用用户的cleanup函数，设置对应的状态。
 */

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
 * @param {Function} callback 监听回调，三个回调参数分别为 oldValue、newValue、onCleanup
 * @param {Object} [options] 监听选项
 * @param {boolean} [options.immediate = false] 是否立即执行监听回调，默认false不立即执行
 * @param {string} [options.flush = sync] 监听回调的执行时机，'post' 在微任务中执行， 'sync' 同步执行
 */
function watch(source, callback, options = {}) {
  // 声明旧值、新值
  let oldValue, newValue;
  // immediate是否立即执行监听回调的参数
  // flush用于确定callback执行的时机
  const { immediate, flush } = options;
  // +++ 用于存储用户的清除过期内容的函数
  let cleanup;
  // +++ onCleanup交与用户调用，当用户调用后，更新缓存的用户cleanup函数
  const onCleanup = (cleanupOfUser) => {
    // 更新缓存的用户cleanup函数
    cleanup = cleanupOfUser;
  };
  // 封装计算新、旧值并传递给callback的函数
  function job() {
    // 调用副作用函数获取最新的结果，此处与scheduler的回调参数相等
    newValue = doEffect();
    // +++ 如果缓存过cleanup，则调用并清空cleanup缓存
    if (cleanup) {
      // +++ 调用用户的cleanup清除函数
      cleanup();
      // +++ 清空cleanup缓存，避免后续重复调用
      cleanup = null;
    }
    // 调用callback，并传递oldValue，newValue
    // *** 将内部的onCleanup交于用户，调用后可以更新缓存的cleanup值
    callback(oldValue, newValue, onCleanup);
    // 更新旧值，为下一次调用callback做好准备
    oldValue = newValue;
  }
  // 使用effect触发对象的track及trigger
  // 获取副作用函数的调用权
  const doEffect = effect(
    // 生成副作用函数
    getEffectFn(source),
    // 副作用执行后，调用job生成newValue传递给callback
    {
      scheduler() {
        // 当flush为post时，表示需要微任务队列中执行监听回调callback
        if (flush === 'post') {
          Promise
            .resolve()
            .then(job);
          // 当flush为sync或其他值时，表示立即执行监听回调callback
        } else {
          job();
        }
      },
      // 延迟执行副作用，以此通过手动调用副作用取得计算结果并赋值给oldValue
      lazy: true,
  });

  // 如果传入immediate立即执行监听回调，则调用job，并生成newValue传递给callback
  if (immediate) job()
  else {
    // immediate是false，仅获取旧值，旧值是传入lazy的effect的执行结果
    oldValue = doEffect();
  }
}

export { watch };
