'use strict';

const http = require('http');
const path = require('path');
const zlib = require('zlib');
const url = require('url');
const fs = require('fs');

const PORT = process.env.PORT || process.argv[3] || 3000;
const baseDir = path.resolve(process.argv[2] || '.');

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
  '.gif': 'image/gif'
};

const app = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // method not allowed
    res.writeHead(405, 'Method Not Allowed', {'Allow': 'GET, HEAD', 'Content-Length': '0'});
    return res.end();
  }

  sendFile(req, res, url.parse(req.url).pathname);
});

function sendFile(req, res, pathname) {
  let filename = path.join(baseDir, pathname);

  fs.exists(filename, exists => {
    if (!exists) {
      res.writeHead(404, 'Not Found', {'Content-Type': 'text/plain'});
      return res.end('404 Not Found\n');
    }

    let ext = path.extname(pathname);
    let contentType = mimeTypes[ext] || 'text/plain';
    res.setHeader('Content-Type', contentType);

    fs.stat(filename, function(err, stat) {
      if (stat.isDirectory()) {
        return sendFile(req, res, 'index.html');
      }

      var lastModified = stat.mtime.toUTCString();
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
        res.writeHead(200, 'OK', {'Content-Encoding': 'gzip'});
        raw.pipe(zlib.createGzip()).pipe(res);
      } else if (matched && acceptEncoding.match(/\bdeflate\b/)) {
        res.writeHead(200, 'OK', {'Content-Encoding': 'deflate'});
        raw.pipe(zlib.createDeflate()).pipe(res);
      } else {
        res.writeHead(200, 'OK');
        raw.pipe(res);
      }
    });
  });
}

app.listen(PORT, _ => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
