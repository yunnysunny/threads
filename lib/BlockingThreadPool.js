const { AsyncResource } = require('async_hooks');
const { EventEmitter } = require('events');
const { Worker } = require('worker_threads');

const kTaskInfo = Symbol('kTaskInfo');
const kWorkerFreedEvent = Symbol('kWorkerFreedEvent');

class WorkerPoolTaskInfo extends AsyncResource {
    constructor(callback) {
        super('WorkerPoolTaskInfo');
        this.callback = callback;
    }

    done(err, result) {
        this.runInAsyncScope(this.callback, null, err, result);
        this.emitDestroy();  // `TaskInfo`s are used only once.
    }
}

class BlockingThreadPool extends EventEmitter {
    constructor({poolSize, script, workerOption}) {
        super();
        this._script = script;
        this._workerOption = workerOption;
        this._workers = [];
        this._freeWorkers = [];
        this._pendingTasks = [];

        for (let i = 0; i < poolSize; i++) {
            this._createWorker();
        }

        // Any time the kWorkerFreedEvent is emitted, dispatch
        // the next task pending in the queue, if any.
        const _this = this;
        this.on(kWorkerFreedEvent, function workerOnFree() {
            if (this._pendingTasks.length > 0) {
                const { data, transferList, callback } = _this._pendingTasks.shift();
                _this.send({data, transferList, callback});
            }
        });
    }

    _createWorker() {
        const worker = new Worker(this._script, this._workerOption);
        const _this = this;
        worker.on('message', function workerMessage(result) {
            // In case of success: Call the callback that was passed to `runTask`,
            // remove the `TaskInfo` associated with the Worker, and mark it as free
            // again.
            worker[kTaskInfo].done(null, result);
            worker[kTaskInfo] = null;
            _this._freeWorkers.push(worker);
            _this.emit(kWorkerFreedEvent);
        });
        worker.on('error', function workerError(err) {
            // In case of an uncaught exception: Call the callback that was passed to
            // `runTask` with the error.
            if (worker[kTaskInfo]) {
                worker[kTaskInfo].done(err, null);
            } else {
                _this.emit(BlockingThreadPool.EVENT_WORKER_EXIT, err, worker.threadId,);
            }
            // Remove the worker from the list and start a new Worker to replace the
            // current one.
            _this._workers.splice(this._workers.indexOf(worker), 1);
            _this._createWorker();
        });
        worker.on('exit', function workerExit(code) {
            _this.emit(BlockingThreadPool.EVENT_WORKER_EXIT, code, worker.threadId);
        });
        worker.on('online', function workerOnline() {
            _this.emit(BlockingThreadPool.EVENT_WORKER_ONLINE, worker.threadId);
        });
        this._workers.push(worker);
        this._freeWorkers.push(worker);
        this.emit(kWorkerFreedEvent);
    }

    send({data, transferList, callback = function() {}}) {
        if (this._freeWorkers.length === 0) {
            // No free threads, wait until a worker thread becomes free.
            this._pendingTasks.push({ data, transferList, callback });
            return;
        }

        const worker = this._freeWorkers.pop();
        worker[kTaskInfo] = new WorkerPoolTaskInfo(callback);
        worker.postMessage(data, transferList);
    }

    destroy() {
        for (const worker of this._workers) {
            worker.terminate();
        }
        this._workers = [];
        this._freeWorkers = [];
        this._pendingTasks = [];
    }
}
BlockingThreadPool.EVENT_WORKER_ERROR = 'worker_error';
BlockingThreadPool.EVENT_NEW_MESSAGE = 'new_message';
BlockingThreadPool.EVENT_WORKER_EXIT = 'worker_exit';
BlockingThreadPool.EVENT_WORKER_ONLINE = 'worker_online';
module.exports = BlockingThreadPool;