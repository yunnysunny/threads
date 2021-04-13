const {NoneBlockingThreadPool: ThreadPool} = require('../../index');
const path = require('path');
const {expect} = require('chai');

describe('none blocking test:', function() {
    it('init a thread pool with poolSize 5', function(done) {
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
    it('init a thread pool with poolSize 1', function(done) {
        const POOL_SIZE = 1;
        const poolStr = new ThreadPool({
            poolSize: POOL_SIZE,
            script: path.join(__dirname, '../scripts/str_worker.js')
        });
        poolStr.send({data: 'xx'});
        done();
    });
    it('transfer string single time', function(done) {
        const poolStr = new ThreadPool({
            poolSize: 5,
            script: path.join(__dirname, '../scripts/str_worker.js')
        });
        poolStr.send({data: 'test'});
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
            poolStr.send({data: i});
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
            poolStr.send({data: i});
        }
        let sum = 0;
        let initCount = 0;
        // eslint-disable-next-line no-console
        console.time('begin_INIT');
        poolStr.on(ThreadPool.EVENT_WORKER_ONLINE, function(threadId, index) {
            if (++initCount === POOL_SIZE) {
                // eslint-disable-next-line no-console
                console.timeEnd('begin_INIT');
            }
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

