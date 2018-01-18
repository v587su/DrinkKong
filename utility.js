const config = {
  frequency: 3600000,
  botherFrequency: 300000,
  drinkDate: null,
  nextReminder: null,
  version: '0.0.1'
};

const text = {
  installWelcomeTitle: '欢迎使用喝水控！',
  installWelcomeContent: '喝水喝水喝水，不喝我就烦死你！ヾ(o◕∀◕)ﾉ',
  updateWelcomeTitle: '喝水控更新啦！',
  updateWelcomeContent: '本次更新的内容有：额？我这是初版啊，怎么会提示你已经更新了呢？如果你看到了这条消息，在chrome商店给我留言哟',
  todayTitle: '开启今天的喝水之旅了哟！',
  todayContent: `从现在开始，每过${config.frequency/60000}分钟我就会提醒你喝水！(。・\`ω´・)`,
  beginTitle: '我又开始运作了！',
  beginContent: `从现在开始，每过${config.frequency/60000}分钟我就会提醒你喝水！(。・\`ω´・)`,
  drinkTitle: '多喝热水！',
  drinkContent: '又到了喝水的时候啦，快快去接水喝！(≖ ‿ ≖)✧ ',
  drinkConfirm: '你有喝水嘛？',
  botherTitle: '怎么还不喝水！',
  botherContent: '信不信我烦死你，快去喝水！(/= _ =)/~┴┴'
};

const showNotification = (message, onButtonClick = () => {},id = 'introduce') => {
  chrome.notifications.getPermissionLevel((level) => {
    if(level === 'granted') {
      const notificationOptions = {
        type: 'basic',
        title: message.title,
        message: message.message,
        iconUrl: message.icon || chrome.extension.getURL("asset/pic3.jpg"),
        buttons: id === 'reminder' ?
          [{title: '我有喝水哦！'}, {title: '手头有点事我过会再喝~'}] : [],
        requireInteraction: id === 'reminder'
      };
      chrome.notifications.create(id, notificationOptions);
      chrome.notifications.onButtonClicked.addListener((clickedId, buttonIndex) => {
        onButtonClick(buttonIndex);
      })
    } else {
      chrome.permissions.request('notifications', (granted) => {
        if(granted) {
          showNotification(message, onClick, id);
        }
      });
    }
  })
};

const clearNotification = () => {
  chrome.notifications.clear('reminder');
};

// type drink喝水提醒 bother拒绝后骚扰提醒
const setTimeInterval = (type) => {
  const intervalConfig = {
    drink: {
      interval: config.frequency,
      title: text.drinkTitle,
      content: text.drinkContent,
    },
    bother: {
      interval: 300,
      title: text.botherTitle,
      content: text.botherContent
    }
  };
  const usingConfig = intervalConfig[type];
  const timer = setInterval(() => {
    showNotification({
      title: usingConfig.title,
      content: usingConfig.content
    });
  }, usingConfig.interval)
};