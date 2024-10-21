// updateLibrary.js
function checkForUpdates(repoURL) {
    const repo = repoURL.replace(/https:\/\/github.com\//, '');  // URL에서 repo 이름 추출
    const versionURL = `https://raw.githubusercontent.com/${repo}/main/Version.txt`;  // 깃허브에 저장한 버전 정보 파일의 URL
    const scriptBaseURL = `https://raw.githubusercontent.com/${repo}/main/Scripts/`;  // 깃허브 스크립트 파일의 기본 URL
    const currentVersion = GM_info.script.version;  // 현재 버전 가져오기

    // 무시 상태 확인
    const lastIgnored = GM_getValue('lastIgnored', null);
    const today = new Date().toISOString().split('T')[0];

    // 오늘이 무시된 날짜가 아니면 업데이트 체크
    if (lastIgnored !== today) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: versionURL,
            onload: function(response) {
                const latestVersion = response.responseText.trim();

                if (latestVersion !== currentVersion) {
                    console.log(`New version ${latestVersion} available. Updating...`);
                    const userDecision = confirm(`New version ${latestVersion} available. Would you like to update now?`);

                    if (userDecision) {
                        redirectToUpdate(latestVersion, scriptBaseURL);
                    } else {
                        // 업데이트 무시 기록
                        GM_setValue('lastIgnored', today);
                        console.log('Update ignored.');
                    }
                } else {
                    console.log('You are using the latest version.');
                }
            }
        });
    } else {
        console.log('Update check skipped today.');
    }
}

function redirectToUpdate(latestVersion, scriptBaseURL) {
    const scriptURL = `${scriptBaseURL}${latestVersion}.user.js`;
    GM_openInTab(scriptURL, { active: true, insert: true });
}
