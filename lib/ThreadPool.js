const {
    Worker
} = require('worker_threads');
const EventEmitter = require('events');
const MAX_SEQ = 0x0fffffff;
class ThreadPool extends EventEmitter {
    constructor({poolSize, script, workerOption}) {
        super();
        this.poolSize = Number(poolSize);
        this._script = script;
        this._workers = new Array(poolSize);
        this._workerOption = workerOption;
        this._seq = 0;
        this._sendCount = new Array(poolSize);
        this._sendCount.fill(0);
        this._init();
    }
    _createWorker(i) {
        const worker = this._workers[i] = new Worker(this._script, this._workerOption);
        const _this = this;
        worker.once('error', function(err) {
            worker.terminate();
            _this._workers.splice(i);
            _this._createWorker(i);
            _this.emit(ThreadPool.EVENT_WORKER_ERROR, err, worker.threadId, i);
        });
        worker.on('message', function(value) {
            _this.emit(ThreadPool.EVENT_NEW_MESSAGE, value, worker.threadId, i);
        });
        worker.on('exit', function(code) {
            _this.emit(ThreadPool.EVENT_WORKER_EXIT, code, worker.threadId, i);
        });
        worker.on('online', function() {
            _this.emit(ThreadPool.EVENT_WORKER_ONLINE, worker.threadId, i);
        });
        return worker;
    }
    _init() {
        for (let i=0;i<this.poolSize;i++) {
            this._createWorker(i);
        }
    }
    send(data, transferList) {
        if (this.poolSize === 1) {
            this._workers[0].postMessage(data, transferList);
            this._sendCount[0]++;
            return;
        }
        const seq = this._seq++;
        if (seq >= MAX_SEQ) {
            this._seq = 0;
        }
        const index = Math.floor(this._seq % this.poolSize);
        this._workers[index].postMessage(data, transferList);
        this._sendCount[index]++;
    }
    destroy() {
        for(let i=0;i<this.poolSize;i++) {
            this._workers[i].terminate();
        }
        this._workers = [];
    }
}

ThreadPool.EVENT_WORKER_ERROR = 'worker_error';
ThreadPool.EVENT_NEW_MESSAGE = 'new_message';
ThreadPool.EVENT_WORKER_EXIT = 'worker_exit';
ThreadPool.EVENT_WORKER_ONLINE = 'worker_online';

module.exports = ThreadPool;