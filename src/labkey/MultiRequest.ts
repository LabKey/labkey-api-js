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
import { getOnFailure, getOnSuccess, isArray } from './Utils';

/**
 * Make multiple ajax requests and invokes a callback when all are complete.
 * Requests are added as [function, config] array pairs where the config object
 * is passed as the argument to the request function.  The request function's config
 * object argument must accept a success callback named 'success' and a failure
 * callback named 'failure'.
 * @param config Either an array of [function, config] array pairs
 * to be added or a config object with the shape:
 * - listeners: a config object containing event handlers.
 * - requests: an array of [function, config] array pairs to be added.
 *
 * ```
 * var config = {
 *  schemaName : "assay",
 *  queryName : protocolName + " Data",
 *  containerPath : "/Test",
 *  success: function (data, options, response) {
 *      console.log("selectRows success: " + data.rowCount);
 *  },
 *  failure: function (response, options) {
 *      console.log("selectRows failure");
 *  },
 *  scope: scope // scope to execute success and failure callbacks in.
 * };
 *
 * // add the requests and config arguments one by one
 * var multi = new LABKEY.MultiRequest();
 * var requestScope = ... // scope to execute the request function in.
 * multi.add(LABKEY.Query.selectRows, config, requestScope);
 * multi.add(LABKEY.Query.selectRows, config, requestScope);
 * multi.add(LABKEY.Query.selectRows, config, requestScope);
 * multi.send(
 *  function () { console.log("send complete"); },
 *  sendCallbackScope // scope to execute 'send complete' callback in.
 * );
 *
 * // additional requests won't be sent while other requests are in progress
 * multi.add(LABKEY.Query.selectRows, config);
 * multi.send(function () { console.log("send complete"); }, sendCallbackScope);
 *
 * // constructor can take an array of requests [function, config] pairs
 * multi = new LABKEY.MultiRequest([
 *  [ LABKEY.Query.selectRows, config ],
 *  [ LABKEY.Query.selectRows, config ],
 *  [ LABKEY.Query.selectRows, config ]
 * ]);
 * multi.send();
 *
 * // constructor can take a config object with listeners and requests.
 * // if there is a 'done' listener, the requests will be sent immediately.
 * multi = new LABKEY.MultiRequest({
 *  listeners : { 'done': function () { console.log("send complete"); }, scope: sendCallbackScope },
 *  requests : [ [ LABKEY.Query.selectRows, config ],
 *      [ LABKEY.Query.selectRows, config ],
 *      [ LABKEY.Query.selectRows, config ] ]
 *  });
 *
 *  // Alternate syntax for adding the 'done' event listener.
 *  multi = new LABKEY.MultiRequest({
 *      listeners : {
 *          'done': {
 *              fn: function () { console.log("send complete"); }
 *              scope: sendCallbackScope
 *          }
 *      }
 *  });
 * ```
 */
export const MultiRequest = function (config: any) {
    const doneCallbacks: any[] = [];
    const self = this;
    let sending = false;
    let sendQ: any[] = [];
    let waitQ: any[] = [];

    function applyCallback(callback: any, scope: any) {
        if (typeof callback === 'function') {
            doneCallbacks.push({
                fn: callback,
                scope,
            });
        } else if (callback && typeof callback.fn === 'function') {
            doneCallbacks.push({
                fn: callback.fn,
                scope: callback.scope || scope,
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
            const ret = fn1.apply(scope || this || window, arguments);
            fn2.apply(scope || this || window, arguments);
            return ret;
        };
    }

    function fireDone() {
        for (let i = 0; i < doneCallbacks.length; i++) {
            const cb = doneCallbacks[i];
            if (cb.fn && typeof cb.fn === 'function') {
                cb.fn.call(cb.scope || window);
            }
        }
    }

    /**
     * Adds a request to the queue.
     * @param fn {Function} A request function which takes single config object.
     * @param config {Object} The config object that will be passed to the request <code>fn</code>
     * and must contain success and failure callbacks.
     * @param [scope] {Object} The scope in which to execute the request <code>fn</code>.
     * Note that the config success and failure callbacks will execute in the <code>config.scope</code> and not the <code>scope</code> argument.
     * @returns {LABKEY.MultiRequest} this object so add calls can be chained.
     *
     * ```
     * new MultiRequest().add(Ext.Ajax.request, {
     *  url: LABKEY.ActionURL.buildURL("controller", "action1", "/container/path"),
     *  success: function () { console.log("success 1!"); },
     *  failure: function () { console.log("failure 1!"); },
     *  scope: this // The scope of the success and failure callbacks.
     * }).add({Ext.Ajax.request, {
     *  url: LABKEY.ActionURL.buildURL("controller", "action2", "/container/path"),
     *  success: function () { console.log("success 2!"); },
     *  failure: function () { console.log("failure 2!"); },
     *  scope: this // The scope of the success and failure callbacks.
     * }).send(function () { console.log("all done!") });
     * ```
     */
    this.add = function (fn: any, config: any, scope: any) {
        config = config || {};

        let success: any = getOnSuccess(config);
        if (!success) {
            success = function () {};
        }
        if (!success._hookInstalled) {
            config.success = createSequence(success, checkDone, config.scope);
            config.success._hookInstalled = true;
        }

        let failure: any = getOnFailure(config);
        if (!failure) {
            failure = function () {};
        }
        if (!failure._hookInstalled) {
            config.failure = createSequence(failure, checkDone, config.scope);
            config.failure._hookInstalled = true;
        }

        waitQ.push({
            args: [config],
            fn,
            scope,
        });

        return this;
    };

    /**
     * Send the queued up requests. When all requests have returned, the send callback will be called.
     * @param callback
     * @param scope
     */
    this.send = function (callback: any, scope: any) {
        if (sending || waitQ.length === 0) {
            return;
        }

        sending = true;
        sendQ = waitQ;
        waitQ = [];

        const len = sendQ.length;
        for (let i = 0; i < len; i++) {
            const q = sendQ[i];
            q.fn.apply(q.scope || window, q.args);
        }

        applyCallback(callback, scope);
    };

    const cfg = config || {};
    let listeners;
    let requests;

    if (isArray(cfg)) {
        requests = cfg;
    } else {
        requests = cfg.requests;
        listeners = cfg.listeners;
    }

    if (requests) {
        for (let i = 0; i < requests.length; i++) {
            const request = requests[i];
            this.add(request[0], request[1]);
        }
    }

    if (listeners && listeners.done) {
        applyCallback(listeners.done, listeners.scope);
    }

    if (waitQ.length && doneCallbacks.length > 0) {
        this.send();
    }

    return this;
};
