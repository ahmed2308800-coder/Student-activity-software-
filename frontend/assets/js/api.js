// API Service - Handles all backend communication

class APIService {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        // Prevent API calls during logout
        if (window.isLoggedOut || window.isLoggingOut) {
            console.log('API request blocked: user is logging out');
            throw new Error('User is logging out');
        }

        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add body if it's an object (stringify it)
        if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
            config.body = JSON.stringify(config.body);
        }

        // Add auth token if available
        if (AppState.token) {
            config.headers['Authorization'] = `Bearer ${AppState.token}`;
        }

        try {
            const response = await fetch(url, config);
            
            // Check if response is ok before trying to parse JSON
            let data;
            const text = await response.text();
            
            try {
                if (text) {
                    data = JSON.parse(text);
                } else {
                    data = {};
                }
            } catch (parseError) {
                // If JSON parsing fails, create a generic error
                console.error('JSON parse error:', parseError, 'Response text:', text);
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status} ${response.statusText}. Response: ${text.substring(0, 100)}`);
                }
                data = {};
            }

            if (!response.ok) {
                // Extract error message from response - try multiple possible formats
                let errorMessage = null;
                
                // Backend format: { success: false, error: { message: "..." } }
                if (data.error && typeof data.error === 'object' && data.error.message) {
                    errorMessage = data.error.message;
                }
                // Alternative format: { message: "..." }
                else if (data.message) {
                    errorMessage = data.message;
                }
                // String error: { error: "..." }
                else if (typeof data.error === 'string') {
                    errorMessage = data.error;
                }
                // Array of errors: { errors: [...] }
                else if (data.errors && Array.isArray(data.errors)) {
                    errorMessage = data.errors.map(e => e.msg || e.message || e).join(', ');
                }
                // Array error: { error: [...] }
                else if (Array.isArray(data.error)) {
                    errorMessage = data.error.map(e => e.msg || e.message || e).join(', ');
                }
                
                if (!errorMessage) {
                    errorMessage = `Request failed: ${response.status} ${response.statusText}`;
                }
                
                console.error('API Error Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    responseData: data,
                    extractedMessage: errorMessage
                });
                
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            // Handle logout prevention
            if (error.message === 'User is logging out') {
                console.log('API call prevented during logout');
                throw new Error('Authentication required');
            }

            // Handle network errors
            if (error.message === 'Failed to fetch' || error.name === 'TypeError' || error.message.includes('fetch')) {
                console.error('Network error:', error);
                throw new Error('Cannot connect to server. Please make sure the backend is running on http://localhost:3000');
            }
            // Re-throw other errors with their messages
            console.error('API request error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    // Event endpoints
    async getEvents(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        return this.request(`/events${queryString ? '?' + queryString : ''}`);
    }

    async getEventById(id) {
        return this.request(`/events/${id}`);
    }

    async createEvent(eventData) {
        return this.request('/events', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
    }

    async updateEvent(id, eventData) {
        return this.request(`/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(eventData)
        });
    }

    async deleteEvent(id) {
        return this.request(`/events/${id}`, {
            method: 'DELETE'
        });
    }

    async approveEvent(id) {
        return this.request(`/events/${id}/approve`, {
            method: 'POST'
        });
    }

    async rejectEvent(id, reason) {
        return this.request(`/events/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        });
    }

    async getPendingEvents() {
        return this.request('/events/pending/list');
    }

    async notifyParticipants(eventId, message, title) {
        return this.request(`/events/${eventId}/notify-participants`, {
            method: 'POST',
            body: JSON.stringify({ message, title })
        });
    }

    // Registration endpoints
    async registerForEvent(eventId) {
        return this.request('/registrations', {
            method: 'POST',
            body: JSON.stringify({ eventId })
        });
    }

    async cancelRegistration(eventId) {
        return this.request(`/registrations/${eventId}`, {
            method: 'DELETE'
        });
    }

    async getMyRegistrations() {
        return this.request('/registrations/my-registrations');
    }

    async checkRegistration(eventId) {
        return this.request(`/registrations/check/${eventId}`);
    }

    async getEventRegistrations(eventId) {
        return this.request(`/registrations/event/${eventId}`);
    }

    // Attendance endpoints
    async markAttendance(eventId, userId, status) {
        return this.request('/attendances', {
            method: 'POST',
            body: JSON.stringify({ eventId, userId, status })
        });
    }

    async getEventAttendance(eventId) {
        return this.request(`/attendances/event/${eventId}`);
    }

    async getAttendanceStats() {
        return this.request('/attendances/stats');
    }

    // Feedback endpoints
    async submitFeedback(eventId, rating, comment) {
        return this.request('/feedbacks', {
            method: 'POST',
            body: JSON.stringify({ eventId, rating, comment })
        });
    }

    async getEventFeedbacks(eventId) {
        return this.request(`/feedbacks/event/${eventId}`);
    }

    // Notification endpoints
    async getNotifications(limit = 50, skip = 0) {
        return this.request(`/notifications?limit=${limit}&skip=${skip}`);
    }

    async markNotificationAsRead(id) {
        return this.request(`/notifications/${id}/read`, {
            method: 'PUT'
        });
    }

    async markAllNotificationsAsRead() {
        return this.request('/notifications/read-all', {
            method: 'PUT'
        });
    }

    async getUnreadCount() {
        return this.request('/notifications/unread/count');
    }

    async broadcastNotification(title, message, type) {
        return this.request('/notifications/broadcast', {
            method: 'POST',
            body: JSON.stringify({ title, message, type })
        });
    }

    // Guest endpoints
    async inviteGuest(eventId, guestData) {
        return this.request('/guests', {
            method: 'POST',
            body: JSON.stringify({ eventId, ...guestData })
        });
    }

    async acceptInvitation(guestId) {
        return this.request(`/guests/${guestId}/accept`, {
            method: 'POST'
        });
    }

    async declineInvitation(guestId) {
        return this.request(`/guests/${guestId}/decline`, {
            method: 'POST'
        });
    }

    async getEventGuests(eventId) {
        return this.request(`/guests/event/${eventId}`);
    }

    // Analytics endpoints
    async getDashboardStats() {
        return this.request('/analytics/dashboard');
    }

    // User endpoints
    async getUsers() {
        return this.request('/users');
    }

    async getUserById(id) {
        return this.request(`/users/${id}`);
    }

    async updateUser(id, userData) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(id) {
        return this.request(`/users/${id}`, {
            method: 'DELETE'
        });
    }

    // Menu endpoint
    async getMenu() {
        return this.request('/menu');
    }

    // Backup endpoints
    async createBackup() {
        return this.request('/backup/create', {
            method: 'POST'
        });
    }

    async listBackups() {
        return this.request('/backup/list');
    }

    async restoreBackup(backupPath) {
        return this.request('/backup/restore', {
            method: 'POST',
            body: JSON.stringify({ backupPath })
        });
    }
}

// Create API instance
const api = new APIService(API_CONFIG.BASE_URL);

