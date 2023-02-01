/**
 *
 * @param {Object} vnode 虚拟节点信息，tag 元素标签  props 元素属性 children 子元素
 * @param {HTMLElement} container 容器节点
 */
function render(vnode, container) {
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
