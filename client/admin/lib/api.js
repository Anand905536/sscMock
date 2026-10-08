const API_URL = "http://localhost:5000/api";

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await response.text();

  console.log("API URL:", url);
  console.log("API STATUS:", response.status);
  console.log("API RESPONSE:", text);

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Server returned invalid response (${response.status}): ${text}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.error ||
      `Request failed with status ${response.status}`
    );
  }

  return data;
};