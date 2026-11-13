const assert = require('node:assert/strict');
const { after, test } = require('node:test');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { app } = require('../server');

const userId = '507f1f77bcf86cd799439011';
const notificationId = '507f1f77bcf86cd799439022';
const originalSecret = process.env.JWT_SECRET;
process.env.JWT_SECRET = 'notification-route-test-secret';
const originalUserFindById = User.findById;
const originalUpdateMany = Notification.updateMany;
const originalFindOneAndUpdate = Notification.findOneAndUpdate;
const server = app.listen(0, '127.0.0.1');
const listening = new Promise((resolve, reject) => {
  server.once('listening', resolve);
  server.once('error', reject);
});

after(async () => {
  User.findById = originalUserFindById;
  Notification.updateMany = originalUpdateMany;
  Notification.findOneAndUpdate = originalFindOneAndUpdate;
  if (originalSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalSecret;
  await listening;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('notification read endpoints only update records owned by the authenticated user', async () => {
  await listening;
  User.findById = () => ({
    select: async () => ({ id: userId, _id: userId, sessionVersion: 0 }),
  });

  const updatedQueries = [];
  Notification.findOneAndUpdate = (query) => {
    updatedQueries.push(query);
    return {
      lean: async () => ({
        _id: notificationId,
        read: true,
      }),
    };
  };
  let allReadQuery;
  Notification.updateMany = async (query) => {
    allReadQuery = query;
    return { modifiedCount: 2 };
  };

  const token = jwt.sign({ sub: userId, ver: 0 }, process.env.JWT_SECRET, { expiresIn: '5m' });
  const baseUrl = `http://127.0.0.1:${server.address().port}/api/notifications`;
  const headers = { Cookie: `gwic_session=${token}` };

  const oneResponse = await fetch(`${baseUrl}/${notificationId}/read`, {
    method: 'PATCH',
    headers,
  });
  assert.equal(oneResponse.status, 200);
  assert.equal((await oneResponse.json()).notification.read, true);
  assert.deepEqual(updatedQueries[0], { _id: notificationId, userId });

  const malformedResponse = await fetch(`${baseUrl}/invalid-id/read`, {
    method: 'PATCH',
    headers,
  });
  assert.equal(malformedResponse.status, 404);
  assert.equal(updatedQueries.length, 1);

  const allResponse = await fetch(`${baseUrl}/read-all`, {
    method: 'PATCH',
    headers,
  });
  assert.equal(allResponse.status, 200);
  assert.deepEqual(allReadQuery, { userId, read: false });
  assert.equal((await allResponse.json()).updated, 2);
});
