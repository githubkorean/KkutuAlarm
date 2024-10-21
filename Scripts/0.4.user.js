// ==UserScript==
// @name          끄투 방 참가 알림
// @namespace     https://github.com/githubkorean/KkutuAlarm/tree/main/Scripts
// @supportURL    https://github.com/githubkorean/KkutuAlarm/tree/main/Scripts
// @homepageURL   https://github.com/githubkorean/KkutuAlarm/tree/main/Scripts
// @match         https://kkutu.co.kr/*
// @version       0.4
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
 
    // 사인파 소리 재생 함수
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
        const startBtn = document.getElementById('StartBtn');
        const participantInfo = document.querySelector('.room-head-limit').innerText; // 참여자 정보 가져오기
        const participants = parseInt(participantInfo.split(' ')[1]); // 참여자 수 추출
 
        // 시작 버튼이 비활성화 상태일 경우 즉시 반환
        if (!startBtn || startBtn.style.display === 'none') {
            return;
        }
 
        // 참여자가 2명 이상일 경우에만 자동 시작
        if (participants < 2) {
            // console.log("참여자가 2명 미만입니다. 자동 시작을 중단합니다.");
            return; // 루프를 중단
        }
 
        const readyUsers = document.querySelectorAll('.room-user-ready.room-user-readied').length; // 준비 완료된 인원 수
 
        // console.log(`자동 시작 조건 확인: 준비 인원 - ${readyUsers}, 시작 버튼 표시 - ${startBtn.style.display}`);
 
        // 시작 버튼이 표시되고, 준비 인원이 1명 이상일 때만 시작
        if (readyUsers > 0 && startBtn.style.display === 'block') {
            // console.log('자동 시작 조건을 만족했습니다. 시작 버튼을 클릭합니다.');
            startBtn.click();
            // alert("게임이 시작됩니다! 🎮");
        } else {
            // console.log('자동 시작 조건을 만족하지 못했습니다.');
            if (readyUsers === 0) {
                // alert("준비 인원이 없습니다. 준비해 주세요.");
            }
        }
    }
 
    function autoSpectate() {
        const spectateBtn = document.getElementById('SpectateBtn');
        if (spectateBtn && spectateBtn.style.display === 'block' && !spectateBtn.classList.contains('toggled')) {
            spectateBtn.click();
            // alert("관전 모드로 전환되었습니다! 👀");
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
 
        // 체크박스가 체크된 상태에서 자동 시작 및 관전 확인
        if (autoStartCheckbox.checked) {
            autoStartGame();
        }
 
        if (autoSpectateCheckbox.checked) {
            autoSpectate();
        }
    });
 
    // 대상 요소를 관찰
    const targetNode = document.body;
    const config = { childList: true, subtree: true, characterData: true };
    observer.observe(targetNode, config);
})();