const {BlockingThreadPool: ThreadPool} = require('../../index');
const path = require('path');
const {expect} = require('chai');

describe('blocking test:', function() {
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
        poolStr.send({data: 'xx', callback: function(err, str) {
            expect(err).to.be.null;
            expect(str).to.have.string('xx');
            done();
        }});
        
    });

    it('transfer performance test', function(done) {
        const POOL_SIZE = 5;
        const COUNT = 10000;
        const poolStr = new ThreadPool({
            poolSize: POOL_SIZE,
            script: path.join(__dirname, '../scripts/str_worker.js')
        });let sum = 0;
        for(let i=0;i<COUNT;i++) {
            poolStr.send({data: i, callback: function() {
                sum++;
                if (sum === COUNT) {
                    poolStr.destroy();
                    done();
                }
            }});
        }
    });
});

