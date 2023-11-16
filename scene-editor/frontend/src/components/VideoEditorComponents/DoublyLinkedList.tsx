/**
 * DoublyLinkedList.tsx
 *
 * Description:
 * This file defines a generic Doubly Linked List (DLL) data structure.
 * The DLL consists of nodes, each containing data, a reference to the
 * previous node (prev), and a reference to the next node (next).
 * The DLL supports common operations such as append, prepend, delete,
 * print, printReverse, findNodeByAccumulatedSum, insertNode, deleteSelectedNodes,
 * and appendSelectedNodes.
 *
 */

export class DLLNode<T> {
  id: number;
  data: T;
  prev: DLLNode<T> | null;
  next: DLLNode<T> | null;
  selected: boolean;

  private static counter = 0;

  constructor(data: T) {
    this.data = data;
    this.prev = null;
    this.next = null;
    this.id = DLLNode.counter++;
    this.selected = false;
  }
}

export class DoublyLinkedList<T> {
  head: DLLNode<T> | null;
  tail: DLLNode<T> | null;
  length: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  /**
   * Append a new node with data to the end of the list.
   * @param data The data to be stored in the new node.
   */
  append(data: T): void {
    const newNode = new DLLNode(data);

    if (!this.head) {
      // The list is empty
      this.head = newNode;
      this.tail = newNode;
    } else {
      // Append the new node to the end of the list
      newNode.prev = this.tail;
      this.tail!.next = newNode;
      this.tail = newNode;
    }

    this.length++;
  }

  /**
   * Prepend a new node with data to the beginning of the list.
   * @param data The data to be stored in the new node.
   */
  prepend(data: T): void {
    const newNode = new DLLNode(data);

    if (!this.head) {
      // The list is empty
      this.head = newNode;
      this.tail = newNode;
    } else {
      // Prepend the new node to the beginning of the list
      newNode.next = this.head;
      this.head!.prev = newNode;
      this.head = newNode;
    }

    this.length++;
  }

  /**
   * Delete all selected nodes in the doubly linked list. Compute the total
   * amount of value removed using the `value` function and return it.
   * @param value Function to compute the value of the data.
   * @returns The total amount of value removed from the doubly linked list.
   */
  deleteNodes(indices: number[], value: (data: T) => number): number {
    let current = this.head;
    let valueRemoved = 0;

    while (current) {
      if (indices.includes(current.id)) {
        if (current.prev) {
          current.prev.next = current.next;
        } else {
          this.head = current.next;
        }

        if (current.next) {
          current.next.prev = current.prev;
        } else {
          this.tail = current.prev;
        }

        this.length--;

        valueRemoved += value(current.data);
      }

      current = current.next;
    }
    return valueRemoved;
  }

  /**
   * Append all selected nodes in the doubly linked list. Compute the total
   * amount of value added using the `value` function and return it.
   * @param value Function to compute the value of the data.
   * @returns The total amount of value added to the doubly linked list.
   */
  appendNodes(indices: number[], value: (data: T) => number): number {
    let current = this.head;
    let valueAdded = 0;

    while (current) {
      if (indices.includes(current.id)) {
        // Make a copy of the node's data and append it to the list
        this.append({ ...current.data });
        valueAdded += value(current.data);
      }

      current = current.next;
    }

    return valueAdded;
  }

  /**
   * Compute the sum of all nodes in the doubly linked list.
   * @param value A function to calculate the value of the node.
   * @returns the sum
   */
  sum(value: (data: T) => number): number {
    let current = this.head;
    let accumulatedSum = 0;

    while (current) {
      accumulatedSum += value(current.data);
      current = current.next;
    }

    return accumulatedSum;
  }

  /**
   * Find an ID in the doubly linked list.
   * @param targetId ID to find.
   * @returns the node with the given ID `targetId`.
   */
  findID(targetId: number): DLLNode<T> | null {
    let current = this.head;

    while (current) {
      if (current.id === targetId) {
        return current;
      }
      current = current.next;
    }

    return null;
  }

  /**
   * Find the first node whose accumulated sum exceeds or equals the target sum.
   * @param targetSum The target sum to be compared against.
   * @param value A function to calculate the value of the node.
   * @returns An object with the found node and the difference between the
   * accumulated sum and the target sum before the node made a contribution.
   */
  findNodeByAccumulatedSum(
    targetSum: number,
    value: (data: T) => number
  ): { node: DLLNode<T> | null; offset: number } {
    let current = this.head;
    let accumulatedSum = 0;

    while (current) {
      if (accumulatedSum + value(current.data) >= targetSum) {
        const offset = targetSum - accumulatedSum;
        return { node: current, offset };
      }
      accumulatedSum += value(current.data);
      current = current.next;
    }

    return { node: null, offset: 0 };
  }

  /**
   * Insert a new node with data before a specified node.
   * @param data The data to be stored in the new node.
   * @param beforeNode The node before which the new node should be inserted.
   */
  insertNode(data: T, beforeNode: DLLNode<T> | null): void {
    const newNode = new DLLNode(data);

    if (!beforeNode) {
      // If beforeNode is null, treat it as an append operation
      this.append(data);
      return;
    }

    newNode.prev = beforeNode.prev;
    newNode.next = beforeNode;

    if (beforeNode.prev) {
      beforeNode.prev.next = newNode;
    } else {
      // If beforeNode is the head, update the head
      this.head = newNode;
    }

    beforeNode.prev = newNode;

    this.length++;
  }

  /**
   * Split a node at the specified target sum using a custom split function.
   * @param targetSum The target sum to find the node for splitting.
   * @param value A function to calculate the value of the node.
   * @param split A function to split the node into two parts.
   */
  split(
    targetSum: number,
    value: (data: T) => number,
    split: (
      data: T,
      splitIndex: number
    ) => { firstPart: T; secondPart: T } | { firstPart: T; secondPart: null }
  ): void {
    const { node, offset: exceededBy } = this.findNodeByAccumulatedSum(
      targetSum,
      value
    );

    if (node) {
      const splitResult = split(node.data, exceededBy);

      if (splitResult.secondPart !== null) {
        // Update the original node's data with the second part of the split data
        node.data = splitResult.secondPart;

        // Insert the new node before the original node
        this.insertNode(splitResult.firstPart, node);

        this.length++;
      }
    }
  }

  /**
   * Check if any node satisfies the given condition.
   * @param satisfies Function to check if the node satisfies the condition.
   * @returns true if any node satisfies the condition, false otherwise.
   */
  any(satisfies: (data: T) => boolean): boolean {
    let current = this.head;

    while (current) {
      if (satisfies(current.data)) {
        return true;
      }

      current = current.next;
    }

    return false;
  }

  /**
   * Check if all nodes satisfy the given condition.
   * @param satisfies Function to check if the node satisfies the condition.
   * @returns true if all nodes satisfy the condition, false otherwise.
   */
  all(satisfies: (data: T) => boolean): boolean {
    let current = this.head;

    while (current) {
      if (!satisfies(current.data)) {
        return false;
      }

      current = current.next;
    }

    return true;
  }

  print(printFunction: (data: T) => void): void {
    let current = this.head;
    while (current) {
      printFunction(current.data);
      current = current.next;
    }
  }

  printReverse(printFunction: (data: T) => void): void {
    let current = this.tail;
    while (current) {
      printFunction(current.data);
      current = current.prev;
    }
  }
}
