const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_URL.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;

    const isFormData =
        typeof FormData !== "undefined" &&
        options.body instanceof FormData;

    const headers = {
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
    };

    // FormData ke liye browser ko Content-Type boundary set karne do.
    if (isFormData) {
        delete headers["Content-Type"];
        delete headers["content-type"];
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    const text = await response.text();

    let data;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        throw new Error(
            `Server returned invalid response (${response.status}): ${text}`
        );
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.error ||
            `Request failed with status ${response.status}`
        );
    }

    return data;
};