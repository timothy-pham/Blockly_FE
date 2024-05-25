export async function fetchData(resource, headers) {
  const currentUser = localStorage.getItem("authToken");
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/${resource}`,
      {
        headers: !headers
          ? {
            Authorization: currentUser && JSON.parse(currentUser)?.token ? "Bearer " + JSON.parse(currentUser).token : "",
            "Content-Type": "application/json",
          }
          : headers,
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

export async function fetchDataDetail(resource, id) {
  const currentUser = localStorage.getItem("authToken");
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/${resource}/${id}`,
      {
        headers: {
          Authorization: currentUser && currentUser?.token ? "Bearer " + JSON.parse(currentUser).token : "",
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
  const currentUser = localStorage.getItem("authToken");
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/${resource}/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: currentUser && currentUser?.token ? "Bearer " + JSON.parse(currentUser).token : "",
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
  const currentUser = localStorage.getItem("authToken");
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/${resource}/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
          Authorization: currentUser && currentUser?.token ? "Bearer " + JSON.parse(currentUser).token : "",
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

export async function createData(resource, data) {
  const currentUser = localStorage.getItem("authToken");
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/${resource}`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Authorization: currentUser && currentUser?.token ? "Bearer " + JSON.parse(currentUser).token : "",
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
