# threads

[![build status][action-image]][action-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]

[npm-url]: https://npmjs.org/package/@yunnysunny/threads
[action-image]: https://github.com/yunnysunny/threads/workflows/mocha/badge.svg
[action-url]: https://github.com/yunnysunny/threads/actions/workflows/node.js.yml
[coveralls-image]: https://img.shields.io/coveralls/yunnysunny/@yunnysunny/threads.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/yunnysunny/@yunnysunny/threads?branch=master
[david-image]: https://img.shields.io/david/yunnysunny/@yunnysunny/threads.svg?style=flat-square
[david-url]: https://david-dm.org/yunnysunny/@yunnysunny/threads
[node-image]: https://img.shields.io/badge/node.js-%3E=_12-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/

[![NPM](https://nodei.co/npm/node-@yunnysunny/threads.png?downloads=true)](https://nodei.co/npm/node-@yunnysunny/threads/) 

Thread util in Node.js. It's only test on node 12+.

## Install

```
yarn add @yunnysunny/threads
```

## Usage

```javascript
const {ThreadPool} = require('@yunnysunny/threads');

const poolStr = new ThreadPool({
    poolSize: 5,
    script: path.join(__dirname, '../scripts/str_worker.js')
});
poolStr.send('test');
poolStr.on(ThreadPool.EVENT_NEW_MESSAGE, function(msg) {
    //process msg
});
```