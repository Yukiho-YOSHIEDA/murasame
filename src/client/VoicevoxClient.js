import axios from 'axios';

export default class VoicevoxClient {
  /**
   * コンストラクタ
   *
   * @param {string} baseUrl Base URL
   * @param {integer} speakerId 話させるキャラクタのID
   */
  constructor(baseUrl, speakerId) {
    this.baseUrl = baseUrl;
    this.speakerId = speakerId;
  }

  /**
   * 音声を生成します
   *
   * @param {string} text 話すテキスト
   * @returns 音声データのstream
   */
  async generateVoice(text) {
    const audioQueryParams = {
      text,
      speaker: this.speakerId,
    };
    const audioQueryResponse = await axios.post(`${this.baseUrl}/audio_query`, null, {
      params: audioQueryParams,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const synthesisParams = {
      speaker: this.speakerId,
    };

    const synthesisResponse = await axios.post(`${this.baseUrl}/synthesis`, audioQueryResponse.data, {
      params: synthesisParams,
      headers: {
        Accept: 'audio/wav',
        'Content-Type': 'application/json',
      },
      responseType: 'stream',
    });

    return synthesisResponse.data;
  }
}
