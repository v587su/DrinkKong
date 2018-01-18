let status = 0; // 0: 已喝水状态  1: 打扰状态
chrome.runtime.onInstalled.addListener(
  (details) => {
    if(details.reason === 'install') {
      showNotification({
        title: text.installWelcomeTitle,
        message: text.installWelcomeContent
      });
      chrome.storage.sync.set({drinkKong:config});
    } else if (details.reason === 'update') {
      showNotification({
        title: text.updateWelcomeTitle,
        message: text.updateWelcomeContent
      });
      chrome.storage.sync.set({drinkKong:config});
    }
  }
);

//监听储存变化
chrome.storage.onChanged.addListener((changes) => {
  if(changes.drinkKong.newValue) {
    Object.assign(config, changes.drinkKong.newValue);
  }
});

chrome.storage.sync.get('drinkKong', (items) => {
  console.log(items);
  const today = new Date();
  if(items.drinkKong) {
    const { drinkDate } = items.drinkKong;
    if(drinkDate && drinkDate.getDate() === today.getDate() && drinkDate.getMonth() === today.getMonth()) {
      showNotification({
        title: text.todayTitle,
        message: text.todayContent
      });
    } else {
      showNotification({
        title: text.beginTitle,
        message: text.beginContent
      });
    }
  } else {
    chrome.storage.sync.set({drinkKong:config});
  }
  console.log(items);
  showReminder(status);
});

const timerConfig = (type) => {
  const intervalConfig = [{
    // 0 drink config
      title: text.drinkTitle,
      message: text.drinkContent,
    },{
    // 1 bother config
      title: text.botherTitle,
      message: text.botherContent
    }
  ];
  return intervalConfig[type];
};

const showReminder = (type) => {
  const setting = timerConfig(type);
  const onButtonClick = (buttonIndex) => {
    status = buttonIndex;
    const interval = status === 0 ? config.frequency : config.botherFrequency;
    chrome.storage.sync.get('drinkKong', (items) => {
      let intervalLeft = interval;
      if(items.nextReminder && items.nextReminder > Date.now()) {
        intervalLeft = items.nextReminder - Date.now();
      } else if(status === 0){
        const nextReminder = Date.now() + interval;
        const nextItems = Object.assign(items.drinkKong, {nextReminder});
        chrome.storage.sync.set({drinkKong: nextItems});
      }
      console.log(intervalLeft);
      setTimeout(() => showReminder(status),intervalLeft);
    });
    clearNotification();
  };
  showNotification(setting, onButtonClick, 'reminder');
};