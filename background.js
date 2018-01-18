let status = 0; // 0: drink  1: bother
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
  const { drinkDate } = config;
  if(drinkDate) {
    if(drinkDate.getDate() === today.getDate() && drinkDate.getMonth() === today.getMonth()) {
      showNotification({
        title: text.todayTitle,
        message: text.todayContent
      });
    } else {
      showNotification({
        title: text.beginTitle,
        message: text.beginContent
      });
      config.drinkDate = today;
      chrome.storage.sync.set({drinkKong: config});
    }
  }
  console.log(items);
  showReminder(status);
});

const timerConfig = (type) => {
  const intervalConfig = [{
    // 0 drink config
      interval: config.frequency,
      title: text.drinkTitle,
      message: text.drinkContent,
    },{
    // 1 bother config
      interval: 300,
      title: text.botherTitle,
      message: text.botherContent
    }
  ];
  return intervalConfig[type];
};

const showReminder = (type) => {
  const setting = timerConfig(type);
  const onClick = () => {
    const hasDrunk = confirm(text.drinkConfirm);
    if(hasDrunk) {
      status = 0;
    } else {
      status = 1;
    }
  };
  showNotification(setting, () => onClick());
  console.log(status);
  setTimeout(() => showReminder(status),setting.interval);
};

