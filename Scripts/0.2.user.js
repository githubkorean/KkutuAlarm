// ==UserScript==
// @name          끄투 방 참가 알림
// @namespace     https://github.com/githubkorean/KkutuAlarm/tree/main/Scripts
// @supportURL    https://github.com/githubkorean/KkutuAlarm/tree/main/Scripts
// @homepageURL   https://github.com/githubkorean/KkutuAlarm/tree/main/Scripts
// @match         https://kkutu.co.kr/*
// @version       0.2
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
    let previousCount = 0; // 이전 참여자 수
    const autoStartCheckboxId = 'autoStartCheckbox';
    const autoSpectateCheckboxId = 'autoSpectateCheckbox';

    // 체크박스 생성 함수
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

    // 자동 시작 체크박스 생성
    const autoStartCheckbox = createCheckbox(autoStartCheckboxId, '자동 시작', 10);
    // 자동 관전 체크박스 생성
    const autoSpectateCheckbox = createCheckbox(autoSpectateCheckboxId, '자동 관전', 40);

    // 사인파 소리 생성 함수
    function playSineWave(frequency, duration) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    }

    // 사인파 소리 세 번 재생 함수
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

    // 자동 시작 함수
    function autoStartGame() {
        const readyUsers = document.querySelectorAll('.room-user-ready').length;
        const readiedUsers = document.querySelectorAll('.room-user-ready.room-user-readied').length;
        const startBtn = document.getElementById('StartBtn');

        if (readyUsers === 0 && readiedUsers > 0 && startBtn && startBtn.style.display === 'block') {
            startBtn.click();
        }
    }

    // 자동 관전 함수
    function autoSpectate() {
        const spectateBtn = document.getElementById('SpectateBtn');
        // 버튼이 존재하고 표시되어 있으며, "toggled" 클래스가 없는 경우에만 클릭
        if (spectateBtn && spectateBtn.style.display === 'block' && !spectateBtn.classList.contains('toggled')) {
            spectateBtn.click();
        }
    }

    // DOM 변화 감지 설정
    const observer = new MutationObserver(() => {
        const element = document.querySelector('.room-head-limit');
        if (!element) return;

        const match = element.textContent.match(/참여자 (\d+) \/ (\d+)/);
        if (!match) return;

        const currentCount = parseInt(match[1], 10);
        const maxCount = parseInt(match[2], 10);

        // 참여자 수가 변했을 때
        if (currentCount !== previousCount) {
            if (currentCount > previousCount) {
                // 참여자가 늘어났을 때
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

        // 체크박스가 체크된 상태에서 자동 시작 확인
        if (autoStartCheckbox.checked) {
            autoStartGame();
        }

        // 체크박스가 체크된 상태에서 자동 관전 확인
        if (autoSpectateCheckbox.checked) {
            autoSpectate();
        }
    });

    // 대상 요소를 관찰
    const targetNode = document.body;
    const config = { childList: true, subtree: true, characterData: true };
    observer.observe(targetNode, config);

})();
