import { request } from './Ajax';
import { buildURL } from './ActionURL';
import { getCallbackWrapper } from './Utils';
import { LabKey, setServerContext } from './constants';

export type LoadServerContextOptions = {
    applyContextGlobally?: boolean;
    containerPath?: string;
};

export function loadServerContext(options: LoadServerContextOptions): Promise<LabKey> {
    return new Promise((resolve, reject) => {
        request({
            url: buildURL('project', 'context.api', options?.containerPath),
            method: 'POST',
            success: getCallbackWrapper((context: LabKey) => {
                if (options?.applyContextGlobally) {
                    setServerContext(context);
                }
                resolve(context);
            }),
            failure: getCallbackWrapper(
                (error: any) => {
                    reject(error);
                },
                undefined,
                true
            ),
        });
    });
}
