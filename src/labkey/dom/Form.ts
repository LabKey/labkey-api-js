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
import { loadDOMContext } from './constants'

const { $ } = loadDOMContext();

declare const window: Window;

export interface IFormOptions {
    formElement: any
    showWarningMessage?: boolean
    warningMessage?: string
}

export class Form {

    _isDirty: boolean;
    warningMessage: string;

    constructor(options: IFormOptions) {
        if (!options || !options.formElement) {
            throw 'Invalid config passed to LABKEY.Form constructor! Your config object should have a property named formElement which is the id of your form.';
        }

        let me = this;
        this.warningMessage = options.warningMessage || "Your changes have not yet been saved.";
        this._isDirty = false;

        //register for onchange events on all input elements
        let formEl = $('#' + options.formElement);
        formEl.find(':input').change(() => {
            this.setDirty();
        });

        formEl.submit(() => {
            this.setClean();
        });

        if (options.showWarningMessage !== false) {
            $(window).bind('beforeunload', (e: any) => {
                if (me.isDirty()) {
                    e.returnMessage = this.warningMessage;
                    return this.warningMessage;
                }
            });
        }
    }

    /**
     * Returns true if the form is currently dirty, false otherwise.
     */
    isDirty(): boolean {
        return this._isDirty;
    }

    /**
     * Sets the form's dirty state to clean
     */
    setClean(): void {
        this._isDirty = false;
    }

    /**
     * Sets the form's dirty state to dirty
     */
    setDirty(): void {
        this._isDirty = true;
    }
}