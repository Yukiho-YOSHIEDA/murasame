/**
 * インメモリでメッセージを管理するクラス
 */
export default class InMemoryMessageStoreRepository {
  /**
   * コンストラクタ
   *
   * @param {number} queueSize
   */
  constructor(queueSize) {
    this.queue = [];
    this.queueSize = queueSize;
  }

  /**
   * メッセージをエンキューします
   * サイズから溢れたときは先頭がデキューされます
   *
   * @param {string} message メッセージ
   */
  enqueue(message) {
    this.queue.push(message);
    if (this.queue.length > this.queueSize) {
      this.dequeue();
    }
  }

  /**
   * メッセージをデキューします
   * データがない場合はnullを返却します
   *
   * @returns メッセージ
   */
  dequeue() {
    return this.queue.shift() ?? null;
  }

  /**
   * メッセージの先頭を取得します
   * デキューではないので先頭がドロップすることはないです
   * データがない場合はnullを返却します
   *
   * @returns メッセージ
   */
  fetchFirst() {
    return this.queue[0] ?? null;
  }

  /**
   * キューを初期化します
   */
  reset() {
    this.queue = [];
  }
}
