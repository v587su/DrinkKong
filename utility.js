const config = {
  frequency: 36000,
  drinkDate: null,
  version: '0.0.1'
};

const text = {
  installWelcomeTitle: '欢迎使用喝水控！',
  installWelcomeContent: '喝水喝水喝水，不喝我就烦死你！ヾ(o◕∀◕)ﾉ',
  updateWelcomeTitle: '喝水控更新啦！',
  updateWelcomeContent: '本次更新的内容有：额？我这是初版啊，怎么会提示你已经更新了呢？如果你看到了这条消息，在chrome商店给我留言哟',
  todayTitle: '开启今天的喝水之旅了哟！',
  todayContent: `从现在开始，每过${config.frequency}秒我就会提醒你喝水！(。・\`ω´・)`,
  beginTitle: '我又开始运作了！',
  beginContent: `从现在开始，每过${config.frequency}秒我就会提醒你喝水！(。・\`ω´・)`,
  drinkTitle: '多喝热水！',
  drinkContent: '又到了喝水的时候，快快去喝水！喝了之后记得点我，不然我还会来骚扰你的！(≖ ‿ ≖)✧ ',
  drinkConfirm: '你有喝水嘛？',
  botherTitle: '怎么还不喝水！',
  botherContent: '信不信我烦死你，快去喝水！(/= _ =)/~┴┴'
};

//载入储存内容setting

const showNotification = (note, onClick = () => {}) => {
  if (!Notification) {
    console.log('no Notification');
    return;
  }
  let permission = Notification.permission;
  if (permission === 'granted') {
    const notification = new Notification(
      note.title || "单词控",
      {
        body: note.content,
        icon: note.icon || chrome.extension.getURL("asset/pic3.jpg")
      }
    );
    notification.onclick = onClick;
  } else {
    Notification.requestPermission();
    showNotification(note, onClick);
  }
};

const showNotification = (message, noClick = () => {},id = '0') => {
  chrome.notifications.getPermissionLevel((level) => {
    if(level === 'granted') {
      chrome.notifications.create(id, message);
    } else {
      Notification.requestPermission();
      showNotification(message, onClick);
    }
  })
};


const closeNotification = () => {
  chrome.notifications.getAll((notifications) => {
    console.log(notifications);
  });
  //做到这里了，想做清掉notification，但似乎创建方法有问题，所以没法清掉，可能要改成官方的create方法
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