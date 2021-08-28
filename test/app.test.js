const { app } = require('../src/app');
const request = require('supertest');

describe('server', () => {
  const agent = request.agent(app);
  afterAll(() => agent.get('/db-test/disconnect'));
  it('starts up without crashing (yay!)', (done) => {
    agent.get('/').expect(200, done);
  });
  it('connects to the database', (done) => {
    agent
      .get('/db-test')
      .expect(200)
      .expect(({ body }) => {
        if (!Array.isArray(body) || !body[0].time)
          throw new Error('database smoke test');
      })
      .end(done);
  });
});
