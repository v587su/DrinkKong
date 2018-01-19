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
  const today = new Date();
  if(items.drinkKong) {
    const { drinkDate } = items.drinkKong;
    if(drinkDate && Object.prototype.toString.call(drinkDate) === "[object Array]" &&
      drinkDate.getDate() === today.getDate() && drinkDate.getMonth() === today.getMonth()) {
      showNotification({
        title: text.todayTitle,
        message: text.todayContent
      });
    } else {
      showNotification({
        title: text.beginTitle,
        message: text.beginContent
      });
      chrome.storage.sync.set({drinkKong:Object.assign(items,{drinkDate:today})});
    }
  } else {
    chrome.storage.sync.set({drinkKong:Object.assign(config,{drinkDate:today})});
  }
  console.log(items);
  let intervalLeft = config.frequency;
  if(items.nextReminder && items.nextReminder > Date.now()) {
    intervalLeft = items.nextReminder - Date.now();
    console.log('intervalLeft',intervalLeft);
  } else if(status === 0){
    console.log(items.nextReminder, Date.now());
    const nextReminder = Date.now() + config.frequency;
    const nextItems = Object.assign(items.drinkKong, {nextReminder, drinkDate: new Date()});
    chrome.storage.sync.set({drinkKong: nextItems});
  }
  setTimeout(() => showReminder(status),intervalLeft);
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
        const nextItems = Object.assign(items.drinkKong, {nextReminder, drinkDate: new Date()});
        chrome.storage.sync.set({drinkKong: nextItems});
        console.log('nextItems', nextItems);
      }
      console.log(intervalLeft);
      setTimeout(() => showReminder(status),intervalLeft);
    });
    clearNotification();
  };
  showNotification(setting, onButtonClick, 'reminder');
};