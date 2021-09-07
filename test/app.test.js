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
    it('returns [{ id, tag_name, popularity }] of top 20 tags on POST /', async () => {
      const { status, body } = await agent
        .post('/tags')
        .type('application/json');
      expect(status).toBe(200);
      expect(body.length).toBe(20);
      deepStrictEqual(
        new Set(Object.keys(body[0])),
        new Set(['id', 'tag_name', 'popularity']),
        'POST /tags'
      );
    });
    it('returns [{ id, tag_name }] on POST /search { id }', async () => {
      const { body } = await agent
        .post('/tags/search')
        .send({ id: 42, tsq: 'capitalism' });
      expect(body.length).toBe(1);
      expect(body[0]).toMatchObject({ id: 42, tag_name: 'FFA' });
    });
    it('returns [{ id, tag_name }] on POST /search { tsq }', async () => {
      const { body } = await agent
        .post('/tags/search')
        .send({ tsq: 'capitalism' });
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
          'user_name',
          'title',
          'notes',
          'regex',
          'fork_of',
          'date_created',
          'date_edited',
          'tags',
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
    it('filters the results againtst the tags on POST / { [tag_id] }', async () => {
      const { body } = await agent
        .post('/regexes')
        .send({ tags: [33, 66, 99], requestedPage: 1 });
      const { regexes, totalPages, pageNum } = body;
      expect(regexes.length).toBe(2);
      expect(totalPages).toBe(1);
      expect(pageNum).toBe(1);
    });
    it('orders the results by the lexical rank on POST / { tsq }', async () => {
      const { body } = await agent
        .post('/regexes')
        .send({ tsq: 'numbers', requestedPage: 1 });
      const { regexes, totalPages } = body;
      expect(regexes.length).toBe(3);
      expect(totalPages).toBe(1);
      expect(regexes[0].title).toBe('Simple Number');
      expect(regexes[1].title).toBe('Phone Numbers');
      expect(regexes[2].title).toBe('Password Validation');
    });
    it('has a protected /write endpoint', async () => {
      const {
        status,
        body: { error },
      } = await agent.post('/regexes/write').type('application/json');
      expect(status).toBe(401);
      expect(error).toBeDefined();
    });
  });
  describe('/test-strings', () => {
    it('returns [{ id, test_string, is_matching }] on POST /search { id }', async () => {
      const { body } = await agent.post('/test-strings/search').send({ id: 5 });
      expect(body.rows[0]).toMatchObject({
        id: 5,
        test_string:
          'id justo sit amet sapien dignissim vestibulum vestibulum ante ipsum primis in faucibus orci luctus et',
        is_matching: true,
      });
      expect(Array.isArray(body.rows)).toBe(true);
    });
  });
  describe('Protected routes', () => {
    describe('/login', () => {
      it('returns Bad Request with no credentials', async () => {
        const { status } = await agent.post('/login').type('application/json');
        expect(status).toBe(400);
      });
      it('logs in with proper credentials', async () => {
        const { status } = await agent.post('/login').send({
          username: 'test@user.io',
          password: 'testing-testing-testing',
        });
        expect(status).toBe(200);
      });
    });
    describe('/regexes/write', () => {
      it('{ title, notes, regex, testStr, tags: [{ id, tagName }] } => { id, exists, tagsCreated, tagsAssociated }', async () => {
        const { status, body } = await agent.post('/regexes/write').send({
          title: 'Test Regex',
          notes: 'Notes go here',
          regex: 't(es)*t',
          testStr: 'teseset',
          tags: [{ id: 42, tagName: 'will matter later' }],
        });
        expect(status).toBe(200);
        expect(body).toMatchObject({
          id: 21,
          title: 'Test Regex',
          exists: true,
          tagsCreated: 0,
          tagsAssociated: 1,
        });
      });
      it('(generate new tags) { title, notes, regex, testStr, tags: [{ id, tagName }, { tagName }] } => { id, exists, tagsCreated, tagsAssociated }', async () => {
        const { status, body } = await agent.post('/regexes/write').send({
          title: 'Test Regex',
          notes: 'Notes go here',
          regex: 't(es)*t',
          testStr: 'teseset',
          tags: [
            { id: 42, tagName: 'existing tag' },
            { tagName: 'new tag' },
            { tagName: 'new tag 2' },
          ],
        });
        expect(status).toBe(200);
        expect(body).toMatchObject({
          id: 22,
          title: 'Test Regex',
          exists: true,
          tagsCreated: 2,
          tagsAssociated: 3,
        });
      });
      it('(no tags array) { title, notes, regex, testStr } => { id, exists, tagsCreated, tagsAssociated }', async () => {
        const { status, body } = await agent.post('/regexes/write').send({
          title: 'Test Regex',
          notes: 'Notes go here',
          regex: 't(es)*t',
          testStr: 'teseset',
        });
        expect(status).toBe(200);
        expect(body).toMatchObject({
          id: 23,
          title: 'Test Regex',
          exists: true,
          tagsCreated: 0,
          tagsAssociated: 0,
        });
      });
      it('{ regexID, title, notes, regex, testStr, tags: [{ id, tagName }] } => forks an existing regex', async () => {
        const { body } = await agent.post('/regexes/write').send({
          regexID: 9,
          title: 'My Fork',
          regex: 'fo|rk',
        });
        expect(body).toMatchObject({
          id: 24,
          title: 'My Fork',
          exists: true,
          tagsCreated: 0,
          tagsAssociated: 0,
        });
      });
      it('{ regexID, title, notes, regex, testStr, tags: [{ id, tagName }] } => edits an existing regex', async () => {
        const { status, body } = await agent.post('/regexes/write').send({
          regexID: 23,
          title: 'Catch 23',
          notes: 'Some notes',
          regex: 'major',
          testStr: 'Major major Major',
          tags: [
            { id: 42, tagName: 'existing tag' },
            { id: 101, tagName: 'new tag' },
            { id: 102, tagName: 'new tag 2' },
          ],
        });
        expect(status).toBe(200);
        expect(body).toMatchObject({
          id: 23,
          title: 'Catch 23',
          exists: true,
          tagsCreated: 0,
          tagsAssociated: 3,
        });
      });
      it('{ regexID, remove } => returns an error for a non-owned regex', async () => {
        const { status, body } = await agent
          .post('/regexes/write')
          .send({ regexID: 19, remove: true });
        expect(status).toBe(403);
        expect(body).toMatchObject({
          error: 'Only the owner can delete the regex',
        });
      });
      it('{ regexID, remove } => deletes an owned regex', async () => {
        const { status, body } = await agent
          .post('/regexes/write')
          .send({ regexID: 23, remove: true });
        expect(status).toBe(200);
        expect(body).toMatchObject({
          exists: false,
        });
      });
      it('(no title no regex) { notes, testStr, tags } => 400 { error }', async () => {
        const { status, body } = await agent.post('/regexes/write').send({
          notes: 'Notes go here',
          testStr: 'teseset',
          tags: [{ id: 42, tagName: 'will matter later' }],
        });
        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'A regex requires a title and a literal',
        });
      });
    });
    it('/protected with a session', async () => {
      const { body } = await agent.post('/protected').type('application/json');
      expect(body).toMatchObject({ id: 6, name: 'Test User' });
    });
    it('/logout', async () => {
      const { status } = await agent.post('/logout').type('application/json');
      expect(status).toBe(200);
    });
    it('/protected', async () => {
      const { status } = await agent
        .post('/protected')
        .type('application/json');
      expect(status).toBe(401);
    });
  });
});
