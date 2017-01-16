'use strict';

const path = require('path');
const request = require('supertest');

const dir = path.join(__dirname, 'fixtures');
const app = require('..')(dir);

const dateRegExp = /^\w{3}, \d+ \w+ \d+ \d+:\d+:\d+ \w+$/;

describe('http-static', function () {
  it('should stream the file contents', function (done) {
    request(app)
      .get('/name.txt')
      .expect(200, 'tobi', done);
  });

  it('should decode the given path as a URI', function (done) {
    request(app)
      .get('/some%20thing.txt')
      .expect(200, 'hey', done);
  });

  it('should serve files with dots in name', function (done) {
    request(app)
      .get('/do..ts.txt')
      .expect(200, '...', done);
  });

  it('should treat a malformed URI as a bad request', function (done) {
    request(app)
      .get('/some%99thing.txt')
      .expect(404, done);
  });

  it('should 404 on NULL bytes', function (done) {
    request(app)
      .get('/some%00thing.txt')
      .expect(404, done);
  });

  it('should treat an ENAMETOOLONG as a 404', function (done) {
    let path = Array(100).join('foobar')
    request(app)
      .get('/' + path)
      .expect(404, done);
  });

  it('should support HEAD', function (done) {
    request(app)
      .head('/name.txt')
      .expect(200, '', done);
  });

  it('should not support POST', function (done) {
    request(app)
      .post('/name.txt')
      .expect(405, done);
  });

  it('should add a Date header field', function (done) {
    request(app)
      .get('/name.txt')
      .expect('date', dateRegExp, done);
  });

  it('should add a Last-Modified header field', function (done) {
    request(app)
      .get('/name.txt')
      .expect('last-modified', dateRegExp, done);
  });

  it('should fire on index', function (done) {
    request(app)
      .get('/pets/')
      .expect(200, /tobi/, done);
  });

  it('should respond with 304 on a match', function (done) {
    request(app)
      .get('/name.txt')
      .expect(200, function (err, res) {
        if (err) return done(err)

        request(app)
          .get('/name.txt')
          .set('If-Modified-Since', res.headers['last-modified'])
          .expect(304, done);
      });
  });

  it('should encoding deflate', function (done) {
    request(app)
      .get('/name.txt')
      .set('Accept-Encoding', 'deflate')
      .expect(200, 'tobi', done);
  });
});
