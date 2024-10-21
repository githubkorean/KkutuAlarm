// ==UserScript==
// @name         GitHub Script Auto-Updater
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Automatically update GitHub script if a new version is available
// @author       Your Name
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';

    const currentVersion = GM_info.script.version;  // 메타 데이터에서 현재 버전 가져오기
    const versionURL = 'https://raw.githubusercontent.com/githubkorean/KkutuAlarm/refs/heads/main/Version.txt';  // 깃허브에 저장한 버전 정보 파일의 URL
    const scriptBaseURL = 'https://raw.githubusercontent.com/githubkorean/KkutuAlarm/main/';  // 깃허브 스크립트 파일의 기본 URL

    // 서버에서 최신 버전 정보를 읽어오는 함수
    function checkForUpdates() {
        GM_xmlhttpRequest({
            method: 'GET',
            url: versionURL,
            onload: function(response) {
                const latestVersion = response.responseText.trim();

                if (latestVersion !== currentVersion) {
                    console.log(`New version ${latestVersion} available. Updating...`);
                    alert(`New version ${latestVersion} available. Updating...`);
                    updateScript(latestVersion);
                } else {
                    console.log('You are using the latest version.');
                    alert('You are using the latest version.');
                }
            }
        });
    }

    // 업데이트 함수
    function updateScript(latestVersion) {
        const scriptURL = `${scriptBaseURL}Scripts/${latestVersion}.user.js`;
        GM_xmlhttpRequest({
            method: 'GET',
            url: scriptURL,  // 스크립트 파일의 URL
            onload: function(response) {
                const scriptContent = response.responseText;
                const scriptElement = document.createElement('script');
                scriptElement.textContent = scriptContent;
                document.head.appendChild(scriptElement);
                console.log('Script updated.');
                alert('스크립트가 업데이트되었습니다. 페이지를 새로고침 해주세요.');
            }
        });
    }

    // 버튼 생성
    const button = $('<button id="check-update">Check for Update</button>');
    button.css({
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        padding: '10px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    });
    $('body').append(button);

    // 버튼 클릭 이벤트
    button.click(() => {
        checkForUpdates();
    });

    // 자동 업데이트를 추가할 경우 이 부분을 활성화하면 됨
    // window.addEventListener('load', checkForUpdates, false);
})();
