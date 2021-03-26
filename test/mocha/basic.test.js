const {ThreadPool} = require('../../index');
const path = require('path');
const {expect} = require('chai');

describe('basic test:', function() {
    it('init a thread pool', function(done) {
        const POOL_SIZE = 5;
        const poolStr = new ThreadPool({
            poolSize: POOL_SIZE,
            script: path.join(__dirname, '../scripts/str_worker.js')
        });
        let sum = 0;

        poolStr.on(ThreadPool.EVENT_WORKER_ONLINE, function() {
            sum++;
            if (sum === POOL_SIZE) {
                poolStr.destroy();
                done();
            }
        });
    });
    it('transfer string single time', function(done) {
        const poolStr = new ThreadPool({
            poolSize: 5,
            script: path.join(__dirname, '../scripts/str_worker.js')
        });
        poolStr.send('test');
        poolStr.on(ThreadPool.EVENT_NEW_MESSAGE, function() {
            poolStr.destroy();
            done();
        });
    });
    it('transfer string multi time', function() {
        const POOL_SIZE = 5;
        const COUNT = 10000;
        const poolStr = new ThreadPool({
            poolSize: POOL_SIZE,
            script: path.join(__dirname, '../scripts/str_worker.js')
        });
        for(var i=0;i<COUNT;i++) {
            poolStr.send(i);
        }
        expect(poolStr._sendCount[0]).to.be.equal(COUNT / POOL_SIZE);
        poolStr.destroy();
    });
    it('transfer performance test', function(done) {
        const POOL_SIZE = 5;
        const COUNT = 10000;
        const poolStr = new ThreadPool({
            poolSize: POOL_SIZE,
            script: path.join(__dirname, '../scripts/str_worker.js')
        });
        for(let i=0;i<COUNT;i++) {
            poolStr.send(i);
        }
        let sum = 0;
        for (let i=0;i<POOL_SIZE;i++) {
            console.time('thread'+i);
        }
        poolStr.on(ThreadPool.EVENT_WORKER_ONLINE, function(threadId, index) {
            console.timeEnd('thread'+index);
        });
        poolStr.on(ThreadPool.EVENT_NEW_MESSAGE, function() {
            sum++;
            if (sum === COUNT) {
                poolStr.destroy();
                done();
            }
        });
    });
    // it('deplay exit', function(done) {
    //     setTimeout(function() {done();}, 100000);
    // });
});

