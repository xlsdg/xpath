/**
 * @file xpath路径处理工具
 * @author xuexb <fe.xiaowu@gmail.com>
 */

/* eslint-disable no-unused-vars */

/**
 * 获取元素xpath路径
 *
 * @param  {HTMLElement} element 元素
 * @param  {HTMLElement} [context=document.body] 父节点
 *
 * @return {string} xpath 路径
 */
export function getXpath(element, context) {
  // 参数验证
  if (!element) {
    throw new TypeError('element cannot be empty');
  } else if ((element === window) || (element === document.documentElement)) {
    throw new TypeError('element should be a descendent of body');
  } else if (element.nodeType !== 1) {
    throw new TypeError('element should be a single node');
  } else if (context && (context.nodeType !== 1)) {
    throw new TypeError('context should be a single node');
  }

  // 特殊处理返回
  if (element.id !== '') {
    return '//*[@id="' + element.id + '"]';
  } else if (element === document.body) {
    return '/html/body';
  } else if (element === context) {
    return '';
  }

  let index = 1;
  let str = '';

  [].slice.call(element.parentNode.childNodes).forEach(function(sibling) {
    if (sibling === element) {
      str = getXpath(element.parentNode, context);

      // 需要连接符
      if (str) {
        str += '/';
      }

      str += element.tagName.toLowerCase() + '[' + (index) + ']';
    } else if ((sibling.nodeType === 1) &&
      (sibling.tagName === element.tagName)) {
      index += 1;
    }
  });

  // 如果同级节点只有一个标签, 则去掉索引
  if ((index === 1) && str) {
    str = str.substr(0, str.length - 3);
  }

  return str;
}

/**
* 解析xpath路径为dom元素
* 查找元素
*
* @param  {string} query   xpath路径
* @param  {HTMLElement} [context=document.body] 父节点
*
* @return {HTMLElement} dom 元素
*/
export function parseXpath(query, context) {
  if (!query) {
    throw new TypeError('query cannot be empty');
  } else if (typeof query !== 'string') {
    throw new TypeError('query should be a string');
  } else if (context && (context.nodeType !== 1)) {
    throw new TypeError('context should be a single node');
  }

  // 如果没有父节点认为是body
  if (!context) {
    context = document.body;
    query = query.replace('/html/body', '');
  }

  var data = query.replace(/\/\/\*\[@id="(\S+)"\]/g, '#$1').split(/\//);
  var node = context;
  var selector = data.shift();
  do {
    if (selector) {
      node = find(selector, node);
    }

    if (!node) {
      break;
    }
  } while (selector = data.shift());

  return node;
}

/**
* 查找元素
*
* @param  {string} str    选择器
* @param  {HTMLElement} parent 父容器
*
* @return {HTMLElement} dom 元素
*/
function find(str, parent) {
  if (str.substr(0, 1) === '#') {
    return document.getElementById(str.substr(1));
  }

  const matched = str.match(/(\w+)(\[(\d+)\])?/);
  const tagName = matched[1];
  const index = parseInt(matched[3], 10) || 1;
  const nodes = parent.childNodes;

  let node = null;
  let match = 0;

  for (let i = 0, len = nodes.length; i < len; i++) {
    // 如果同标签
    if ((nodes[i].nodeType === 1) &&
      (nodes[i].tagName.toLowerCase() === tagName)) {
      match += 1;
      if (index === match) {
        node = nodes[i];
        break;
      }
    }
  }

  return node;
}

/* eslint-enable no-unused-vars */
