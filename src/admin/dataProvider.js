import simpleRestProvider from 'ra-data-simple-rest';

/**
 * Custom data provider for React Admin
 * Handles ID mapping and response transformation for React Admin compatibility
 */
const baseProvider = simpleRestProvider('/api');

const dataProvider = {
    ...baseProvider,

    /**
     * GET_LIST - Get a list of resources with pagination and filters
     */
    getList: async (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const filters = params.filter;

        // Build query string
        const query = {
            _sort: field,
            _order: order,
            _start: (page - 1) * perPage,
            _end: page * perPage,
            ...filters,
        };

        const url = `/api/${resource}?${new URLSearchParams(query)}`;

        const response = await fetch(url, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const json = await response.json();

        // Transform response to React Admin format
        // Handle both {data, total} and {items, count} formats
        const data = json.data || json.items || json;
        const total = json.total || json.count || data.length;

        // Map IDs for React Admin
        const mappedData = data.map(item => mapIdsToReactAdmin(resource, item));

        return {
            data: mappedData,
            total,
        };
    },

    /**
     * GET_ONE - Get a single resource by ID
     */
    getOne: async (resource, params) => {
        const url = `/api/${resource}/${params.id}`;

        const response = await fetch(url, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const json = await response.json();
        const data = json.data || json;

        return {
            data: mapIdsToReactAdmin(resource, data),
        };
    },

    /**
     * GET_MANY - Get multiple resources by IDs
     */
    getMany: async (resource, params) => {
        const query = {
            id: params.ids,
        };
        const url = `/api/${resource}?${new URLSearchParams(query)}`;

        const response = await fetch(url, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const json = await response.json();
        const data = json.data || json.items || json;

        return {
            data: data.map(item => mapIdsToReactAdmin(resource, item)),
        };
    },

    /**
     * GET_MANY_REFERENCE - Get resources related to another resource
     */
    getManyReference: async (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const filters = params.filter;

        const query = {
            _sort: field,
            _order: order,
            _start: (page - 1) * perPage,
            _end: page * perPage,
            [params.target]: params.id,
            ...filters,
        };

        const url = `/api/${resource}?${new URLSearchParams(query)}`;

        const response = await fetch(url, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const json = await response.json();
        const data = json.data || json.items || json;
        const total = json.total || json.count || data.length;

        return {
            data: data.map(item => mapIdsToReactAdmin(resource, item)),
            total,
        };
    },

    /**
     * CREATE - Create a new resource
     */
    create: async (resource, params) => {
        const url = `/api/${resource}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params.data),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const json = await response.json();
        const data = json.data || json;

        return {
            data: mapIdsToReactAdmin(resource, data),
        };
    },

    /**
     * UPDATE - Update a resource
     */
    update: async (resource, params) => {
        const url = `/api/${resource}/${params.id}`;

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params.data),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const json = await response.json();
        const data = json.data || json;

        return {
            data: mapIdsToReactAdmin(resource, data),
        };
    },

    /**
     * DELETE - Delete a resource
     */
    delete: async (resource, params) => {
        const url = `/api/${resource}/${params.id}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const json = await response.json();
        const data = json.data || json;

        return {
            data: mapIdsToReactAdmin(resource, data),
        };
    },
};

/**
 * Map backend IDs to React Admin's expected 'id' field
 */
function mapIdsToReactAdmin(resource, item) {
    if (!item) return item;

    // For warehouse-orders, map warehouseOrderId to id
    if (resource === 'warehouse-orders') {
        return {
            ...item,
            id: item.id || item.warehouseOrderId,
            warehouseOrderId: item.id || item.warehouseOrderId,
        };
    }

    // For tasks, map taskId to id
    if (resource === 'tasks' || resource === 'warehouse-tasks') {
        return {
            ...item,
            id: item.id || item.taskId,
            taskId: item.id || item.taskId,
        };
    }

    return item;
}

/**
 * Get authentication headers
 */
function getAuthHeaders() {
    const apiKey = localStorage.getItem('apiKey');
    const token = localStorage.getItem('token');

    if (token) {
        return {
            'Authorization': `Bearer ${token}`,
        };
    }

    if (apiKey) {
        return {
            'x-api-key': apiKey,
        };
    }

    return {};
}

export default dataProvider;
