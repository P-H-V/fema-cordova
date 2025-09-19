/**
 * Simple HTTP client utility for making requests with cache prevention
 */

class HttpClient {
    constructor() {
        this.defaultHeaders = {
            'Cache-Control': 'no-cache, no-store, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0'
        };
    }

    /**
     * Make a GET request with aggressive cache prevention
     * @param {string} url - The URL to fetch
     * @param {Object} options - Additional fetch options
     * @returns {Promise<Response>} The fetch response
     */
    async get(url, options = {}) {
        // Add cache-busting parameters
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const cacheBustedUrl = `${url}${url.includes('?') ? '&' : '?'}_=${timestamp}&r=${random}&v=${Math.random()}&t=${new Date().getTime()}&nonce=${Math.floor(Math.random() * 1000000)}`;

        // Merge headers
        const headers = {
            ...this.defaultHeaders,
            ...(options.headers || {})
        };

        // Default options
        const fetchOptions = {
            method: 'GET',
            cache: 'no-store',
            headers,
            ...options
        };

        return await fetch(cacheBustedUrl, fetchOptions);
    }

    /**
     * Make a GET request and return JSON response
     * @param {string} url - The URL to fetch
     * @param {Object} options - Additional fetch options
     * @returns {Promise<any>} The parsed JSON response
     */
    async getJSON(url, options = {}) {
        const response = await this.get(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    /**
     * Make a GET request and return text response
     * @param {string} url - The URL to fetch
     * @param {Object} options - Additional fetch options
     * @returns {Promise<string>} The text response
     */
    async getText(url, options = {}) {
        const response = await this.get(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    }
}

// Export as a singleton instance
const httpClient = new HttpClient();
export default httpClient;