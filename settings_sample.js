const setting = {
  DISCORD: {
    TARGET_VOICE_ROOM: '',
    TARGET_CHAT_ROOM: '',
    TOKEN: '',
    WAIT_TIME: 1,
    QUEUE_SIZE: 100,
  },
  VOICEVOX: {
    BASE_URL: 'http://engine:50021',
    SPEAKER_ID: 3,
  },
  BLACKLIST: {
    REGEX: [
      /https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+/g,
      /<(:|@).*>/g,
      /\?.*/g,
    ],
  },
};

export default {
  DISCORD: setting.DISCORD,
  VOICEVOX: setting.VOICEVOX,
  BLACKLIST: setting.BLACKLIST,
};
