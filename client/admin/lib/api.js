const API_URL = "http://localhost:5000/api";

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;

  console.log("API REQUEST:", url);

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type");

  console.log("API STATUS:", response.status);
  console.log("API CONTENT TYPE:", contentType);

  if (!contentType?.includes("application/json")) {
    const text = await response.text();

    console.error("NON-JSON RESPONSE:", text);

    throw new Error(
      `Server returned non-JSON response (${response.status})`
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};