// Shared fetcher utility for SWR caching across admin pages

/**
 * Generic fetcher for SWR
 * Used for GET requests - automatically parses JSON response
 */
export const fetcher = <T = unknown>(url: string): Promise<T> =>
    fetch(url).then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    });

/**
 * SWR default options for admin pages
 * - Don't refetch on window focus (reduces unnecessary requests)
 * - Dedupe requests within 5 seconds
 * - Keep previous data while revalidating
 */
export const swrOptions = {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
    keepPreviousData: true,
};

/**
 * SWR options for data that changes less frequently (like categories)
 * - Longer dedupe interval (1 minute)
 */
export const swrOptionsLongCache = {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
    keepPreviousData: true,
};

/**
 * POST/PATCH/DELETE request helper with JSON body
 */
export async function apiRequest<T = unknown>(
    url: string,
    method: 'POST' | 'PATCH' | 'DELETE' | 'PUT',
    data?: Record<string, unknown>
): Promise<T> {
    const res = await fetch(url, {
        method,
        headers: data ? { 'Content-Type': 'application/json' } : undefined,
        body: data ? JSON.stringify(data) : undefined,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP error! status: ${res.status}`);
    }

    // Handle empty responses (like DELETE)
    const text = await res.text();
    return text ? JSON.parse(text) : {} as T;
}
