/*
 * Copyright (c) 2019 LabKey Corporation
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
import { buildURL } from './ActionURL'
import { request } from './Ajax'
import { getCallbackWrapper, getOnFailure, getOnSuccess } from './Utils'
import { get as getDomain } from './Domain'

export interface IExpObject {
    /**
     * User editable comment.
     */
    comment: string

    /**
     * When the ExpObject was created.
     */
    created: Date

    /**
     * The person who created the ExpObject.
     */
    createdBy: string

    /**
     * The id of the ExpObject
     */
    id: number

    /**
     * The LSID of the ExpObject
     */
    lsid: string

    /**
     * When the ExpObject was last modified.
     */
    modified: Date

    /**
     * The person who last modified the ExpObject.
     */
    modifiedBy: string

    /**
     * The name of the ExpObject
     */
    name: string

    /**
     * Map of property descriptor names to values. Most types, such as strings and
     * numbers, are just stored as simple properties. Properties of type FileLink will be returned by the server in the
     * same format as [[Data]] objects (missing many properties such as id and createdBy if they exist on disk
     * but have no row with metadata in the database). FileLink values are accepted from the client in the same way,
     * or a simple value of the following three types: the data's RowId, the data's LSID, or the full path
     * on the server's file system.
     */
    properties: {[key: string]: any}

    /**
     * The id of the ExpObject (alias of id property)
     */
    rowId: number
}

/**
 * The experiment object base class which describes basic characteristics of a protocol
 * or an experimental run. Many experiment classes (such as [[Run]], [[Data]], and [[Material]])
 * are subclasses of ExpObject, so they provide the fields defined by this object (e.g., name, lsid, etc).
 */
export class ExpObject implements IExpObject {

    comment: string;
    created: Date;
    createdBy: string;
    id: number;
    lsid: string;
    modified: Date;
    modifiedBy: string;
    name: string;
    properties: {[key: string]: any};
    rowId: number;

    constructor(config: Partial<IExpObject>) {
        config = config || {};
        this.lsid = config.lsid;
        this.name = config.name;
        this.id = config.id || config.rowId;
        this.rowId = this.id;
        this.comment = config.comment;
        this.created = config.created;
        this.createdBy = config.createdBy;
        this.modified = config.modified;
        this.modifiedBy = config.modifiedBy;
        this.properties = config.properties || {};
    }
}

/**
 * Internal configuration object. Not intended to be instantiated directly.
 * If anyone is using this we should really ask them why -- it was never hooked up.
 * @hidden
 * @private
 */
export class ChildObject extends ExpObject {

    constructor(config: Partial<IExpObject>) {
        super(config);
    }
}

/**
 * Internal configuration object. Not intended to be instantiated directly.
 * If anyone is using this we should really ask them why -- it was never hooked up.
 * @hidden
 * @private
 */
export class ProtocolApplication extends ExpObject {

    constructor(config: Partial<IExpObject>) {
        super(config);
    }
}

export interface IRunItem extends IExpObject {
    cpasType: string
    run: any
    sourceApplications: any
    sourceProtocol: any
    sucessorRuns: any
    targetApplications: any
}

/**
 * Internal configuration object. Not intended to be instantiated directly.
 * @hidden
 * @private
 */
export class RunItem extends ExpObject implements IRunItem {

    cpasType: string;
    run: any;
    sourceApplications: any;
    sourceProtocol: any;
    sucessorRuns: any;
    targetApplications: any;

    constructor(config: Partial<IRunItem>) {
        super(config);
        config = config || {};

        this.cpasType = config.cpasType;
        this.run = config.run;
        this.sourceApplications = config.sourceApplications;
        this.sourceProtocol = config.sourceProtocol;
        this.sucessorRuns = config.sucessorRuns;
        this.targetApplications = config.targetApplications;
    }
}

export type ExpDataDataClass = {
    /**
     * The row id of the DataClass.
     */
    id: number

    /**
     * The name of the DataClass.
     */
    name: string
};

export interface IExpData extends IExpObject {
    /**
     * The DataClass the data belongs to.
     */
    dataClass: ExpDataDataClass

    /**
     * The local file url of the uploaded file.
     */
    dataFileURL: string

    /**
     * TODO: Describe dataType
     */
    dataType: string

    /**
     * TODO: Describe pipelinePath
     */
    pipelinePath: string

    /**
     * TODO: Describe role and determine type
     */
    role: any
}

/**
 * The Exp.Data class describes the data input or output of a [[Run]]. This typically
 * corresponds to an assay results file uploaded to the LabKey server. To create an Exp.Data object, upload
 * a file using to the "assayFileUpload" action of the "assay" controller.
 *
 * #### Examples
 * TODO: UPDATE THIS EXAMPLE! Will not work as written
 * To perform a file upload over HTTP:
 *
 * ```html
 * <form id="upload-run-form" enctype="multipart/form-data" method="POST">
 *     <div id="upload-run-button"></div>
 * </form>
 * <script type="text/javascript">
 *     LABKEY.Utils.requiresScript("FileUploadField.js");
 *     Ext.onReady(function() {
 *        var form = new Ext.form.BasicForm(
 *        Ext.get("upload-run-form"), {
 *           fileUpload: true,
 *           frame: false,
 *           // Optional - specify a protocolId so that the Exp.Data object is assigned the related LSID namespace.
 *           url: LABKEY.ActionURL.buildURL("assay", "assayFileUpload", undefined, { protocolId: 50 }),
 *           listeners: {
 *              actioncomplete : function (form, action) {
 *                 alert('Upload successful!');
 *                 var data = new LABKEY.Exp.Data(action.result);
 *
 *                 // now add the data as a dataInput to a LABKEY.Exp.Run
 *                 var run = new LABKEY.Exp.Run();
 *                 run.name = data.name;
 *                 run.dataInputs = [ data ];
 *
 *                 // add the new run to a LABKEY.Exp.Batch object and
 *                 // fetch the parsed file contents from the data object
 *                 // using the LABKEY.Exp.Data#getContent() method.
 *              },
 *              actionfailed: function (form, action) {
 *                 alert('Upload failed!');
 *              }
 *           }
 *        });
 *
 *        var uploadField = new Ext.form.FileUploadField({
 *           id: "upload-run-field",
 *           renderTo: "upload-run-button",
 *           buttonText: "Upload Data...",
 *           buttonOnly: true,
 *           buttonCfg: { cls: "labkey-button" },
 *           listeners: {
 *              "fileselected": function (fb, v) {
 *                 form.submit();
 *              }
 *           }
 *        });
 *     });
 * </script>
 * ```
 *
 * Or, to upload the contents of a JavaScript string as a file:
 *
 * ```js
 * Ext.onReady(function() {
 *  LABKEY.Ajax.request({
 *    url: LABKEY.ActionURL.buildURL("assay", "assayFileUpload"),
 *    params: { fileName: 'test.txt', fileContent: 'Some text!' },
 *    success: function(response, options) {
 *       var data = new LABKEY.Exp.Data(Ext.util.JSON.decode(response.responseText));
 *
 *       // now add the data as a dataInput to a LABKEY.Exp.Run
 *       var run = new LABKEY.Exp.Run();
 *       run.name = data.name;
 *       run.dataInputs = [ data ];
 *
 *       // add the new run to a LABKEY.Exp.Batch object here
 *    }
 *  });
 * });
 * ```
 */
export class Data extends ExpObject implements IExpData {

    dataClass: ExpDataDataClass;
    dataFileURL: string;
    dataType: string;
    pipelinePath: string;
    role: any;

    constructor(config: Partial<IExpData>) {
        super(config);
        config = config || {};

        this.dataType = config.dataType;
        this.dataFileURL = config.dataFileURL;
        this.dataClass = config.dataClass;
        if (config.pipelinePath) {
            this.pipelinePath = config.pipelinePath;
        }
        if (config.role) {
            this.role = config.role;
        }
    }

    getContent() {
        // TODO: ...
    }
}

export interface IExpRun extends IExpObject {
    /**
     * Array of [[Data]] objects that are the inputs to this run.
     * Datas typically represents a file on the server's file system.
     */
    dataInputs: Array<Data>

    /**
     * Array of [[Data]] objects that are the outputs from this run.
     * Datas typically represent a file on the server's file system.
     */
    dataOutputs: Array<Data>

    /**
     * Array of Objects where each Object corresponds to a row in the results domain.
     */
    dataRows: Array<any>

    experiments: any

    filePathRoot: string

    materialInputs: Array<Material>

    materialOutputs: Array<Material>

    objectProperties: any

    protocol: any
}

export interface IDeleteRunOptions {
    /**
     * A reference to a function to call when an error occurs.
     */
    failure?: () => any

    /**
     * A reference to a function to call with the API results.
     */
    success?: () => any
}

/**
 * The Exp.Run class describes an experiment run. An experiment run is an application of an experimental
 * protocol to concrete inputs, producing concrete outputs. In object-oriented terminology, a protocol would be a class
 * while a run would be an instance. For more information see
 * [additional documentation](https://www.labkey.org/Documentation/wiki-page.view?name=experiment).
 *
 * #### Examples
 *
 * ```js
 * var result = // ... result of uploading a new assay results file
 * var data = new LABKEY.Exp.Data(result);
 *
 * var run = new LABKEY.Exp.Run();
 * run.name = data.name;
 * run.properties = { "MyRunProperty" : 3 };
 * run.dataInputs = [ data ];
 *
 * data.getContent({
 *   format: 'jsonTSV',
 *   success: function (content, format) {
 *     data.content = content;
 *     var sheet = content.sheets[0];
 *     var filedata = sheet.data;
 *
 *     // transform the file content into the dataRows array used by the run
 *     run.dataRows = [];
 *     for (var i = 1; i < filedata.length; i++) {
 *       var row = filedata[i];
 *       run.dataRows.push({
 *         "SampleId": row[0],
 *         "DataValue": row[1],
 *         // ... other columns
 *       });
 *     }
 *
 *     var batch = // ... the LABKEY.Exp.RunGroup object
 *     batch.runs.push(run);
 *   },
 *   failure: function (error, format) {
 *     alert("error: " + error);
 *   }
 * });
 * ```
 */
export class Run extends ExpObject implements IExpRun {

    dataInputs: Array<Data>;
    dataOutputs: Array<Data>;
    dataRows: Array<any>;
    experiments: any;
    filePathRoot: string;
    materialInputs: Array<Material>;
    materialOutputs: Array<Material>;
    objectProperties: any;
    protocol: any;

    constructor(config: Partial<IExpRun>) {
        super(config);
        config = config || {};

        this.experiments = config.experiments || [];
        this.protocol = config.protocol;
        this.filePathRoot = config.filePathRoot;

        this.dataInputs = [];
        if (config.dataInputs) {
            for (let i = 0; i < config.dataInputs.length; i++) {
                this.dataInputs.push(new Data(config.dataInputs[i]));
            }
        }

        this.dataOutputs = config.dataOutputs || [];
        this.dataRows = config.dataRows || [];
        this.materialInputs = config.materialInputs || [];
        this.materialOutputs = config.materialOutputs || [];
        this.objectProperties = config.objectProperties || {};
    }

    /**
     * Deletes the run from the database.
     * @param options
     */
    deleteRun(options: IDeleteRunOptions): void {
        request({
            url: buildURL('experiment', 'deleteRun.api'),
            method: 'POST',
            params: {
                runId: this.id
            },
            success: getCallbackWrapper(getOnSuccess(options), this),
            failure: getCallbackWrapper(getOnFailure(options), this, true)
        });
    }
}

export interface IExpRunGroup extends IExpObject {
    batchProtocolId?: number
    hidden?: boolean
    runs?: Array<IExpRun>
}

export class RunGroup extends ExpObject implements IExpRunGroup {

    batchProtocolId?: number;
    hidden?: boolean;
    runs?: Array<IExpRun>;

    constructor(config: Partial<IExpRunGroup>) {
        super(config);

        config = config || {};

        this.batchProtocolId = config.batchProtocolId || 0;
        this.hidden = config.hidden;
        this.runs = [];

        if (config.runs) {
            for (let i = 0; i < config.runs.length; i++) {
                this.runs.push(new Run(config.runs[i]));
            }
        }
    }
}

export type ExpMaterialSampleSet = {
    /**
     * The row id of the SampleSet.
     */
    id: number

    /**
     * The name of the SampleSet.
     */
    name: string
};

export interface IExpMaterial extends IRunItem {

    /**
     * The SampleSet the material belongs to.
     */
    sampleSet: ExpMaterialSampleSet
}

/**
 * The Exp.Material class describes an experiment material. "Material" is a synonym for both
 * "sample" and "specimen". Thus, for example, the input to an assay could be called a material.
 * The fields of this class are inherited from [[ExpObject]] and the private [[RunItem]] object.
 */
export class Material extends RunItem implements IExpMaterial {

    sampleSet: ExpMaterialSampleSet;

    constructor(config: Partial<IExpMaterial>) {
        super(config);
        config = config || {};

        this.sampleSet = config.sampleSet;
    }
}

export interface IExpProtocol extends IExpObject {
    applicationType: any
    childProtocols: Array<any>
    contact: any
    description: string
    instrument: any
    runs: Array<IExpRun>
    software: any
    steps: Array<any>
}

/**
 * Internal configuration object. Not intended to be instantiated directly.
 * @hidden
 * @private
 */
export class Protocol extends ExpObject implements IExpProtocol {

    applicationType: any;
    childProtocols: Array<any>;
    contact: any;
    description: string;
    instrument: any;
    runs: Array<IExpRun>;
    software: any;
    steps: Array<any>;

    constructor(config: Partial<IExpProtocol>) {
        super(config);
        config = config || {};

        this.applicationType = config.applicationType;
        this.childProtocols = config.childProtocols || [];
        this.contact = config.contact;
        this.description = config.description;
        this.instrument = config.instrument;
        this.runs = [];
        this.software = config.software;
        this.steps = config.steps || [];

        if (config.runs) {
            for (let i = 0; i < config.runs.length; i++) {
                this.runs.push(new Run(config.runs[i]));
            }
        }
    }
}

export interface IExpSampleSet extends IExpObject {
    /**
     * Description of the SampleSet.
     */
    description: string

    /**
     * Array of Exp.Material config objects.
     */
    samples: Array<IExpMaterial>
}

export interface IGetSampleSetDomain {
    containerPath?: string
    failure?: () => any
    success?: () => any
}

/**
 * The SampleSet class describes a collection of experimental samples, which are
 * also known as materials (see [[Material]]). This class defines the set of fields that
 * you you wish to attach to all samples in the group. These fields supply characteristics of the sample
 * (e.g., its volume, number of cells, color, etc.). For more information see
 * [additional documentation](https://www.labkey.org/Documentation/wiki-page.view?name=experiment).
 */
export class SampleSet extends ExpObject implements IExpSampleSet {

    description: string;
    samples: Array<Material>;

    constructor(config: Partial<IExpSampleSet>) {
        super(config);
        config = config || {};

        this.description = config.description;
        this.samples = config.samples;
    }

    /**
     * Get a domain design for the SampleSet. See [[]].
     * // TODO: Copy example
     * @param options
     */
    getDomain(options: IGetSampleSetDomain) {
        getDomain({
            schemaName: 'Samples',
            queryName: this.name,
            containerPath: options.containerPath,
            success: getOnSuccess(options) as any,
            failure: getOnFailure(options) as any
        });
    }
}

// TODO: Next thing to port is LABKEY.Exp.SampleSet.create