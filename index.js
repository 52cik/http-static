'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const url = require('url');

const maxAge = 60 * 60 * 24 * 365; // 1 year
const gzipTypes = /(?:html|css|js|xml)/ig;
const mimeTypes = {
  '.htm': 'text/html',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.xml': 'text/xml',
  '.txt': 'text/plain',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.ttf': 'application/x-font-ttf',
  '.woff': 'application/font-woff',
  '.woff2': 'application/font-woff2',
  '.eot': 'application/vnd.ms-fontobject',
};

var BASEDIR = '.';

/**
 * Expose http static
 *
 * @param {String} baseDir
 * @returns {httpStatic}
 */
module.exports = function (baseDir) {
  BASEDIR = baseDir;
  return httpStatic;
};

/**
 * Static server
 *
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
function httpStatic(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // CORS

  if (req.method !== 'GET' && req.method !== 'HEAD') { // method not allowed
    res.writeHead(405, 'Method Not Allowed', { 'Allow': 'GET, HEAD', 'Content-Length': 0 });
    return res.end();
  }

  sendFile(req, res, url.parse(req.url).pathname);
}

/**
 * Send file
 *
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @param {String} pathname
 */
function sendFile(req, res, pathname) {
  let filename = path.join(BASEDIR, unescape(pathname));

  fs.exists(filename, exists => {
    if (!exists) {
      res.writeHead(404, 'Not Found');
      return res.end();
    }

    let ext = path.extname(pathname);
    let contentType = mimeTypes[ext] || 'text/plain';
    res.setHeader('Content-Type', contentType);

    fs.stat(filename, function (err, stat) {
      if (stat.isDirectory()) {
        return sendFile(req, res, path.join(pathname, 'index.html'));
      }

      let lastModified = stat.mtime.toUTCString();
      res.setHeader('Last-Modified', lastModified);

      let expires = new Date();
      expires.setTime(expires.getTime() + maxAge * 1000);
      res.setHeader('Expires', expires.toUTCString());
      res.setHeader('Cache-Control', 'max-age=' + maxAge);

      let ifModifiedSince = req.headers['if-modified-since'];
      if (ifModifiedSince && lastModified == ifModifiedSince) {
        res.statusCode = 304;
        return res.end();
      }

      let raw = fs.createReadStream(filename);
      let acceptEncoding = req.headers['accept-encoding'] || '';
      let matched = ext.match(gzipTypes);

      if (matched && acceptEncoding.match(/\bgzip\b/)) {
        res.writeHead(200, 'OK', { 'Content-Encoding': 'gzip' });
        raw.pipe(zlib.createGzip()).pipe(res);
      } else if (matched && acceptEncoding.match(/\bdeflate\b/)) {
        res.writeHead(200, 'OK', { 'Content-Encoding': 'deflate' });
        raw.pipe(zlib.createDeflate()).pipe(res);
      } else {
        res.writeHead(200, 'OK');
        raw.pipe(res);
      }
    });
  });
}
