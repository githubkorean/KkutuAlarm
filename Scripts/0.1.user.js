// ==UserScript==
// @name          끄투 방 참가 알림
// @namespace     https://github.com/githubkorean/KkutuAlarm/tree/main/Scripts
// @supportURL    https://github.com/githubkorean/KkutuAlarm/tree/main/Scripts
// @homepageURL   https://github.com/githubkorean/KkutuAlarm/tree/main/Scripts
// @match         https://kkutu.co.kr/*
// @version       0.0
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
    const checkboxId = 'autoStartCheckbox';

    // 체크박스 생성
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = checkboxId;
    checkbox.style.position = 'fixed';
    checkbox.style.top = '10px';
    checkbox.style.right = '10px';
    document.body.appendChild(checkbox);

    const label = document.createElement('label');
    label.htmlFor = checkboxId;
    label.innerText = '자동 시작';
    label.style.position = 'fixed';
    label.style.top = '10px';
    label.style.right = '30px';
    document.body.appendChild(label);

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
        const maxCount = parseInt(document.querySelector('.room-head-limit').textContent.split('/')[1].trim());
        const startBtn = document.getElementById('StartBtn');

        // 대기 상태의 유저가 없고, 준비 상태의 유저가 하나 이상 있으며, 버튼이 보이는 경우
        if (readyUsers === 0 && readiedUsers > 0 && startBtn && startBtn.style.display === 'block') {
            startBtn.click();
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
                    // 최대 인원일 때
                    playTripleBeep();
                } else {
                    // 일반적인 증가
                    playSineWave(880, 0.2); // 경쾌한 음 (880Hz)
                }
            } else {
                // 참여자가 줄어들었을 때
                playSineWave(440, 0.2); // 경고음에 가까운 음 (440Hz)
            }

            // 이전 참여자 수 업데이트
            previousCount = currentCount;
        }

        // 체크박스가 체크된 상태에서 자동 시작 확인
        if (checkbox.checked) {
            autoStartGame();
        }
    });

    // 대상 요소를 관찰
    const targetNode = document.body;
    const config = { childList: true, subtree: true, characterData: true };
    observer.observe(targetNode, config);

})();
