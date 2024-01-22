import { request } from './Ajax';
import { buildURL } from './ActionURL';
import { getCallbackWrapper } from './Utils';
import { LabKey, setServerContext } from './constants';

export type LoadServerContextOptions = {
    applyContext?: boolean;
    containerPath?: string;
};

export async function loadServerContext(options: LoadServerContextOptions): Promise<LabKey> {
    return new Promise((resolve, reject) => {
        request({
            url: buildURL('project', 'context.api', options?.containerPath),
            method: 'POST',
            success: getCallbackWrapper((context: LabKey) => {
                if (options?.applyContext !== false) {
                    setServerContext(context);
                }
                resolve(context);
            }),
            failure: getCallbackWrapper((error: any) => {
                reject(error);
            }, undefined, true),
        });
    });
}