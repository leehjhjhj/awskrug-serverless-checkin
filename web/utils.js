function getEventCodeFromPath() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventCode = urlParams.get('c');
    console.log('Event Code:', eventCode);
    return eventCode || 'test';
}