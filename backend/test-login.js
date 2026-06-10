async function testLogin() {
  try {
    const response = await fetch('http://localhost:3000/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'security',
        password: '123456'
      })
    });
    
    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Body:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();
