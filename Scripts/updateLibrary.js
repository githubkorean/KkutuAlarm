// updateLibrary.js

function checkForUpdates(repoURL, currentVersion) {
    const repo = repoURL.replace(/https:\/\/github.com\//, '');  // URL에서 repo 이름 추출
    const versionURL = `https://raw.github.com/${repo}/master/Version.txt`;  // 깃허브에 저장한 버전 정보 파일의 URL
    const scriptBaseURL = `https://raw.github.com/${repo}/master/Scripts/`;  // 깃허브 스크립트 파일의 기본 URL

    // 서버에서 최신 버전 정보를 읽어오는 함수
    GM_xmlhttpRequest({
        method: 'GET',
        url: versionURL,
        onload: function(response) {
            const [latestVersion, scriptName] = response.responseText.trim().split('|'); // 정규식으로 분리

            // 스크립트 이름이 없을 경우 '현재 스크립트'로 대체
            const displayName = scriptName ? `'${scriptName}'` : "'현재 스크립트'";

            if (latestVersion !== currentVersion) {
                const message = `${displayName}의 최신 버전(${latestVersion})이 있습니다. 업데이트 하시겠습니까?`;
                if (confirm(message)) {
                    redirectToUpdate(latestVersion, scriptBaseURL);
                } else {
                    setUpdateReminder();  // 10분 후 다시 알림 설정
                }
            } else {
                console.log('You are using the latest version.');
            }
        }
    });
}

function redirectToUpdate(latestVersion, scriptBaseURL) {
    const scriptURL = `${scriptBaseURL}${latestVersion}.user.js`;
    GM_openInTab(scriptURL, { active: true, insert: true });
}

function setUpdateReminder() {
    const remindTime = 10 * 60 * 1000; // 10분 후
    const now = new Date().getTime();
    const remindUntil = now + remindTime;

    GM_setValue('remindUntil', remindUntil);
    alert('다음 업데이트 알림은 10분 후에 표시됩니다.');
}
