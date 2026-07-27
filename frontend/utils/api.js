// Centralização de chamadas HTTP com cache
class API {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.cache = {};
        this.cacheTimeout = 30000; // 30 segundos
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}/${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        // Cache para GET
        if (options.method === 'GET' || !options.method) {
            const cacheKey = `${endpoint}`;
            const cached = this.cache[cacheKey];
            if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            if (response.status === 204) {
                return null;
            }
            
            const data = await response.json();
            
            // Armazenar em cache para GET
            if (options.method === 'GET' || !options.method) {
                const cacheKey = `${endpoint}`;
                this.cache[cacheKey] = {
                    data: data,
                    timestamp: Date.now()
                };
            }
            
            return data;
        } catch (error) {
            console.error(`Erro na requisição para ${endpoint}:`, error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint);
    }

    async post(endpoint, data) {
        const result = await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        // Limpar cache após POST
        this.clearCache();
        return result;
    }

    async put(endpoint, data) {
        const result = await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        // Limpar cache após PUT
        this.clearCache();
        return result;
    }

    async patch(endpoint, data) {
        const result = await this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        // Limpar cache após PATCH
        this.clearCache();
        return result;
    }

    async delete(endpoint) {
        const result = await this.request(endpoint, {
            method: 'DELETE'
        });
        // Limpar cache após DELETE
        this.clearCache();
        return result;
    }

    // Limpar cache
    clearCache() {
        this.cache = {};
        console.log('Cache limpo');
    }
}

const api = new API(CONSTANTS.API_URL);