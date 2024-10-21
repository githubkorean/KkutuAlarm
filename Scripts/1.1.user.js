// ==UserScript==
// @name          끄투 방 참가 알림
// @namespace     https://github.com/githubkorean/KkutuAlarm/tree/main/Scripts
// @supportURL    https://github.com/githubkorean/KkutuAlarm/tree/main/Scripts
// @homepageURL   https://github.com/githubkorean/KkutuAlarm/tree/main/Scripts
// @match         https://kkutu.co.kr/*
// @version       1.1
// @description   실시간으로 참여자 수 변화를 감지해 소리 재생 및 자동 시작
// @icon          https://www.google.com/s2/favicons?domain=kkutu.co.kr
// @author        mickey90427 <mickey90427@naver.com>
// @require       https://github.com/githubkorean/KkutuAlarm/raw/refs/heads/main/Updater.js
// @grant         GM.setValue
// @grant         GM.getValue
// @grant         GM.xmlHttpRequest
// @grant         GM_openInTab
// @license       MIT
// ==/UserScript==

(function() {
    'use strict';

	checkForUpdates('githubkorean/KkutuAlarm', GM_info.script.version);
    let previousCount = 0;
    const autoStartCheckboxId = 'autoStartCheckbox';
    const autoSpectateCheckboxId = 'autoSpectateCheckbox';

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function createCheckbox(id, labelText, topOffset) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.style.position = 'fixed';
        checkbox.style.top = `${topOffset}px`;
        checkbox.style.right = '10px';
        document.body.appendChild(checkbox);

        const label = document.createElement('label');
        label.htmlFor = id;
        label.innerText = labelText;
        label.style.position = 'fixed';
        label.style.top = `${topOffset}px`;
        label.style.right = '30px';
        document.body.appendChild(label);

        return checkbox;
    }

    const autoStartCheckbox = createCheckbox(autoStartCheckboxId, '자동 시작', 10);
    const autoSpectateCheckbox = createCheckbox(autoSpectateCheckboxId, '자동 관전', 40);

    // 쿠키에서 체크박스 상태를 불러오기
    autoStartCheckbox.checked = getCookie(autoStartCheckboxId) === 'true';
    autoSpectateCheckbox.checked = getCookie(autoSpectateCheckboxId) === 'true';

    // 체크박스 상태가 변경될 때 쿠키에 저장
    autoStartCheckbox.addEventListener('change', () => {
        setCookie(autoStartCheckboxId, autoStartCheckbox.checked, 7);
    });

    autoSpectateCheckbox.addEventListener('change', () => {
        setCookie(autoSpectateCheckboxId, autoSpectateCheckbox.checked, 7);
    });

    function playSineWave(frequency, duration) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    }

    function playTripleBeep() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const frequencies = [1220, 1220, 1220];
        const times = [0, 0.3, 0.6];

        frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + times[index]);
            oscillator.connect(audioContext.destination);
            oscillator.start(audioContext.currentTime + times[index]);
            oscillator.stop(audioContext.currentTime + times[index] + 0.2);
        });
    }

    function autoStartGame() {
        const startBtn = document.getElementById('StartBtn');
        const participantInfo = document.querySelector('.room-head-limit').innerText;
        const participants = parseInt(participantInfo.split(' ')[1]);

        if (!startBtn || startBtn.style.display === 'none') {
            return;
        }

        let readyUsers = document.querySelectorAll('.room-user-ready.room-user-readied').length;
        let waitingUsers = document.querySelectorAll('.room-user-ready').length - readyUsers;

        const masterElement = document.querySelector('.room-user-ready.room-user-master');
        if (masterElement) {
            if (masterElement.innerText.includes('관전')) {
                if (readyUsers > 0) readyUsers -= 1;
            }
            waitingUsers -= 1;
        }

        const spectators = document.querySelectorAll('.room-user-ready.room-user-spectate').length;
        waitingUsers -= spectators;

        if (waitingUsers > 0) {
            readyUsers = 0;
        }

        if (readyUsers >= 1 && participants >= 2) {
            startBtn.click();
        }
    }

    function autoSpectate() {
        const spectateBtn = document.getElementById('SpectateBtn');
        if (spectateBtn && spectateBtn.style.display === 'block' && !spectateBtn.classList.contains('toggled')) {
            spectateBtn.click();
        }
    }

    const observer = new MutationObserver(() => {
        const element = document.querySelector('.room-head-limit');
        if (!element) return;

        const match = element.textContent.match(/참여자 (\d+) \/ (\d+)/);
        if (!match) return;

        const currentCount = parseInt(match[1], 10);
        const maxCount = parseInt(match[2], 10);

        if (currentCount !== previousCount) {
            if (currentCount > previousCount) {
                if (currentCount === maxCount) {
                    playTripleBeep();
                } else {
                    playSineWave(880, 0.2);
                }
            } else {
                playSineWave(440, 0.2);
            }

            previousCount = currentCount;
        }

        if (autoStartCheckbox.checked) {
            autoStartGame();
        }

        if (autoSpectateCheckbox.checked) {
            autoSpectate();
        }
    });

    const targetNode = document.body;
    const config = { childList: true, subtree: true, characterData: true };
    observer.observe(targetNode, config);
})();
