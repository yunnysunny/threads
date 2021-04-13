# threads

[![build status][action-image]][action-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![GitHub license](https://img.shields.io/github/license/yunnysunny/threads)](https://github.com/yunnysunny/threads)
[![node version][node-image]][node-url]

[npm-url]: https://npmjs.org/package/@yunnysunny/threads
[action-image]: https://github.com/yunnysunny/threads/workflows/mocha/badge.svg
[action-url]: https://github.com/yunnysunny/threads/actions/workflows/node.js.yml
[coveralls-image]: https://coveralls.io/repos/github/yunnysunny/threads/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/yunnysunny/threads?branch=master

[node-image]: https://img.shields.io/badge/node.js-%3E=_12-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/

[![NPM](https://nodei.co/npm/node-@yunnysunny/threads.png?downloads=true)](https://nodei.co/npm/node-@yunnysunny/threads/) 

Thread util in Node.js. It's only test on node 12+.

## Install

```
yarn add @yunnysunny/threads
```

## Usage

### NoneBlockingThreadPool

```javascript
const {NoneBlockingThreadPool: ThreadPool} = require('@yunnysunny/threads');

const poolStr = new ThreadPool({
    poolSize: 5,
    script: path.join(__dirname, '../scripts/str_worker.js')
});
poolStr.send('test');
poolStr.on(ThreadPool.EVENT_NEW_MESSAGE, function(msg) {
    //process msg
});
poolStr.on(ThreadPool.EVENT_WORKER_ERROR, function(err, threadId) {
    //show error message
});
```

### BlockingThreadPool

```javascript
const {NoneBlockingThreadPool: ThreadPool} = require('@yunnysunny/threads');
const POOL_SIZE = 5;
const poolStr = new ThreadPool({
    poolSize: POOL_SIZE,
    script: path.join(__dirname, '../scripts/str_worker.js')
});
poolStr.send({data: 'xx', callback: function(err, str) {
    //todo next process
}});
poolStr.on(ThreadPool.EVENT_WORKER_ERROR, function(err, threadId) {
    //show error message
});
```