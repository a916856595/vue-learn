// page 59

// 要解决多余副作用函数的问题，需要在每次副作用函数执行时将其从集合中删除

// 临时存储副作用函数
let activeEffect;
// 存储副作用函数的栈
const effectStack = [];
// 对象与副作用函数的对应关系
const bucket = new WeakMap();

// 触发绑定映射关系函数
function effect(fn) {
  const doEffect = function() {
    // 执行副作用前清空对当前副作用的引用
    cleanup(doEffect);
    // 存储副作用函数及dependence的引用
    activeEffect = doEffect;
    // 将副作用函数存入栈中，以支持嵌套effect
    effectStack.push(activeEffect);
    // 调用副作用函数以触发代理的getter（收集副作用）
    fn();
    // 在副作用收集完成后，移除栈中的最后一项
    effectStack.pop();
    // 将副作用记录值更新为上层的副作用，这样就能支持嵌套的effect
    activeEffect = effectStack[effectStack.length - 1];
  }

  // doEffect.dependence用于存储包含此副作用函数的集合,用于清除集合中的effect
  doEffect.dependence = [];
  // 开始执行
  doEffect();
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
function trigger(target, key) {
  // 查询代理对象的映射关系
  const targetMapping = bucket.get(target);
  if (!targetMapping) return;

  // 查询代理对象对应键值的副作用函数集合
  const effectSet = targetMapping.get(key);
  if (!effectSet) return;

  // doEffect()中会调用cleanup清除副作用，随后fn又重新添加副作用，最终导致effectSet无限循环
  // 因此需要使用新的Set集合来执行循环，避免无限循环。详见 page 55
  const effectSetCloned = new Set();
  // 如果当前要执行的副作用与记录值activeEffect一致，则不执行，避免递归调用副作用
  effectSet.forEach(effect => {
    if (effect !== activeEffect) effectSetCloned.add(effect);
  });
  // 依次触发副作用函数
  effectSetCloned.forEach(effect => effect());
}


function useProxy(data) {
  return new Proxy(data, {
    // 拦截属性读取操作
    get(target, key, receiver) {
      // 追踪属性读取
      track(target, key);
      return Reflect.get(target, key, receiver);
    },
    // 拦截属性设置操作
    set(target, key, receiver) {
      Reflect.set(target, key, receiver);
      // 需要先设置键值后再触发副作用函数，否则会使用代理对象的旧键值
      trigger(target, key);
    },
  });
}
