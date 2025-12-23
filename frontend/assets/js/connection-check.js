// Backend Connection Check

async function checkBackendConnection() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/health`);
        if (response.ok) {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

// Check connection on page load
document.addEventListener('DOMContentLoaded', async () => {
    const isConnected = await checkBackendConnection();
    if (!isConnected) {
        console.warn('Backend server not reachable. Make sure it is running on http://localhost:3000');
    }
});


