// authService.js
import { baseUrl, railwayBaseUrl } from "../../utils";


async function loginUser(email, password, deviceType = 'web') {
  console.log('email ', email, 'password: ', password, 'deviceType:', deviceType)
  const res = await fetch(`${railwayBaseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // ✅ Tells the server you're sending JSON
    },
    body: JSON.stringify({ email, password, deviceType }),
  });
  const data = await res.json();
  console.log('data ', data)
  return data;
}

async function userProfileUpdate(userData) {
  console.log('userData .... ', userData)
  const updateData = userData
  const user = userData
  const token = localStorage.getItem('bolt_visa_token');
  console.log('profile update api', userData)
  const res = await fetch(`${railwayBaseUrl}/admin/updateprofile`, {
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




export { loginUser, userProfileUpdate }
