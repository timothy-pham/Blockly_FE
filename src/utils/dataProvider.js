export const getToken = () => {
  const currentUser = localStorage.getItem("authToken");
  return JSON.parse(currentUser)?.token
    ? "Bearer " + JSON.parse(currentUser).token
    : "";
};

export const getHeaders = (headers) => {
  const adminData = localStorage.getItem("adminToken");
  const adminToken = JSON.parse(adminData)?.token
    ? "Bearer " + JSON.parse(adminData).token
    : "";
  const data = {
    Authorization: getToken(),
    "Content-Type": "application/json",
    ...headers,
  };
  if (adminToken) {
    data["admin-authorization"] = adminToken;
  }
  return data;
}
export async function apiGet(resource, headers) {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/${resource}`,
      {
        headers: getHeaders(headers),
      }
    );

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
    }
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    // console.error("Error fetching data:", error);
    return null;
  }
}

export async function apiGetDetail(resource, id) {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/${resource}/${id}`,
      {
        headers: getHeaders(),
      }
    );
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
    }
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    // console.error("Error fetching data:", error);
    return null;
  }
}

export async function apiDelete(resource, id) {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/${resource}/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
    }
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    // console.error("Error fetching data:", error);
    return null;
  }
}

export async function apiPatch(resource, id, data) {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/${resource}/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: getHeaders(),
      }
    );
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
    }
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    if (response.status >= 400) {
      throw new Error(result.message);
    }
    return result;
  } catch (error) {
    throw new Error(result.message);
  }
}

export async function apiPost(resource, data) {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/${resource}`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: getHeaders(),
      }
    );
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
    }
    const result = await response.json();
    if (response.status >= 400) {
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    throw new Error(error?.message);
  }
}
