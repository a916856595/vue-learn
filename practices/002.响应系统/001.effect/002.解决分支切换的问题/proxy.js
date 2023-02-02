// page 50

// 要解决多余副作用函数的问题，需要在每次副作用函数执行时将其从集合中删除

// 临时存储副作用函数
let activeEffect;
// 对象与副作用函数的对应关系
const bucket = new WeakMap();

// 触发绑定映射关系函数
function effect(fn) {
  const doEffect = function() {
    // 执行副作用前清空对当前副作用的引用
    cleanup(doEffect);
    // 存储副作用函数及dependence的引用
    activeEffect = doEffect;
    // 调用副作用函数以触发代理的getter
    fn();
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
  const effectSetCloned = new Set(effectSet);
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
      // set需要返回true，否则严格模式下会报错
      return true;
    },
  });
}
