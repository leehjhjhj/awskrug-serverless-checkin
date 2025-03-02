function getEventCodeFromPath() {
    const path = window.location.pathname;
    console.log(path)
    const eventCode = path.split('/').filter(Boolean).pop();
    return eventCode || 'test';
}