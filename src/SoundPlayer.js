const Status = {
  DOWN: 0,
  READY: 1,
  PLAY: 2,
  WAIT: 3,
};

export default class SoundPlayer {
  /**
   * コンストラクタ
   *
   * @param {Number} waitTime 再生後の待機時間
   */
  constructor(waitTime) {
    this.waitTime = waitTime;
    this.onReadyFunc = () => {};
    this.status = Status.DOWN;
  }

  up() {
    this.status = Status.READY;
  }

  down() {
    this.status = Status.DOWN;
  }

  play() {
    if (this.status === Status.READY) {
      this.status = Status.PLAY;
    }
  }

  stop() {
    if (this.status === Status.PLAY) {
      this.status = Status.WAIT;
      setTimeout(() => {
        this.status = Status.READY;
        this.onReadyFunc();
      }, this.waitTime * 1000);
    }
  }

  isDown() {
    return this.status === Status.DOWN;
  }

  isReady() {
    return this.status === Status.READY;
  }

  isPlaying() {
    return this.status === Status.PLAY;
  }

  /**
   * 待機状態になったときのコールバックをセット
   *
   * @param {Function} onReadyFunc 待機状態になったときのコールバック
   */
  setOnReadyFunc(onReadyFunc) {
    this.onReadyFunc = onReadyFunc;
  }
}
