// page 65

import { effect } from './proxy.js';

/**
 * 计算属性
 * @param {Function} getter 包含依赖项的计算函数
 * @returns {{readonly value: *}|*}
 */
function computed(getter) {
  // 生成延迟计算结果的effect
  const effectFn = effect(getter, { lazy: true });

  // 拦截对象的value属性，当读取value时返回计算结果
  const obj = {
    get value() {
      // 返回计算结果
      return effectFn();
    }
  };

  // 返回拦截后的对象
  return obj;
}

export { computed };
