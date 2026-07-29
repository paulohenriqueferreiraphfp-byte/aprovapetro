import axios from 'axios';

async function checkApi() {
  try {
    // We assume there's an admin account to get token or we just create a new one
    console.log('Logging in to get token...');
    const loginRes = await axios.post('https://aprovapetro.onrender.com/api/auth/register', {
      email: 'admin_test_statement@test.com',
      name: 'Admin Test',
      password: 'senha'
    });
    const token = loginRes.data.accessToken;

    console.log('Fetching questions from live API...');
    const qRes = await axios.get('https://aprovapetro.onrender.com/api/questions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const questions = qRes.data;
    console.log(`Live API returned ${questions.length} questions.`);
    const fluidQ = questions.find((q: any) => q.topic?.name === 'Mecânica dos Fluidos');
    
    if (fluidQ) {
      console.log('Fluid Q statement:');
      console.log(fluidQ.statement);
      console.log('Keys in fluidQ object:', Object.keys(fluidQ));
    } else {
      console.log('No fluid question found in API response!');
    }
  } catch (e: any) {
    console.error('Error:', e.response?.data || e.message);
  }
}

checkApi();
