// updateLibrary.js
function checkForUpdates(repoURL, currentVersion) {
    const versionURL = `https://raw.github.com/githubkorean/KkutuAlarm/master/Version.txt`;  // 깃허브에 저장한 버전 정보 파일의 URL
    const scriptBaseURL = `https://raw.github.com/githubkorean/KkutuAlarm/master/Scripts/`;  // 깃허브 스크립트 파일의 기본 URL

    GM_xmlhttpRequest({
        method: 'GET',
        url: versionURL,
        onload: function(response) {
            const latestVersion = response.responseText.trim();

            if (latestVersion !== currentVersion) {
                console.log(`New version ${latestVersion} available. Checking user response...`);
                showUpdatePrompt(latestVersion, scriptBaseURL);
            } else {
                console.log('You are using the latest version.');
            }
        }
    });
}

function showUpdatePrompt(latestVersion, scriptBaseURL) {
    const message = `New version ${latestVersion} available. Would you like to update now?`;
    const updateNow = confirm(message);

    if (updateNow) {
        redirectToUpdate(latestVersion, scriptBaseURL);
    } else {
        const postponeResponse = confirm("Would you like to be reminded tomorrow?");
        if (postponeResponse) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            GM_setValue('nextUpdateReminder', tomorrow.getTime());
            alert('You will be reminded tomorrow.');
        } else {
            const remindLater = confirm("Would you like to be reminded in 10 minutes?");
            if (remindLater) {
                const tenMinutesLater = new Date();
                tenMinutesLater.setMinutes(tenMinutesLater.getMinutes() + 10);
                GM_setValue('nextUpdateReminder', tenMinutesLater.getTime());
                alert('You will be reminded in 10 minutes.');
            }
        }
    }
}

function redirectToUpdate(latestVersion, scriptBaseURL) {
    const scriptURL = `${scriptBaseURL}${latestVersion}.user.js`;
    GM_openInTab(scriptURL, { active: true, insert: true });
}
