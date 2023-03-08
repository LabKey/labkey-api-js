/*
 * Copyright (c) 2017-2018 LabKey Corporation
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
import { buildURL } from './ActionURL';
import { request } from './Ajax';
import { getCallbackWrapper, getOnFailure, getOnSuccess, RequestCallbackOptions } from './Utils';

export interface IMsgContent {
    content: string;
    type: MsgType;
}

/**
 * A utility function to create a message content object used in {@link sendMessage}.
 * @param type The content type of this message part
 * @param content The message part content.
 */
export function createMsgContent(type: MsgType, content: string): IMsgContent {
    return {
        content,
        type,
    };
}

export interface IPrincipalRecipient {
    principalId: number;
    type: RecipientType;
}

/**
 * A utility function to create a recipient object (based on a user ID or group ID) used in {@link sendMessage}.
 * Note: only server side validation or transformation scripts can specify a user or group ID.
 * @param type Determines where the recipient email address will appear in the message.
 * @param principalId The user or group id of the recipient.
 */
export function createPrincipalIdRecipient(type: RecipientType, principalId: number): IPrincipalRecipient {
    return {
        principalId,
        type,
    };
}

export interface IRecipient {
    address: string;
    type: RecipientType;
}

/**
 * A utility function to create a recipient object used in {@link sendMessage}.
 * @param type Determines where the recipient email address will appear in the message.
 * @param address The email address of the recipient.
 */
export function createRecipient(type: RecipientType, address: string): IRecipient {
    return {
        address,
        type,
    };
}

export type MsgType = 'text/plain' | 'text/html';

export interface IMsgTypeCollection {
    [key: string]: MsgType;
}

/**
 * A map of the email message body types. Email messages can contain multiple content types allowing a
 * client application the option to display the content it is best suited to handle. A common practice is to
 * include both plain and html body types to allow applications which cannot render html content to display
 * a plain text version.
 */
export const msgType: IMsgTypeCollection = {
    html: 'text/html',
    plain: 'text/plain',
};

export type RecipientType = 'BCC' | 'CC' | 'TO';

export interface IRecipientTypeCollection {
    [key: string]: RecipientType;
}

/**
 * A map of the email recipient types.
 */
export const recipientType: IRecipientTypeCollection = {
    bcc: 'BCC',
    cc: 'CC',
    to: 'TO',
};

export interface ISendMessageOptions extends RequestCallbackOptions {
    /**
     * An array of content objects which have the following properties:
     * - type: the message content type, must be one of the values from: {@link msgType}.
     * - content: the email message body for this content type.
     *
     * The utility function {@link createMsgContent} can be used to help create these objects.
     */
    msgContent?: string[];
    /** The email address that appears on the email from line. */
    msgFrom?: string;
    /**
     * An array of recipient objects which have the following properties:
     * - type: the recipient type, must be one of the values from: {@link recipientType}.
     * - address: the email address of the recipient.
     *
     * The utility function {@link createRecipient} can be used to help create these objects.
     * Recipients whose accounts have been deactivated or have never been logged into will be silently dropped from
     * the message.
     */
    msgRecipients?: string[];
    /** The value that appears on the email subject line. */
    msgSubject?: string;
}

/**
 * Sends an email notification message through the LabKey Server. Message recipients and the sender
 * must exist as valid accounts, or the current user account must have permission to send to addresses
 * not associated with a LabKey Server account at the site-level, or an error will be thrown.
 *
 * Recipients whose accounts have been deactivated or have never been logged into will be silently dropped from
 * the message.
 *
 * ```js
 * function errorHandler(errorInfo, responseObj){
 *  LABKEY.Utils.displayAjaxErrorResponse(responseObj, errorInfo);
 * }
 *
 * function onSuccess(result){
 *  alert('Message sent successfully.');
 * }
 *
 * LABKEY.Message.sendMessage({
 *  msgFrom: 'admin@test.com',
 *  msgSubject: 'Testing email API...',
 *  msgRecipients: [
 *      LABKEY.Message.createRecipient(LABKEY.Message.recipientType.to, 'user1@test.com'),
 *      LABKEY.Message.createRecipient(LABKEY.Message.recipientType.cc, 'user2@test.com'),
 *      LABKEY.Message.createRecipient(LABKEY.Message.recipientType.cc, 'user3@test.com'),
 *      LABKEY.Message.createRecipient(LABKEY.Message.recipientType.bcc, 'user4@test.com')
 *  ],
 *  msgContent: [
 *      LABKEY.Message.createMsgContent(LABKEY.Message.msgType.html, '<h2>This is a test message</h2>'),
 *      LABKEY.Message.createMsgContent(LABKEY.Message.msgType.plain, 'This is a test message')
 *  ],
 *  success: onSuccess,
 *  failure: errorHandler,
 * });
 * ```
 */
export function sendMessage(config: ISendMessageOptions): XMLHttpRequest {
    const jsonData: ISendMessageOptions = {};

    if (config.msgFrom != undefined) {
        jsonData.msgFrom = config.msgFrom;
    }
    if (config.msgRecipients != undefined) {
        jsonData.msgRecipients = config.msgRecipients;
    }
    if (config.msgContent != undefined) {
        jsonData.msgContent = config.msgContent;
    }
    if (config.msgSubject != undefined) {
        jsonData.msgSubject = config.msgSubject;
    }

    return request({
        url: buildURL('announcements', 'sendMessage.api'),
        method: 'POST',
        jsonData,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}
