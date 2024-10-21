// ==UserScript==
// @name         GitHub Auto-Updater Library
// @namespace    http://tampermonkey.net/
// @version      0.0
// @description  Library for automatically updating GitHub scripts
// @author       Your Name
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';

    // GitHub 스크립트 자동 업데이트 라이브러리
    const GitHubAutoUpdater = {
        repoURL: '', // GitHub 레포지토리 URL
        currentVersion: GM_info.script.version, // 현재 버전
        versionURL: '', // 버전 정보 파일 URL
        scriptBaseURL: '', // 스크립트 파일의 기본 URL

        // 초기화 함수
        init: function(repo) {
            this.repoURL = repo;
            const repoPath = this.repoURL.replace(/https:\/\/github.com\//, '');
            this.versionURL = `https://raw.githubusercontent.com/${repoPath}/main/Version.txt`;
            this.scriptBaseURL = `https://raw.githubusercontent.com/${repoPath}/main/Scripts/`;
            this.createUpdateButton();
        },

        // 업데이트 확인 함수
        checkForUpdates: function() {
            GM_xmlhttpRequest({
                method: 'GET',
                url: this.versionURL,
                onload: (response) => {
                    const latestVersion = response.responseText.trim();

                    if (latestVersion !== this.currentVersion) {
                        console.log(`New version ${latestVersion} available. Updating...`);
                        alert(`New version ${latestVersion} available. Redirecting to update page...`);
                        this.redirectToUpdate(latestVersion);
                    } else {
                        console.log('You are using the latest version.');
                        alert('You are using the latest version.');
                    }
                }
            });
        },

        // 업데이트 페이지로 리다이렉트 함수
        redirectToUpdate: function(latestVersion) {
            const scriptURL = `${this.scriptBaseURL}${latestVersion}.user.js`;
            GM_openInTab(scriptURL, { active: true, insert: true });
        },

        // 버튼 생성 함수
        createUpdateButton: function() {
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
            button.click(() => this.checkForUpdates());
        }
    };

    // 전역에서 사용할 수 있도록 객체를 노출
    window.GitHubAutoUpdater = GitHubAutoUpdater;
})();
