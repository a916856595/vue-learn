// page 41

// 临时存储副作用函数
let activeEffect;
// 对象与副作用函数的对应关系
const bucket = new WeakMap();

// 触发绑定映射关系函数
function effect(fn) {
  // 存储副作用函数
  activeEffect = fn;
  // 调用副作用函数以触发代理的getter
  fn();
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

  // 依次触发副作用函数
  effectSet.forEach(effect => effect());
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
