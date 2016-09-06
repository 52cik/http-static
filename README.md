# http-static

> `cn:` 简单的静态文件服务器。  
> `en:` A simple static file http server.  

[![Linux Build][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Dependencies][dependencies-image]][dependencies-url]
[![node][node-image]][node-url]
[![license MIT][license-image]][license-url]

## 使用方法 (How to use it)

``` sh
$ npm install -g 52cik/serve-static
```

``` sh
$ serve-static static_dir 8000
```

`cn:` 以 static_dir 为跟目录，8000 为端口启动服务器。  
`en:` With static_dir as the directory, 8000 for the port to start the server.



[travis-url]: https://travis-ci.org/52cik/http-static
[travis-image]: https://img.shields.io/travis/52cik/http-static/master.svg?label=linux

[coveralls-url]: https://coveralls.io/github/52cik/http-static?branch=master
[coveralls-image]: https://coveralls.io/repos/52cik/http-static/badge.svg?branch=master&service=github

[license-url]: https://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg

[dependencies-url]: https://david-dm.org/52cik/http-static
[dependencies-image]: https://img.shields.io/david/52cik/http-static.svg?style=flat

[node-url]: https://nodejs.org
[node-image]: https://img.shields.io/node/v/gh-badges.svg
