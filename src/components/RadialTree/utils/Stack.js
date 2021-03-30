const defaultComparator = (a, b) => {
  if (a === b) {
    return true
  }

  return false
}

/**
 * 链表中单个元素节点
 */
class LinkedListNode {
  /**
   *
   * @param {*} value
   * @param {LinkedListNode} next - 下一个元素节点
   */
  constructor(value, next) {
    this.value = value
    this.next = next
  }
}

class LinkedList {
  constructor(comparator = defaultComparator) {
    this.head = null // 头指针
    this.tail = null // 尾指针
    this.compare = comparator
  }

  /**
   * 将指定元素添加到链表头部
   * @param value
   */
  prepend(value) {
    // 在头部添加一个节点
    const newNode = new LinkedListNode(value, this.head)
    this.head = newNode

    if (!this.tail) {
      this.tail = newNode
    }

    return this
  }

  /**
   * 删除指定元素
   * @param value 要删除的元素
   * @returns deleteNode 被删除的链表节点
   */
  delete(value) {
    if (!this.head) {
      return null
    }

    let deleteNode = null

    // 如果删除的是头部元素，则将next作为头元素
    while (this.head && this.compare(this.head.value, value)) {
      deleteNode = this.head
      this.head = this.head.next
    }

    let currentNode = this.head

    if (currentNode !== null) {
      // 如果删除了节点以后，将next节点前移
      while (currentNode.next) {
        if (this.compare(currentNode.next.value, value)) {
          deleteNode = currentNode.next
          currentNode.next = currentNode.next.next
        } else {
          currentNode = currentNode.next
        }
      }
    }

    // 检查尾部节点是否被删除
    if (this.compare(this.tail.value, value)) {
      this.tail = currentNode
    }

    return deleteNode
  }

  /**
   * 删除尾部节点
   */
  deleteTail() {
    const deletedTail = this.tail

    if (this.head === this.tail) {
      // 链表中只有一个元素
      this.head = null
      this.tail = null
      return deletedTail
    }

    let currentNode = this.head
    while (currentNode.next) {
      if (!currentNode.next.next) {
        currentNode.next = null
      } else {
        currentNode = currentNode.next
      }
    }

    this.tail = currentNode

    return deletedTail
  }

  /**
   * 删除头部节点
   */
  deleteHead() {
    if (!this.head) {
      return null
    }

    const deletedHead = this.head

    if (this.head.next) {
      this.head = this.head.next
    } else {
      this.head = null
      this.tail = null
    }

    return deletedHead
  }

  /**
   * 将链表中的节点转成数组元素
   */
  toArray() {
    const nodes = []

    let currentNode = this.head

    while (currentNode) {
      nodes.push(currentNode)
      currentNode = currentNode.next
    }

    return nodes
  }
}

export default class Stack {
  constructor(maxStep = 10) {
    this.linkedList = new LinkedList()
    this.maxStep = maxStep
  }

  get length() {
    return this.linkedList.toArray().length
  }

  /**
   * 判断栈是否为空，如果链表中没有头部元素，则栈为空
   */
  isEmpty() {
    return !this.linkedList.head
  }

  /**
   * 访问顶端元素
   */
  peek() {
    if (this.isEmpty()) {
      return null
    }

    // 返回头部元素，不删除元素
    return this.linkedList.head.value
  }

  push(value) {
    this.linkedList.prepend(value)
    if (this.length > this.maxStep) {
      this.linkedList.deleteTail()
    }
  }

  pop() {
    const removeHead = this.linkedList.deleteHead()
    return removeHead ? removeHead.value : null
  }

  toArray() {
    return this.linkedList.toArray().map((node) => node.value)
  }

  clear() {
    while (!this.isEmpty()) {
      this.pop()
    }
  }
}
