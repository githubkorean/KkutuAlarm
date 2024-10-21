// updateLibrary.js
function getCurrentVersion() {
    return GM_info.script.version;  // 메타 데이터에서 현재 버전 가져오기
}

function checkForUpdates(repoURL) {
    const currentVersion = getCurrentVersion();  // 현재 버전 가져오기
    const repo = repoURL.replace(/https:\/\/github.com\//, '');  // URL에서 repo 이름 추출
    const versionURL = `https://raw.githubusercontent.com/${repo}/main/Version.txt`;  // 깃허브에 저장한 버전 정보 파일의 URL
    const scriptBaseURL = `https://raw.githubusercontent.com/${repo}/main/Scripts/`;  // 깃허브 스크립트 파일의 기본 URL

    GM_xmlhttpRequest({
        method: 'GET',
        url: versionURL,
        onload: function(response) {
            const latestVersion = response.responseText.trim();

            if (latestVersion !== currentVersion) {
                console.log(`New version ${latestVersion} available. Updating...`);
                alert(`New version ${latestVersion} available. Redirecting to update page...`);
                redirectToUpdate(latestVersion, scriptBaseURL);
            } else {
                console.log('You are using the latest version.');
                alert('You are using the latest version.');
            }
        }
    });
}

function redirectToUpdate(latestVersion, scriptBaseURL) {
    const scriptURL = `${scriptBaseURL}${latestVersion}.user.js`;
    GM_openInTab(scriptURL, { active: true, insert: true });
}

function createUpdateButton(repoURL) {
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