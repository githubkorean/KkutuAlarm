// updateLibrary.js
function checkForUpdates(repoURL, currentVersion) {
    const repo = repoURL.replace(/https:\/\/github.com\//, '');  // URL에서 repo 이름 추출
    const versionURL = `https://raw.github.com/${repo}/master/Version.txt`;  // 깃허브에 저장한 버전 정보 파일의 URL
    const scriptBaseURL = `https://raw.github.com/${repo}/master/Scripts/`;  // 깃허브 스크립트 파일의 기본 URL

    GM_xmlhttpRequest({
        method: 'GET',
        url: versionURL,
        onload: function(response) {
            const latestVersion = response.responseText.trim();

            if (latestVersion !== currentVersion) {
                confirmUpdate(latestVersion, scriptBaseURL);
            } else {
                console.log('You are using the latest version.');
                alert('You are using the latest version.');
            }
        }
    });
}

function confirmUpdate(latestVersion, scriptBaseURL) {
    const confirmation = confirm(`새로운 버전 ${latestVersion}이(가) 발견되었습니다. 업데이트 하시겠습니까? (예: 업데이트 / 아니오: 다음 날로 미룸)`);
    if (confirmation) {
        // 사용자가 업데이트를 선택한 경우
        onUpdateConfirmed(latestVersion, scriptBaseURL);
    } else {
        // 사용자가 업데이트를 미룬 경우
        const postpone = confirm('업데이트를 내일로 미루시겠습니까? (예: 내일로 미룸 / 아니오: 나중에 다시 알림)');
        if (postpone) {
            GM_setValue('updateIgnored', true);  // 업데이트 무시 상태 저장
        } else {
            GM_setValue('updateIgnored', false); // 업데이트 무시 상태 해제
        }
    }
}

function onUpdateConfirmed(latestVersion, scriptBaseURL) {
    const scriptURL = `${scriptBaseURL}${latestVersion}.user.js`;
    GM_openInTab(scriptURL, { active: true, insert: true });
    GM_setValue('updateIgnored', false);  // 무시 상태 초기화
}
