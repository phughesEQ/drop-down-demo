#!/usr/bin/env node
import 'source-map-support/register';
import {App} from 'aws-cdk-lib';
import {DEPLOY_ENV} from '../lib/util/environment';
import {LambdaStack} from "../lib/lambda-stack";

const region = 'us-east-1';
const appName = 'drop-down-demo';

const app = new App();

new LambdaStack(
    app,
    appName,
    {},
    {
        appName,
        region,
        environment: DEPLOY_ENV.STAGING,
    }
);
