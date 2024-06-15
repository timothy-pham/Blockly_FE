export const getToken = () => {
  const currentUser = localStorage.getItem("authToken");
  return JSON.parse(currentUser)?.token
    ? "Bearer " + JSON.parse(currentUser).token
    : "";
};

export async function fetchData(resource, headers) {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/${resource}`,
      {
        headers: !headers
          ? {
            Authorization: getToken(),
            "Content-Type": "application/json",
          }
          : headers,
      }
    );

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

export async function fetchDataDetail(resource, id) {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/${resource}/${id}`,
      {
        headers: {
          Authorization: getToken(),
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

export async function deleteData(resource, id) {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/${resource}/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: getToken(),
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

export async function updateData(resource, id, data) {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/${resource}/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
          Authorization: getToken(),
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

export async function post(resource, data) {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/${resource}`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Authorization: getToken(),
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    if (response.status > 400) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}
