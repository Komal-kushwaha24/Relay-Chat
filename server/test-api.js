const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('=== Starting Relay Chat API Verification ===\n');

  // Generate unique credentials for tests
  const timestamp = Date.now();
  const userA = {
    fullName: `User A ${timestamp}`,
    email: `usera_${timestamp}@example.com`,
    password: 'password123',
  };
  const userB = {
    fullName: `User B ${timestamp}`,
    email: `userb_${timestamp}@example.com`,
    password: 'password123',
  };

  let userAId, userBId;
  let cookieA, cookieB;
  let conversationId;

  try {
    // 1. Register User A
    console.log(`1. Registering User A (${userA.email})...`);
    const regARes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userA),
    });
    const regAData = await regARes.json();
    if (!regAData.success) throw new Error(`User A Registration failed: ${regAData.message}`);
    userAId = regAData.data.id;
    cookieA = regARes.headers.get('set-cookie');
    console.log(`   User A registered successfully. ID: ${userAId}\n`);

    // 2. Register User B
    console.log(`2. Registering User B (${userB.email})...`);
    const regBRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userB),
    });
    const regBData = await regBRes.json();
    if (!regBData.success) throw new Error(`User B Registration failed: ${regBData.message}`);
    userBId = regBData.data.id;
    cookieB = regBRes.headers.get('set-cookie');
    console.log(`   User B registered successfully. ID: ${userBId}\n`);

    // 3. Create a conversation (using User A's session)
    console.log('3. Creating a conversation between User A and User B...');
    const convRes = await fetch(`${BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieA, // Authenticate as User A
      },
      body: JSON.stringify({
        participants: [userAId, userBId],
      }),
    });
    const convData = await convRes.json();
    if (!convData.success) throw new Error(`Conversation creation failed: ${convData.message}`);
    conversationId = convData.data._id;
    console.log(`   Conversation created successfully. ID: ${conversationId}\n`);

    // 4. Send a message in the conversation (using User A's session)
    console.log('4. Sending a message from User A...');
    const msgText = 'Hello User B, this is a test message!';
    const sendMsgRes = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieA, // Authenticate as User A
      },
      body: JSON.stringify({
        conversationId,
        text: msgText,
      }),
    });
    const sendMsgData = await sendMsgRes.json();
    if (!sendMsgData.success) throw new Error(`Sending message failed: ${sendMsgData.message}`);
    console.log(`   Message sent successfully. Text: "${sendMsgData.data.text}"\n`);

    // 5. Fetch messages in the conversation (using User B's session)
    console.log('5. Fetching messages in the conversation (as User B)...');
    const getMsgsRes = await fetch(`${BASE_URL}/messages/${conversationId}`, {
      method: 'GET',
      headers: {
        'Cookie': cookieB, // Authenticate as User B
      },
    });
    const getMsgsData = await getMsgsRes.json();
    if (!getMsgsData.success) throw new Error(`Fetching messages failed: ${getMsgsData.message}`);
    console.log(`   Messages fetched successfully. Count: ${getMsgsData.data.length}`);
    console.log(`   Latest message text: "${getMsgsData.data[0]?.text}"\n`);

    console.log('=== All tests passed successfully! ===');
  } catch (error) {
    console.error('Test failed with error:', error.message);
  }
}

testAPI();
