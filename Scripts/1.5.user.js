﻿// ==UserScript==
// @name          끄투 방 참가 알림
// @namespace     https://github.com/githubkorean/KkutuAlarm/tree/main/Scripts
// @supportURL    https://github.com/githubkorean/KkutuAlarm/tree/main/Scripts
// @homepageURL   https://github.com/githubkorean/KkutuAlarm/tree/main/Scripts
// @match         https://kkutu.co.kr/*
// @version       1.5
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
        document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
    }

    function getCookie(name) {
        const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
            const [key, value] = cookie.split('=');
            acc[key] = value;
            return acc;
        }, {});
        return cookies[name] || null;
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

    autoStartCheckbox.checked = getCookie(autoStartCheckboxId) === 'true';
    autoSpectateCheckbox.checked = getCookie(autoSpectateCheckboxId) === 'true';

    autoStartCheckbox.addEventListener('change', () => {
        setCookie(autoStartCheckboxId, autoStartCheckbox.checked, 7);
        console.log('자동 시작 설정:', autoStartCheckbox.checked);
    });

    autoSpectateCheckbox.addEventListener('change', () => {
        setCookie(autoSpectateCheckboxId, autoSpectateCheckbox.checked, 7);
        console.log('자동 관전 설정:', autoSpectateCheckbox.checked);
    });

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

    function getUserCounts() {
        const spectators = document.querySelectorAll('.room-user-spectate');
        let readyUserCount = 0;
        let waitingCount = 0;
        let spectatorsCount = spectators.length;
        let botUserCount = 0;

        const botNames = [
            '왕초보 끄투 봇',
            '초보 끄투 봇',
            '적절 끄투 봇',
            '고수 끄투 봇',
            '사기 끄투 봇'
        ];

        function isBot(userName) {
            const isBotUser = botNames.includes(userName);
            console.log(`봇 체크: ${userName} => ${isBotUser}`);
            return isBotUser;
        }

        document.querySelectorAll('.room-user-ready').forEach((user) => {
            const userNameElement = user.closest('.room-user').querySelector('.room-user-name');
            const userName = userNameElement ? userNameElement.textContent.trim() : '이름 없음';

            console.log('사용자 이름:', userName);

            if (isBot(userName)) {
                botUserCount++;
                console.log('봇 발견:', userName);
                return; // 봇은 일반 사용자 카운트에서 제외
            }

            if (user.classList.contains('room-user-master')) {
                if (user.textContent.includes('관전')) {
                    spectatorsCount++;
                } else {
                    readyUserCount++;
                }
            } else if (user.textContent.includes('준비')) {
                readyUserCount++; // 일반 사용자 카운트
            } else if (user.textContent.includes('대기')) {
                waitingCount++;
            }
        });

        // 봇 유저 수에 따라 준비 인원 추가
        if (botUserCount > 0) {
            readyUserCount += 1; // 봇이 1명 이상일 경우에는 1명으로 추가
        }

        console.log('준비 인원:', readyUserCount);
        console.log('대기 인원:', waitingCount);
        console.log('관전 인원:', spectatorsCount);
        console.log('봇 인원:', botUserCount);

        return { readyUserCount, waitingCount, spectatorsCount, botUserCount };
    }

    function getTeamCounts() {
        const teamCounts = { A: 0, B: 0, C: 0, D: 0, 개인: 0 };

        // 팀 인원 카운트
        document.querySelectorAll('.room-user-team').forEach((user) => {
            if (user.classList.contains('team-1')) teamCounts.A++;
            else if (user.classList.contains('team-2')) teamCounts.B++;
            else if (user.classList.contains('team-3')) teamCounts.C++;
            else if (user.classList.contains('team-4')) teamCounts.D++;
            else if (user.classList.contains('room-user-ready') && user.classList.contains('room-user-spectate')) {
                return;
            } else {
                teamCounts.개인++;
            }
        });

        // 혼자 팀인 경우(1인 팀)를 0명으로 수정하고 개인 카운트 증가
        Object.keys(teamCounts).forEach(team => {
            if (teamCounts[team] === 1) {
                teamCounts[team] = 0; // 1인 팀은 0으로 설정
                teamCounts.개인++; // 개인 카운트 증가
            }
        });

        console.log('팀 인원:', teamCounts);
        return teamCounts;
    }

    function canStartGame() {
        const { readyUserCount, waitingCount } = getUserCounts(); // readyUserCount로 수정
        const { A, B, C, D, 개인 } = getTeamCounts();
        const teams = { A, B, C, D };

        if (waitingCount > 0) {
            console.log('대기 인원이 존재하여 게임 시작 불가');
            return false; // 대기 인원이 존재할 경우 게임 시작 불가
        }

        if (readyUserCount < 2) { // 여기서 readyUserCount로 수정
            console.log('준비 인원이 2인 미만으로 게임 시작 불가');
            return false; // 준비 인원이 2인 미만일 경우 시작 불가
        }

        // 팀 인원 수 체크
        const teamSizes = Object.values(teams).filter(count => count > 0);
        const allEqual = teamSizes.length > 0 && teamSizes.every(size => size === teamSizes[0]);

        // 팀 수가 0인 경우는 개인 인원이 2명 이상이면 게임 시작 가능
        if (teamSizes.length === 0 && 개인 >= 2) {
            console.log('팀이 없지만 개인 인원이 2명 이상이므로 게임 시작 가능');
            return true; // 개인 인원이 2명 이상인 경우 게임 시작 가능
        }

        // 팀 수가 불균형한 경우
        if (!allEqual) {
            console.log('팀 수 불균형 (실행 금지)');
            return false; // 팀 수 불균형
        }

        // 개인이 있을 경우
        if (개인 > 0) {
            const sameTeamCount = Object.values(teams).some(count => count >= 2);
            if (sameTeamCount) {
                console.log('팀이 2명 이상이며 개인이 존재하므로 게임 시작 불가');
                return false; // 팀이 2명 이상인 경우 게임 시작 불가
            }
        }

        // 두 팀 이상의 인원이 있어야 게임 시작 가능
        const totalTeams = Object.values(teams).filter(count => count > 0).length;
        if (totalTeams < 2) {
            console.log('상대팀이 없으므로 게임 시작 불가');
            return false; // 상대팀이 없는 경우 게임 시작 불가
        }

        console.log('게임 시작 가능');
        return true; // 조건을 모두 만족한 경우
    }

    function autoStartGame() {
        const startBtn = document.getElementById('StartBtn');
        if (!startBtn || startBtn.style.display === 'none') {
            return;
        }

        if (canStartGame()) {
            console.log('게임 시작 버튼 클릭');
            startBtn.click(); // 게임 시작 클릭
        }
    }

    function autoSpectate() {
        const spectateBtn = document.getElementById('SpectateBtn');
        if (spectateBtn && spectateBtn.style.display === 'block' && !spectateBtn.classList.contains('toggled')) {
            spectateBtn.click(); // 관전 클릭
            console.log('관전 버튼 클릭');
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
                    playSineWave(880, 0.2); // 참가자 수가 늘어났을 때
                }
            } else {
                playSineWave(440, 0.2); // 참가자 수가 줄어들었을 때
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

    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);
})();
