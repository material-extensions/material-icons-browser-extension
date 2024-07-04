import Browser from 'webextension-polyfill';

type Message = {
  event: string;
  data: {
    host: string;
    tabId: number;
  };
};

Browser.runtime.onMessage.addListener((message: Message) => {
  if (message.event === 'request-access') {
    const perm: Browser.Permissions.Permissions = {
      permissions: ['activeTab'],
      origins: [`*://${message.data.host}/*`],
    };

    Browser.permissions.request(perm).then(async (granted: boolean) => {
      if (!granted) {
        return;
      }

      // run the script now
      Browser.scripting.executeScript({
        files: ['./main.js'],
        target: {
          tabId: message.data.tabId,
        },
      });

      const scripts = await Browser.scripting.getRegisteredContentScripts({
        ids: ['material-icons'],
      });

      const pattern: string = `*://${message.data.host}/*`;

      if (!scripts.length) {
        // register content script for future use
        return Browser.scripting.registerContentScripts([
          {
            id: 'material-icons',
            js: ['./main.js'],
            css: ['./injected-styles.css'],
            matches: [pattern],
            runAt: 'document_start',
          },
        ]);
      }

      const matches = scripts[0].matches ?? [];

      // if we somehow already registered the script for requested origin, skip it
      if (matches.includes(pattern)) {
        return;
      }

      // add new origin to content script
      return Browser.scripting.updateContentScripts([
        {
          id: 'material-icons',
          matches: [...matches, pattern],
        },
      ]);
    });
  }
});
