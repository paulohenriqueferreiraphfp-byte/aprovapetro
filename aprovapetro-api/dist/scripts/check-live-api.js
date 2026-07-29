"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function checkApi() {
    try {
        console.log('Logging in to get token...');
        const loginRes = await axios_1.default.post('https://aprovapetro.onrender.com/api/auth/register', {
            email: 'admin_test_statement@test.com',
            name: 'Admin Test',
            password: 'senha'
        });
        const token = loginRes.data.accessToken;
        console.log('Fetching questions from live API...');
        const qRes = await axios_1.default.get('https://aprovapetro.onrender.com/api/questions', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const questions = qRes.data;
        console.log(`Live API returned ${questions.length} questions.`);
        const fluidQ = questions.find((q) => q.topic?.name === 'Mecânica dos Fluidos');
        if (fluidQ) {
            console.log('Fluid Q statement:');
            console.log(fluidQ.statement);
            console.log('Keys in fluidQ object:', Object.keys(fluidQ));
        }
        else {
            console.log('No fluid question found in API response!');
        }
    }
    catch (e) {
        console.error('Error:', e.response?.data || e.message);
    }
}
checkApi();
//# sourceMappingURL=check-live-api.js.map