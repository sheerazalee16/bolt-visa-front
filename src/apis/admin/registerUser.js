import { baseUrl, railwayBaseUrl } from "../../utils";

async function registerUser(userData) {
  console.log('userData .... ', userData)
  const res = await fetch(`${railwayBaseUrl}/admin/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  console.log('register data', data);

  return data;
}

async function editUser(userData) {
  console.log('userData .... ', userData)
  const updateData = userData
  const user = userData
  const token = localStorage.getItem('bolt_visa_token');

  const res = await fetch(`${railwayBaseUrl}/admin/updateprofile?userId=${userData.userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updateData, user),
  });
  const data = await res.json();
  console.log('register data', data);

  return data;
}

async function fetchAllUsers() {
  try {
    const token = localStorage.getItem('bolt_visa_token');

    const res = await fetch(`${railwayBaseUrl}/admin/users?page=1&limit=20`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || 'Failed to fetch users' };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}
export { registerUser, fetchAllUsers, editUser }
