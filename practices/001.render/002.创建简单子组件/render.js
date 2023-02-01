// page 32

/**
 *
 * @param {Object} vnode 虚拟节点信息，tag 元素标签  props 元素属性 children 子元素
 * @param {HTMLElement} container 容器节点
 */
function renderElement(vnode, container) {
  const { tag, props, children } = vnode;
  // 创建节点元素
  const element = document.createElement(tag);
  // 将属性挂载到节点
  if (props) {
    Object.entries(props).forEach(keyAndValue => {
      const [key, value] = keyAndValue;
      element.setAttribute(key, value);
    });
  }
  if (typeof children === 'string') {
    element.appendChild(document.createTextNode(children));
  } else if (Array.isArray(children)) {
    // 递归添加子节点
    children.forEach(child => render(child, element));
  }
  // 将元素添加到容器中
  container.appendChild(element);
}

function renderComponent(component, container) {
  const { tag } = component;
  const tagType = typeof tag;
  let vnode;
  if (tagType === 'object') {
    // 对象组件需要包含一个返回vnode的render属性
    vnode = tag.render();
  }
  else if (tagType === 'function') {
    // 函数组件的返回值是vnode
    vnode = tag();
  }
  // 如果生成了虚拟节点，则进行渲染
  if (vnode) {
    renderElement(vnode, container);
  }
}

// 渲染元素或组件
function render(vnode, container) {
  const { tag } = vnode;
  const tagType = typeof tag;
  if (tagType === 'string') renderElement(vnode, container);
  else if (tagType === 'function' || tagType === 'object') renderComponent(vnode, container);
}
