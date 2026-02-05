/**
 * Auth Provider for React Admin
 * Supports both API Key and JWT authentication
 */
const authProvider = {
    // Called when the user attempts to log in
    login: ({ username, password, apiKey }) => {
        if (apiKey) {
            localStorage.setItem('apiKey', apiKey);
            return Promise.resolve();
        }

        // For JWT authentication (future implementation)
        if (username && password) {
            // TODO: Call login API endpoint
            // const response = await fetch('/api/auth/login', { ... });
            // const { token } = await response.json();
            // localStorage.setItem('token', token);
            return Promise.reject(new Error('JWT authentication not yet implemented'));
        }

        return Promise.reject(new Error('Missing credentials'));
    },

    // Called when the user clicks on the logout button
    logout: () => {
        localStorage.removeItem('apiKey');
        localStorage.removeItem('token');
        return Promise.resolve();
    },

    // Called when the API returns an error
    checkError: ({ status }) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem('apiKey');
            localStorage.removeItem('token');
            return Promise.reject();
        }
        return Promise.resolve();
    },

    // Called when the user navigates to a new location, to check for authentication
    checkAuth: () => {
        const apiKey = localStorage.getItem('apiKey');
        const token = localStorage.getItem('token');

        return apiKey || token
            ? Promise.resolve()
            : Promise.reject();
    },

    // Called when the user navigates to a new location, to check for permissions / roles
    getPermissions: () => {
        // For now, all authenticated users have the same permissions
        // In the future, this could check user roles
        return Promise.resolve();
    },

    // Get the user's identity
    getIdentity: () => {
        return Promise.resolve({
            id: 'operator',
            fullName: 'Warehouse Operator',
        });
    },
};

export default authProvider;
