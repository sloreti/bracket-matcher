// Copyright 2018 Luke Loreti. All rights reserved.

'use strict';

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set(
    { 
      color: '#ff9800',
      enabled: true,
      highlightType : 'brackets'
    }
  );
});
