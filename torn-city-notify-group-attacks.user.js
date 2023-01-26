// ==UserScript==
// @name         Torn City: notify when group attack starts
// @namespace    https://github.com/pirminis/torn-city-notify-group-attacks
// @version      0.0.1
// @description  Notify when group attack starts
// @author       pirminis
// @match        https://www.torn.com/loader.php?sid=attack&user2ID=*
// @updateURL    https://github.com/pirminis/torn-city-notify-group-attacks/raw/master/torn-city-notify-group-attacks.user.js
// @downloadURL  https://github.com/pirminis/torn-city-notify-group-attacks/raw/master/torn-city-notify-group-attacks.user.js
// @grant        GM_notification
// ==/UserScript==

(function(global) {
  'use strict';

  const pollTime = 3000;
  const titleResetTime = 1500;
  const notificationResetTime = 30000;
  const playerIdPattern = /(\d+)$/;

  startIntervalTimer();

  function getPlayerIdFromUrl() {
    let match = playerIdPattern.exec(window.location.search);

    if (match.length !== 2) {
      return;
    }

    return match[1];
  }

  function getEnemyPlayerName() {
    return document.querySelectorAll("[id^=playername]")[1].textContent;
  }

  function startIntervalTimer() {
    let playerId = getPlayerIdFromUrl();
    let intervalVariable = `tornCityGroupAttackPollingInterval${playerId}`;
    let intervalId = window[intervalVariable];

    clearInterval(intervalId);

    window[intervalVariable] = setInterval(pollNpcFight, pollTime);
  }

  function pollNpcFight() {
    let text = document.querySelectorAll("[class^=titleNumber]");

    if (text.length === 0) {
      return;
    }

    let numberOfAttackers = parseInt(text[0].textContent, 10);

    if (numberOfAttackers < 2) {
      return;
    }

    let enemyPlayerName = getEnemyPlayerName();
    let notificationText = `❗️${enemyPlayerName} ATTACK STARTED❗️`;

    changeWindowTitleTo(notificationText)
    showNotification(notificationText, notificationResetTime);
  }

  function changeWindowTitleTo(value) {
    window.top.document.title = value;

    if (value === "") {
      return;
    }

    setTimeout(function () { changeWindowTitleTo(""); }, titleResetTime);
  }

  function showNotification(text, timeout) {
    let playerId = getPlayerIdFromUrl();
    let notificationAlreadySent = `tornCityGroupAttackNotificationSent${playerId}`;

    if (window[notificationAlreadySent]) {
      return;
    }

    window[notificationAlreadySent] = true;

    const options = {
      title: "Warning",
      text: text,
      timeout: timeout,
      silent: true
    };

    GM_notification(options);
  }
})(window);
