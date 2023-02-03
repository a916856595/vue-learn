// page 74
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
  // +++ 声明旧值、新值
  let oldValue, newValue;
  // *** 使用effect触发对象的track及trigger
  // *** 获取副作用函数的调用权
  const doEffect = effect(
    // 生成副作用函数
    getEffectFn(source),
    // 副作用执行后，触发callback
    {
      scheduler(doWrappedEffect) {
        // +++ 调用副作用函数获取最新的结果，此处的doWrappedEffect与外部doEffect相等
        newValue = doWrappedEffect();
        // *** 调用callback，并传递oldValue，newValue
        callback(oldValue, newValue);
        // +++ 更新旧值，为下一次调用callback做好准备
        oldValue = newValue;
      },
      // +++ 延迟执行副作用，以此通过手动调用副作用取得计算结果并赋值给oldValue
      lazy: true,
  });

  // +++ 旧值是传入lazy的effect的执行结果
  oldValue = doEffect();
}

export { watch };
