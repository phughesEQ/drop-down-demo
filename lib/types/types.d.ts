import { DEPLOY_ENV } from '../util/environment';

export type CDKContext = {
    appName: string;
    region: string;
    environment: DEPLOY_ENV;
};
