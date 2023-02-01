// page 41

// 临时存储副作用函数
let activeEffect;
// 对象与副作用函数的对应关系
const bucket = new WeakMap();
// 绑定数据与副作用函数的映射关系函数
function effect(fn) {
  // 存储副作用函数
  activeEffect = fn;
  // 调用副作用函数以触发代理的getter
  fn();
}

function trace(target, key) {
  if (!activeEffect) return;

  let targetMapping = bucket.get(target);
  if (!targetMapping) {
    targetMapping = new Map();
    bucket.set(target, targetMapping);
  }

  let effectSet = targetMapping.get(key);
  if (!effectSet) {
    effectSet = new Set();
    targetMapping.set(key, effectSet);
  }

  effectSet.add(activeEffect);
  activeEffect = null;
}


function trigger(target, key) {
  const targetMapping = bucket.get(target);
  if (!targetMapping) return;

  const effectSet = targetMapping.get(key);
  if (!effectSet) return;

  effectSet.forEach(effect => {
    effect();
  });
}



// 需要代理的对象
const data = {
  text: '',
};

// 代理对象
const obj = new Proxy(data, {
  get(target, key, receiver) {
    trace(target, key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, receiver) {
    Reflect.set(target, key, receiver);
    trigger(target, key);
  },
});

