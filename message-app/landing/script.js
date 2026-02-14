const API_URL = window.env?.API_URL || 'http://localhost:3002';
const GAME_URL = window.env?.GAME_URL || 'http://localhost:8080';

// DOM Elements
const messageInput = document.getElementById('messageInput');
const charCount = document.getElementById('charCount');
const createBtn = document.getElementById('createBtn');
const messageForm = document.getElementById('messageForm');
const resultCard = document.getElementById('resultCard');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const shareableLink = document.getElementById('shareableLink');
const copyBtn = document.getElementById('copyBtn');
const copyText = document.getElementById('copyText');
const createAnotherBtn = document.getElementById('createAnotherBtn');

// Character counter
messageInput.addEventListener('input', () => {
    const count = messageInput.value.length;
    charCount.textContent = count;
});

// Create message
createBtn.addEventListener('click', async () => {
    const message = messageInput.value.trim();

    // Validation
    if (!message) {
        showError('Please enter a message before creating a link!');
        return;
    }

    if (message.length < 5) {
        showError('Your message should be at least 5 characters long!');
        return;
    }

    // Hide error if showing
    hideError();

    // Show loading
    messageForm.style.display = 'none';
    loading.style.display = 'block';

    try {
        const response = await fetch(`${API_URL}/api/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            throw new Error('Failed to create message');
        }

        const data = await response.json();

        // Generate the game URL with UUID
        const gameLink = `${GAME_URL}?id=${data.uuid}`;

        // Show result
        shareableLink.value = gameLink;
        loading.style.display = 'none';
        resultCard.style.display = 'block';

    } catch (error) {
        console.error('Error creating message:', error);
        loading.style.display = 'none';
        messageForm.style.display = 'block';
        showError('Oops! Something went wrong. Please try again.');
    }
});

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(shareableLink.value);

        // Visual feedback
        copyText.textContent = 'Copied!';
        copyBtn.classList.add('copied');

        setTimeout(() => {
            copyText.textContent = 'Copy';
            copyBtn.classList.remove('copied');
        }, 2000);
    } catch (error) {
        // Fallback for older browsers
        shareableLink.select();
        document.execCommand('copy');

        copyText.textContent = 'Copied!';
        copyBtn.classList.add('copied');

        setTimeout(() => {
            copyText.textContent = 'Copy';
            copyBtn.classList.remove('copied');
        }, 2000);
    }
});

// Create another message
createAnotherBtn.addEventListener('click', () => {
    messageInput.value = '';
    charCount.textContent = '0';
    resultCard.style.display = 'none';
    messageForm.style.display = 'block';
    hideError();
});

// Error handling
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
}

function hideError() {
    errorMessage.style.display = 'none';
}

// Allow Enter key with Shift for new lines, but prevent form submission
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
    }
});
