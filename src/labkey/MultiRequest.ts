/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { getOnFailure, getOnSuccess, isArray } from './Utils'

export const MultiRequest = function(config: any) {
    config = config || {};

    let doneCallbacks: Array<any> = [];
    let listeners;
    let requests;
    let self = this;
    let sending = false;
    let sendQ: Array<any> = [];
    let waitQ: Array<any> = [];

    if (isArray(config)) {
        requests = config;
    }
    else {
        requests = config.requests;
        listeners = config.listeners;
    }

    if (requests) {
        for (let i = 0; i < requests.length; i++) {
            let request = requests[i];
            this.add(request[0], request[1]);
        }
    }

    if (listeners && listeners.done) {
        applyCallback(listeners.done, listeners.scope);
    }

    if (waitQ.length && doneCallbacks.length > 0) {
        this.send();
    }
    
    function applyCallback(callback: any, scope: any) {
        if (typeof callback == 'function') {
            doneCallbacks.push({
                fn: callback,
                scope
            });
        }
        else if (typeof callback.fn == 'function') {
            doneCallbacks.push({
                fn: callback.fn,
                scope: callback.scope || scope
            });
        }
    }

    function checkDone() {
        sendQ.pop();
        if (sendQ.length == 0) {
            sending = false;
            fireDone();
            self.send();
        }
        return true;
    }

    function createSequence(fn1: any, fn2: any, scope: any) {
        return function () {
            let ret = fn1.apply(scope || this || window, arguments);
            fn2.apply(scope || this || window, arguments);
            return ret;
        }
    }

    function fireDone() {
        for (let i = 0; i < doneCallbacks.length; i++) {
            let cb = doneCallbacks[i];
            if (cb.fn && typeof cb.fn == 'function') {
                cb.fn.call(cb.scope || window);
            }
        }
    }

    /**
     * Adds a request to the queue.
     * @param fn
     * @param config
     * @param scope
     */
    this.add = function(fn: any, config: any, scope: any) {
        config = config || {};

        let success: any = getOnSuccess(config);
        if (!success) {
            success = function(){};
        }
        if (!success._hookInstalled) {
            config.success = createSequence(success, checkDone, config.scope);
            config.success._hookInstalled = true;
        }

        let failure: any = getOnFailure(config);
        if (!failure) {
            failure = function(){};
        }
        if (!failure._hookInstalled) {
            config.failure = createSequence(failure, checkDone, config.scope);
            config.failure._hookInstalled = true;
        }

        waitQ.push({
            args: [config],
            fn,
            scope
        });

        return this;
    };

    /**
     * Send the queued up requests. When all requests have returned, the send callback will be called.
     * @param callback
     * @param scope
     */
    this.send = function(callback: any, scope: any) {
        if (sending || waitQ.length === 0) {
            return;
        }

        sending = true;
        sendQ = waitQ;
        waitQ = [];

        let len = sendQ.length;
        for (let i = 0; i < len; i++) {
            let q = sendQ[i];
            q.fn.apply(q.scope || window, q.args);
        }

        applyCallback(callback, scope);
    };
};