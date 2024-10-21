// ==UserScript==
// @name         GitHub Script Auto-Updater
// @namespace    http://tampermonkey.net/
// @version      0.0
// @description  Automatically update GitHub script if a new version is available
// @author       Your Name
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @require      https://raw.githubusercontent.com/githubkorean/KkutuAlarm/main/Scripts/updateLibrary.js
// ==/UserScript==

(function() {
    'use strict';

    const repoURL = 'https://github.com/githubkorean/KkutuAlarm';  // 깃허브 레포지토리 URL

    // 버튼 생성 함수
    function createUpdateButton() {
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
        button.click(() => checkForUpdates(repoURL));  // 라이브러리 함수 호출
    }

    // 버튼 생성
    createUpdateButton();
})();
