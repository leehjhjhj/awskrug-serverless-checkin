document.getElementById('attendanceForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const button = e.target.querySelector('button');
    const buttonText = button.querySelector('.button-text');
    const spinner = button.querySelector('.spinner');
    
    // Show spinner, disable button
    buttonText.style.opacity = '0.5';
    spinner.classList.remove('hidden');
    button.disabled = true;
    
    const phoneNumber = document.getElementById('phoneNumber').value;
    const eventCode = getEventCodeFromPath();
    
    try {
        const response = await fetch(`${config.API_URL}/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                phone: phoneNumber,
                event_code: eventCode
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Server error');
        }
        alert('출석체크가 완료되었습니다!');
        sessionStorage.setItem('userName', data.name);
        sessionStorage.setItem('userCount', data.count);
        window.location.href = 'result.html';
        
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || '오류가 발생했습니다.');
    } finally {
        // Hide spinner, enable button
        buttonText.style.opacity = '1';
        spinner.classList.add('hidden');
        button.disabled = false;
    }
});
