let status = 0; // 0: drink  1: bother
chrome.runtime.onInstalled.addListener(
  // function (details) {
  //   if(details.reason === 'install') {
  //     showNotification({
  //       title: text.installWelcomeTitle,
  //       content: text.installWelcomeContent
  //     });
  //   } else if (details.reason === 'update') {
  //     showNotification({
  //       title: text.updateWelcomeTitle,
  //       content: text.updateWelcomeContent
  //     });
  //   }
  // }
  (details) => {
    if(details.reason === 'install') {
      showNotification({
        title: text.installWelcomeTitle,
        content: text.installWelcomeContent
      });
    } else if (details.reason === 'update') {
      showNotification({
        title: text.updateWelcomeTitle,
        content: text.updateWelcomeContent
      });
    }
  }
);

// chrome.storage.sync.get('drinkKong', function(items) {
chrome.storage.sync.get(config.name,(items) => {
  //storage中config初始化或更新
  if(items.drinkKong.version) {
    if(items.drinkKong.version === config.version) {
      Object.assign(config, items.drinkKong);
      console.log('载入后',config);
    }
  } else if(!items.drinkKong) {
    chrome.storage.sync.set({drinkKong:config});
    console.log('初始化',config);
  }
});

//监听储存变化
// chrome.storage.onChanged.addListener(function (changes) {
chrome.storage.onChanged.addListener((changes) => {
  if(changes.drinkKong.newValue) {
    Object.assign(config, changes.drinkKong.newValue);
  }
});

// chrome.storage.sync.get('drinkKong', function (items) {
chrome.storage.sync.get(config.name, (items) => {
  const today = new Date();
  const { drinkDate } = config;
  if(drinkDate) {
    if(drinkDate.getDate() === today.getDate() && drinkDate.getMonth() === today.getMonth()) {
      showNotification({
        title: text.todayTitle,
        content: text.todayContent
      });
    } else {
      showNotification({
        title: text.beginTitle,
        content: text.beginContent
      });
      config.drinkDate = today;
      chrome.storage.sync.set({drinkKong: config});
    }
  }
  showReminder(status);
});

const timerConfig = (type) => {
  const intervalConfig = [{
    // 0 drink config
      interval: config.frequency,
      title: text.drinkTitle,
      content: text.drinkContent,
    },{
    // 1 bother config
      interval: 300,
      title: text.botherTitle,
      content: text.botherContent
    }
  ];
  return intervalConfig[type];
};

const showReminder = (type) => {
  const setting = timerConfig(type);
  const onClick = () => {
    var isDrunk = confirm(text.drinkConfirm);
    if(isDrunk) {
      status = 0;
    } else {
      status = 1;
    }
  };
  showNotification(setting, () => onClick());
  console.log(status);
  setTimeout(() => showReminder(status),setting.interval);
};

