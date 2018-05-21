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
import { buildURL } from './ActionURL'
import { request } from './Ajax'
import { getCallbackWrapper, getOnFailure, getOnSuccess } from './Utils'

export interface IMsgContent {
    content: string
    type: MsgType
}

/**
 * A utility function to create a message content object used in LABKEY.Message.sendMessage.
 * @param type The content type of this message part
 * @param content The message part content.
 */
export function createMsgContent(type: MsgType, content: string): IMsgContent {
    return {
        content,
        type
    }
}

export interface IPrincipalRecipient {
    principalId: number
    type: RecipientType
}

export function createPrincipalIdRecipient(type: RecipientType, principalId: number): IPrincipalRecipient {
    return {
        principalId,
        type
    }
}

export interface IRecipient {
    address: string
    type: RecipientType
}

/**
 * A utility function to create a recipient object used in LABKEY.Message.sendMessage.
 * @param type Determines where the recipient email address will appear in the message.
 * @param address The email address of the recipient.
 */
export function createRecipient(type: RecipientType, address: string): IRecipient {
    return {
        address,
        type
    }
}

export type MsgType = 'text/plain' | 'text/html';

export interface IMsgTypeCollection {
    [key: string]: MsgType
}

/**
 * A map of the email message body types. Email messages can contain multiple content types allowing a
 * client application the option to display the content it is best suited to handle. A common practice is to
 * include both plain and html body types to allow applications which cannot render html content to display
 * a plain text version.
 */
export const msgType: IMsgTypeCollection = {
    html: 'text/html',
    plain: 'text/plain'
};

export type RecipientType = 'BCC' | 'CC' | 'TO';

export interface IRecipientTypeCollection {
    [key: string]: RecipientType
}

/**
 * A map of the email recipient types.
 */
export const recipientType: IRecipientTypeCollection = {
    bcc: 'BCC',
    cc: 'CC',
    to: 'TO'
};

export interface ISendMessageOptions {
    failure?: () => any
    msgContent?: Array<string>
    msgFrom?: string
    msgRecipients?: Array<string>
    msgSubject?: string
    scope?: any
    success?: () => any
}

/**
 * Sends an email notification message through the LabKey Server. Message recipients and the sender
 * must exist as valid accounts, or the current user account must have permission to send to addresses
 * not associated with a LabKey Server account at the site-level, or an error will be thrown.
 */
export function sendMessage(config: ISendMessageOptions): XMLHttpRequest {

    let jsonData: ISendMessageOptions = {};

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
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}