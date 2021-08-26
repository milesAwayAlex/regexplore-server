const { app } = require('../src/app');
const request = require('supertest');

describe('server', () => {
  const agent = request.agent(app);
  it('starts up without crashing (yay!)', (done) => {
    agent.get('/').expect(200, done);
  });
});
