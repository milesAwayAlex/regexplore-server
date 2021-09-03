const { app } = require('../src/app');
const request = require('supertest');
const { deepStrictEqual } = require('assert/strict');

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
  describe('/tags', () => {
    it('returns the list of tags on /', async () => {
      const { status, body } = await agent.get('/tags');
      expect(status).toBe(200);
      expect(body.length).toBe(20);
      deepStrictEqual(
        new Set(Object.keys(body[0])),
        new Set(['id', 'tag_name']),
        'GET /tags'
      );
    });
    it('returns [{ id, tag_name }] on POST /search { id }', async () => {
      const { body } = await agent
        .post('/tags/search')
        .send({ id: 42, tsq: 'customers' });
      expect(body.length).toBe(1);
      expect(body[0]).toMatchObject({ id: 42, tag_name: 'contextually-based' });
    });
    it('returns [{ id, tag_name }] on POST /search { tsq }', async () => {
      const { body } = await agent
        .post('/tags/search')
        .send({ tsq: 'customers' });
      expect(body.length).toBe(2);
      deepStrictEqual(
        new Set(Object.keys(body[0])),
        new Set(['id', 'tag_name']),
        'POST /search { tsq }'
      );
    });
  });
  describe('/regexes', () => {
    it('returns the first page of 5 regexes [{ regexes: [], totalPages, pageNum }] on POST /', async () => {
      const { body } = await agent.post('/regexes').type('application/json');
      const { regexes, totalPages, pageNum } = body;
      expect(regexes.length).toBe(5);
      expect(totalPages).toBe(3);
      expect(pageNum).toBe(1);
      deepStrictEqual(
        new Set(Object.keys(regexes[0])),
        new Set([
          'id',
          'user_id',
          'title',
          'notes',
          'regex',
          'fork_of',
          'date_created',
          'date_edited',
        ]),
        'POST regexes/'
      );
    });
    it('returns the third page on POST / { requestedPage }', async () => {
      const { body } = await agent.post('/regexes').send({ requestedPage: 3 });
      const { regexes, totalPages, pageNum } = body;
      expect(regexes.length).toBe(5);
      expect(totalPages).toBe(3);
      expect(pageNum).toBe(3);
    });
  });
});
