// updateLibrary.js
(function() {
    // 페이지가 로드된 후 실행
    window.addEventListener('load', function() {
        const currentVersion = GM_info.script.version;  // 현재 버전 가져오기

        // 마지막 업데이트 체크 시간을 가져오기
        const lastCheck = GM_getValue('lastCheck', 0);
        const now = Date.now();

        // 24시간이 지난 경우에만 업데이트 확인
        if (now - lastCheck > 24 * 60 * 60 * 1000) {
            checkForUpdates('https://github.com/githubkorean/KkutuAlarm', currentVersion);
        }
    });

    function checkForUpdates(repoURL, currentVersion) {
        const repo = repoURL.replace(/https:\/\/github.com\//, '');
        const versionURL = `https://raw.githubusercontent.com/${repo}/master/Version.txt`;
        const scriptBaseURL = `https://raw.githubusercontent.com/${repo}/master/Scripts/`;

        GM_xmlhttpRequest({
            method: 'GET',
            url: versionURL,
            onload: function(response) {
                const latestVersion = response.responseText.trim();

                if (latestVersion !== currentVersion) {
                    console.log(`New version ${latestVersion} available. Updating...`);
                    const userResponse = confirm(`New version ${latestVersion} available. Do you want to update?`);

                    if (userResponse) {
                        redirectToUpdate(latestVersion, scriptBaseURL);
                    } else {
                        GM_setValue('lastCheck', Date.now()); // 마지막 체크 시간을 기록
                    }
                } else {
                    console.log('You are using the latest version.');
                    alert('You are using the latest version.');
                    GM_setValue('lastCheck', Date.now()); // 마지막 체크 시간을 기록
                }
            }
        });
    }

    function redirectToUpdate(latestVersion, scriptBaseURL) {
        const scriptURL = `${scriptBaseURL}${latestVersion}.user.js`;
        GM_openInTab(scriptURL, { active: true, insert: true });
    }
})();
