// page 107

// 要解决多余副作用函数的问题，需要在每次副作用函数执行时将其从集合中删除

/**
 * 1. 代理对象
 * 1.1 代理对象in操作，要代理in操作，可通过Proxy的has实现
 * 1.2 代理对象for...in操作，可通过Proxy的ownKeys实现
 * 1.3 代理对象delete操作，可通过Proxy的deleteProperty实现
 *
 * 2. 合理触发trigger
 * 2.1 仅在值变化时触发，如果变化前后的值均为NaN，也不触发
 * 2.2 当原型链上的两个对象均为响应式对象，读取子实例不存在的属性时，应仅触发一次副作用
 */


// 临时存储副作用函数
let activeEffect;
// 存储副作用函数的栈
const effectStack = [];
// 对象与副作用函数的对应关系
const bucket = new WeakMap();
// 记录for...in循环的副作用key值，避免与对象值重复
const ITERATE_KEY = Symbol();
// trigger函数的触发类型
const triggerType = {
  ADD: 'add',
  UPDATE: 'update',
  DELETE: 'delete',
};

/**
 * 绑定对象与副作用的映射关系
 * @param {Function} fn 副作用函数
 * @param {Object} options 副作用选项
 * @param {Function} [options.scheduler] 调度函数，回调参数是副作用函数
 * @param {boolean} [options.lazy] 是否延迟调用副作用，默认false直接调用
 */
function effect(fn, options = {}) {
  const { lazy = false } = options;

  const doEffect = function() {
    // 执行副作用前清空对当前副作用的引用
    cleanup(doEffect);
    // 存储副作用函数及dependence的引用
    activeEffect = doEffect;
    // 将副作用函数存入栈中，以支持嵌套effect
    effectStack.push(activeEffect);
    // 调用副作用函数以触发代理的getter（收集副作用），并保存结果
    const result = fn();
    // 在副作用收集完成后，移除栈中的最后一项
    effectStack.pop();
    // 将副作用记录值更新为上层的副作用，这样就能支持嵌套的effect
    activeEffect = effectStack[effectStack.length - 1];
    // 包装函数返回副作用的返回值，可以用于计算属性
    return result;
  }

  // doEffect.dependence用于存储包含此副作用函数的集合,用于清除集合中的effect
  doEffect.dependence = [];
  // 将参数挂载到副作用函数
  doEffect.options = options;
  if (lazy) {
    // 如果是延迟调用，则返回副作用的包装函数
    return doEffect;
  } else {
    // 非延迟则直接调用副作用包装函数
    doEffect();
  }
}

// 清空缓存的副作用函数绑定的依赖集合
function cleanup(doEffect) {
  // 从集合中删除副作用函数
  doEffect.dependence.forEach(effectSet => {
    effectSet.delete(doEffect);
  });

  // 重置使用此副作用函数集合的集
  doEffect.dependence.length = 0;
}

// 绑定映射关系的函数
function track(target, key) {
  // 如果没有记录副作用函数，直接退出
  if (!activeEffect) return;

  // 获取当前代理对象对应的映射集合
  let targetMapping = bucket.get(target);
  // 映射集合不存在则需要新建
  if (!targetMapping) {
    // 代理对象存在多个键值，使用Map更为合适
    targetMapping = new Map();
    bucket.set(target, targetMapping);
  }

  // 获取代理对象当前键值对应的副作用函数集合
  let effectSet = targetMapping.get(key);
  // 副作用函数集合不存在则需要新建
  if (!effectSet) {
    // 副作用函数集合有先后顺序，Set更合适
    // 且当前实现存在多次存储副作用函数的情况，Set能够自动去重
    effectSet = new Set();
    targetMapping.set(key, effectSet);
  }

  // 存储副作用函数到对应的集合中
  effectSet.add(activeEffect);
  // 将集合存储到使用副作用函数的集合中，用于清空集合内的副作用函数
  activeEffect.dependence.push(effectSet);
  // 可能在一次副作用函数中读取多次属性值，因此不能清空记录的副作用函数
}


// 触发副作用的函数
function trigger(target, key, type) {
  // 查询代理对象的映射关系
  const targetMapping = bucket.get(target);
  if (!targetMapping) return;

  // 查询代理对象对应键值的副作用函数集合
  const effectSet = targetMapping.get(key);
  // 查询代理对象与for...in有关的副作用集合
  const iterateEffectSet = targetMapping.get(ITERATE_KEY);
  // doEffect()中会调用cleanup清除副作用，随后fn又重新添加副作用，最终导致effectSet无限循环
  // 因此需要使用新的Set集合来执行循环，避免无限循环。详见 page 55
  const effectSetCloned = new Set();
  // 如果当前要执行的副作用与记录值activeEffect一致，则不执行，避免递归调用副作用
  effectSet && effectSet.forEach(effect => {
    // 将副作用加入到待执行集合
    if (effect !== activeEffect) effectSetCloned.add(effect);
  });
  // 判断trigger的调用类型是否为add或delete，如果是则需要执行for...in副作用
  if (type === triggerType.ADD || type === triggerType.DELETE) {
    // 将for...in相关的副作用加入到集合中一并执行，仅在trigger的type参数为triggerType.ADD时执行副作用
    iterateEffectSet && iterateEffectSet.forEach(effect => {
      // 将副作用加入到待执行集合
      if (effect !== activeEffect) effectSetCloned.add(effect);
    });
  }
  // 依次触发副作用函数
  effectSetCloned.forEach(effect => {
    const { scheduler } = effect.options;
    // 如果有调度函数，调用调度函数，并将副作用作为参数
    if (scheduler) scheduler(effect);
    // 原逻辑，直接调用副作用
    else effect();
  });
}


function reactive(data) {
  return new Proxy(data, {
    // 拦截属性读取操作
    get(target, key, receiver) {
      // +++ 如果key是raw，则返回代理的目标对象
      if (key === 'raw') {
        return target;
      }
      // 追踪属性读取
      track(target, key);
      return Reflect.get(target, key, receiver);
    },
    // 拦截属性设置操作
    set(target, key, newValue, receiver) {
      // 将值更新到对象之前，记录对象是否具有该属性
      const type = target.hasOwnProperty(key) ? triggerType.UPDATE : triggerType.ADD;
      // 获取旧的属性值
      const oldValue = target[key];
      // 判断新旧值是否相等，且新旧值均不能为NaN
      const isValueChange = oldValue !== newValue && (oldValue === oldValue || newValue === newValue);
      const isSameTarget = target === receiver.raw;
      // 更新对象
      const result = Reflect.set(target, key, newValue, receiver);
      // 需要先设置键值后再触发副作用函数，否则会使用代理对象的旧键值
      // 根据type来确定是否要执行trigger中的for...in副作用
      // 仅在值变化且新旧值均不为NaN时执行trigger
      // *** 仅当target和receiver代理的目标相同时才执行副作用
      isSameTarget && isValueChange && trigger(target, key, type);
      // set需要返回设置结果，否则严格模式下会报错
      return result;
    },
    // 拦截对象的in操作
    has(target, key) {
      // 追踪对象的in操作
      track(target, key);
      // 返回in的判断结果
      return Reflect.has(target, key);
    },
    // 拦截对象for...in操作
    ownKeys(target) {
      // 追踪对象的for...in操作
      track(target, ITERATE_KEY);
      // 返回键值列表
      return Reflect.ownKeys(target);
    },
    // 拦截对象delete操作
    deleteProperty(target, key, receiver) {
      // 判断是否对象自身具有的属性
      const isOwnProperty = target.hasOwnProperty(key);
      // 获取删除操作的结果，操作成功返回true
      const result = Reflect.deleteProperty(target, key);
      // 若删除的是自身的属性且删除成功，调用trigger
      if (isOwnProperty && result) trigger(target, key, triggerType.DELETE);
      // 返回删除的结果
      return result;
    }
  });
}

export {
  effect,
  trigger,
  track,
  reactive,
}
