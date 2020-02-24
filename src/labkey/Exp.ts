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
import { request, RequestOptions } from './Ajax'
import { ExtendedXMLHttpRequest, getCallbackWrapper, getOnFailure, getOnSuccess } from './Utils'
import {create, DomainDesign, get, getDomainDetails, KINDS} from './Domain'

/**
 * The experiment object base class which describes basic characteristics of a protocol
 * or an experimental run. Many experiment classes (such as [[Run]], [[Data]], and [[Material]])
 * are subclasses of ExpObject, so they provide the fields defined by this object (e.g., name, lsid, etc).
 */
export class ExpObject {

    /**
     * User editable comment.
     */
    comment: string;

    /**
     * The person who created the ExpObject.
     */
    created: Date;

    /**
     * The person who created the ExpObject.
     */
    createdBy: string;

    /**
     * The id of the ExpObject
     */
    id: number;

    /**
     * The LSID of the ExpObject
     */
    lsid: string;

    /**
     * When the ExpObject was last modified.
     */
    modified: Date;

    /**
     * The person who last modified the ExpObject.
     */
    modifiedBy: string;

    /**
     * The name of the ExpObject
     */
    name: string;

    /**
     * Map of property descriptor names to values. Most types, such as strings and
     * numbers, are just stored as simple properties. Properties of type FileLink will be returned by the server in the
     * same format as [[Data]] objects (missing many properties such as id and createdBy if they exist on disk
     * but have no row with metadata in the database). FileLink values are accepted from the client in the same way,
     * or a simple value of the following three types: the data's RowId, the data's LSID, or the full path
     * on the server's file system.
     */
    properties: {[key: string]: any};

    /**
     * The id of the ExpObject (alias of id property)
     */
    rowId: number;

    constructor(config: Partial<ExpObject> = {}) {
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

export interface IGetExpObjectDomain {
    /**
     * The container path in which the requested Domain is defined.
     * If not supplied, the current container path will be used.
     */
    containerPath?: string

    /**
     * Function called if execution of the "getDomain" function fails.
     */
    failure?: () => any

    /**
     * Function called if the "getDomain" function executes successfully.
     * Will be called with the domain object as returned by [[get|Domain.get]]
     * which describes the fields of a domain.
     */
    success: (domain?: any) => any
}

export interface ICreateDataClassDomain {
    /**
     * The container path in which to create the domain.
     */
    containerPath?: string

    /**
     * The domain design to save.
     */
    domainDesign: DomainDesign

    /**
     * Function called if execution of the "getDomain" function fails.
     */
    failure?: () => any

    /**
     * Set of extra options used when creating the SampleSet.
     */
    options?: any

    /**
     * Function called if the "getDomain" function executes successfully.
     * Will be called with the domain object as returned by [[get|Domain.get]]
     * which describes the fields of a domain.
     */
    success: (domain?: any) => any
}

/**
 * DataClass represents a set of ExpData objects that share a set of properties.
 * This class defines the set of fields that you you wish to attach to all datas in the group.
 * Within the DataClass, each Data has a unique name.
 */
export class DataClass extends ExpObject {

    /**
     * Description of the DataClass.
     */
    description: string;

    /**
     * Optional name expression used to generate unique names for ExpData inserted into the DataClass.
     */
    nameExpression: string;

    /**
     * The optional SampleSet the DataClass is associated with.
     */
    sampleSet: ExpMaterialSampleSet;

    constructor(config: Partial<DataClass> = {}) {
        super(config);
        config = config || {};

        this.description = config.description;
        this.sampleSet = config.sampleSet;
    }

    /**
     * Create a new DataClass definition.
     * @param options
     * @hidden
     */
    static create(options: ICreateDataClassDomain): void {
        create({
            containerPath: options.containerPath,
            domainDesign: options.domainDesign,
            // err, this says "type" in Experiment.js, however, I don't believe "type" is a supported property.
            // I assume it is attempting to match to "kind" which would be "DataClass" to create a DataClassDomainKind.
            kind: 'DataClass',
            options: options.options,
            success: getOnSuccess(options) as any,
            failure: getOnFailure(options) as any
        });
    }

    /**
     * Get a domain design for the DataClass. See [[get|Domain.get]].
     * @param options
     * @hidden
     *
     * #### Examples
     *
     * ```js
     * var dc = new LABKEY.Exp.DataClass({name: 'MyDataClass'});
     * dc.getDomain({
     *     success: function(domain) {
     *         // access the retrieved DataClass domain object.
     *         console.log(domain);
     *     }
     * });
     * ```
     */
    getDomain(options: IGetExpObjectDomain): void {
        get({
            schemaName: 'exp.data',
            queryName: this.name,
            containerPath: options.containerPath,
            success: getOnSuccess(options) as any,
            failure: getOnFailure(options) as any
        });
    }
}

/**
 * Internal configuration object. Not intended to be instantiated directly.
 * If anyone is using this we should really ask them why -- it was never hooked up.
 * @hidden
 * @private
 */
export class ChildObject extends ExpObject {

    constructor(config: Partial<ChildObject> = {}) {
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

    constructor(config: Partial<ProtocolApplication> = {}) {
        super(config);
    }
}

/**
 * Internal configuration object. Not intended to be instantiated directly.
 * @hidden
 * @private
 */
export class RunItem extends ExpObject {

    cpasType: string;
    run: any;
    sourceApplications: any;
    sourceProtocol: any;
    sucessorRuns: any;
    targetApplications: any;

    constructor(config: Partial<RunItem> = {}) {
        super(config);

        this.cpasType = config.cpasType;
        this.run = config.run;
        this.sourceApplications = config.sourceApplications;
        this.sourceProtocol = config.sourceProtocol;
        this.sucessorRuns = config.sucessorRuns;
        this.targetApplications = config.targetApplications;
    }
}

/**
 * Available options for [[Data.getContent|LABKEY.Exp.Data.getContent()]]
 */
export interface IGetContentOptions {
    /**
     * A reference to a function to call when an error occurs.
     */
    failure?: (errorInfo?: any, response?: ExtendedXMLHttpRequest, options?: RequestOptions) => any

    /**
     * How to format the content. Defaults to plaintext, supported for text/* MIME types,
     * including .html, .xml, .tsv, .txt, and .csv. Use 'jsonTSV' to get a JSON version of the .xls, .tsv, .or .csv
     * files, the structure of which matches the argument to convertToExcel
     */
    format?: string

    /**
     * A scoping object for the success and failure callback functions (default to this).
     */
    scope?: any

    /**
     * The function to call when the function finishes successfully.
     */
    success: (content?: any, format?: string, response?: ExtendedXMLHttpRequest) => any
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
export class Data extends ExpObject {

    /**
     * The DataClass the data belongs to.
     */
    dataClass: ExpDataDataClass;

    /**
     * The local file url of the uploaded file.
     */
    dataFileURL: string;

    /**
     * TODO: Describe dataType. Possibly no longer supported.
     */
    dataType: string;

    /**
     * Path relative to pipeline root.
     */
    pipelinePath: string;

    /**
     * The role designation for this data.
     */
    role: string;

    constructor(config: Partial<Data> = {}) {
        super(config);

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

    /**
     * Retrieves the contents of the data object from the server.
     * @param options
     *
     * #### Examples
     *
     * An example of the results for a request for 'jsonTsv' format:
     * ```js
     * {
     *     "filename": "SimpleExcelFile.xls",
     *     "sheets": [
     *         {
     *             "name": "Sheet1",
     *             "data": [
     *                 "StringColumn",
     *                 "DateColumn"
     *             ],[
     *                 "Hello",
     *                 "16 May 2009 17:00:00"
     *             ],[
     *                 "world",
     *                 "12/21/2008 08:45AM"
     *             ]
     *         },{
     *             "name": "Sheet2",
     *             "data": [
     *                 ["NumberColumn"],
     *                 [55.44],
     *                 [100.34],
     *                 [-1]
     *             ]
     *         },{
     *             "name": "Sheet3",
     *             "data": []
     *         }
     *     ]
     * }
     * ```
     *
     * An example of the same file in the 'jsonTSVExtended' format:
     *
     * ```js
     * {
     *     "filename": "SimpleExcelFile.xls",
     *     "sheets": [
     *         {
     *             "name": "Sheet1",
     *             "data": [
     *                 {
     *                     "value": "StringColumn",
     *                     "formattedValue": "StringColumn"
     *                 },{
     *                     "value": "DateColumn",
     *                     "formattedValue": "DateColumn"
     *                 }
     *             ],[
     *                 {
     *                     "value": "Hello",
     *                     "formattedValue": "Hello"
     *                 },{
     *                     "formatString": "MMMM d, yyyy",
     *                     "value": "16 May 2009 17:00:00",
     *                     "timeOnly": false,
     *                     "formattedValue": "May 17, 2009"
     *                 }
     *             ],[
     *                 {
     *                     "value": "world",
     *                     "formattedValue": "world"
     *                 },{
     *                     "formatString": "M/d/yy h:mm a",
     *                     "value": "21 Dec 2008 19:31:00",
     *                     "timeOnly": false,
     *                     "formattedValue": "12/21/08 7:31 PM"
     *                 }
     *             ]
     *         },{
     *             "name": "Sheet2",
     *             "data": [
     *                 [{
     *                     "value": "NumberColumn",
     *                     "formattedValue": "NumberColumn"
     *                 }],[{
     *                     "formatString": "$#,##0.00",
     *                     "value": 55.44,
     *                     "formattedValue": "$55.44"
     *                 }],[{
     *                     "value": 100.34,
     *                     "formattedValue": "100.34"
     *                 }],[{
     *                     "value": -1,
     *                     "formattedValue": "-1"
     *                 }]
     *             ]
     *         },{
     *             "name": "Sheet3",
     *             "data": []
     *         }
     *     ]
     * }
     * ```
     */
    getContent(options: IGetContentOptions): void {
        // NK: I'm choosing to not implement this call to "alert". There are plenty of places where we
        // "require" arguments and fail less gracefully. In this case, not supplying a success just means the call
        // is useless but I think a user of this API will quickly come to realize that they need to get access
        // to the object somehow and investigate further.

        // if (getOnSuccess(options)) {
        //     alert('Error', 'You must specify a callback function in config.success when calling LABKEY.Exp.Data.getContent()');
        // }

        function getSuccessCallbackWrapper(success: Function, format: string, scope: any) {
            return getCallbackWrapper((json: any, response: ExtendedXMLHttpRequest) => {
                if (success) {
                    success.call(scope || this, json, format, response);
                }
            });
        }

        // note, does not return request
        request({
            url: buildURL('experiment', 'showFile'),
            method: 'GET',
            params: {
                format: options.format,
                rowId: this.id
            },
            success: getSuccessCallbackWrapper(getOnSuccess(options), options.format, options.scope),
            failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
        });
    }
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
export class Run extends ExpObject {

    /**
     * Array of [[Data]] objects that are the inputs to this run.
     * Datas typically represents a file on the server's file system.
     */
    dataInputs: Array<Data>;

    /**
     * Array of [[Data]] objects that are the outputs from this run.
     * Datas typically represent a file on the server's file system.
     */
    dataOutputs: Array<Data>;

    /**
     * Array of Objects where each Object corresponds to a row in the results domain.
     */
    dataRows: Array<any>;
    experiments: any;
    filePathRoot: string;
    materialInputs: Array<Material>;
    materialOutputs: Array<Material>;
    objectProperties: any;
    protocol: any;

    constructor(config: Partial<Run> = {}) {
        super(config);

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

export class RunGroup extends ExpObject {

    batchProtocolId?: number;
    hidden?: boolean;
    runs?: Array<Run>;

    constructor(config: Partial<RunGroup> = {}) {
        super(config);

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

/**
 * The Exp.Material class describes an experiment material. "Material" is a synonym for both
 * "sample" and "specimen". Thus, for example, the input to an assay could be called a material.
 * The fields of this class are inherited from [[ExpObject]] and the private [[RunItem]] object.
 */
export class Material extends RunItem {

    /**
     * The SampleSet the material belongs to.
     */
    sampleSet: ExpMaterialSampleSet;

    constructor(config: Partial<Material> = {}) {
        super(config);

        this.sampleSet = config.sampleSet;
    }
}

/**
 * Internal configuration object. Not intended to be instantiated directly.
 * @hidden
 * @private
 */
export class Protocol extends ExpObject {

    applicationType: any;
    childProtocols: Array<any>;
    contact: any;
    description: string;
    instrument: any;
    runs: Array<Run>;
    software: any;
    steps: Array<any>;

    constructor(config: Partial<Protocol> = {}) {
        super(config);

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

export interface ICreateSampleSetDomain {
    /**
     * The container path in which to create the domain.
     */
    containerPath?: string

    /**
     * The domain design to save.
     */
    domainDesign: DomainDesign

    /**
     * Function called if execution of the "getDomain" function fails.
     */
    failure?: () => any

    /**
     * Set of extra options used when creating the SampleSet.
     */
    options?: {
        /**
         * Array of indexes into the domain design fields. If the domain design contains a 'Name' field,
         * no idCols are allowed. Either a 'Name' field must be present or at least one idCol must be supplied.
         */
        idCols?: Array<string>

        /**
         * Index of the parent id column.
         */
        parentCol?: string
    }

    /**
     * Function called if the "getDomain" function executes successfully.
     * Will be called with the domain object as returned by [[get|Domain.get]]
     * which describes the fields of a domain.
     */
    success: (domain?: any) => any
}

/**
 * The SampleSet class describes a collection of experimental samples, which are
 * also known as materials (see [[Material]]). This class defines the set of fields that
 * you you wish to attach to all samples in the group. These fields supply characteristics of the sample
 * (e.g., its volume, number of cells, color, etc.). For more information see
 * [additional documentation](https://www.labkey.org/Documentation/wiki-page.view?name=experiment).
 */
export class SampleSet extends ExpObject {

    /**
     * Description of the SampleSet.
     */
    description: string;

    /**
     * Array of Exp.Material config objects.
     */
    samples: Array<Material>;

    constructor(config: Partial<SampleSet> = {}) {
        super(config);

        this.description = config.description;
        this.samples = config.samples;
    }

    /**
     * Create a new Sample Set definition.
     * @param options
     * @hidden
     *
     * #### Examples
     *
     * ```js
     * var domainDesign = {
     *     name: "BoyHowdy',
     *     description: "A client api created sample set",
     *     fields: [{
     *         name: "TestName",
     *         label: "The First Field",
     *         rangeURI: "http://www.w3.org/2001/XMLSchema#string"
     *     },{
     *         name: "Num",
     *         rangeURI: "http://www.w3.org/2001/XMLSchema#int"
     *     },{
     *         name: "Parent",
     *         rangeURI: "http://www.w3.org/2001/XMLSchema#string"
     *     }]
     * };
     *
     * LABKEY.Exp.SampleSet.create({
     *     domainDesign: domainDesign,
     *     options: { idCols: [0, 1], parentCol: 2 },
     *     success: function () { alert("success!"); },
     *     failure: function () { alert("failure!"); },
     * });
     * ```
     */
    static create(options: ICreateSampleSetDomain): void {
        create({
            containerPath: options.containerPath,
            domainDesign: options.domainDesign,
            kind: KINDS.SAMPLE_TYPE,
            options: options.options,
            success: getOnSuccess(options) as any,
            failure: getOnFailure(options) as any
        });
    }

    /**
     * Get a domain design for the SampleSet. See [[get|Domain.get]].
     * @param options
     * @hidden
     * @deprecated Use [[getDomain|Domain.getDomain]]
     *
     * #### Examples
     *
     * ```js
     * var ss = new LABKEY.Exp.SampleSet({name: 'MySampleSet'});
     * ss.getDomain({
     *     success: function(domain) {
     *         // access the retrieved SampleSet domain object.
     *         console.log(domain);
     *     }
     * });
     * ```
     */
    getDomain(options: IGetExpObjectDomain): void {
        get({
            schemaName: 'Samples',
            queryName: this.name,
            containerPath: options.containerPath,
            success: getOnSuccess(options) as any,
            failure: getOnFailure(options) as any
        });
    }

    /**
     * Get a domain design for the SampleSet. See [[getDomainDetails|Domain.getDomainDetails]].
     * @param options
     * @hidden
     *
     * #### Examples
     *
     * ```js
     * var ss = new LABKEY.Exp.SampleSet({name: 'MySampleSet'});
     * ss.getDomain({
     *     success: function(domain) {
     *         // access the retrieved SampleSet domain object.
     *         console.log(domain);
     *     }
     * });
     * ```
     */
    getDomainDetails(options: IGetExpObjectDomain): void {
        getDomainDetails({
            schemaName: 'Samples',
            queryName: this.name,
            containerPath: options.containerPath,
            success: getOnSuccess(options) as any,
            failure: getOnFailure(options) as any
        });
    }
}
