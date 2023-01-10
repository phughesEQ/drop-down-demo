import {Duration} from 'aws-cdk-lib';
import {NodejsFunctionProps} from 'aws-cdk-lib/aws-lambda-nodejs';
import {CDKContext} from '../types/types';
import {Runtime} from 'aws-cdk-lib/aws-lambda';

const DEFAULT_LAMBDA_MEMORY_MB = 128;
const DEFAULT_LAMBDA_TIMEOUT_SECONDS = 5;

export const getFunctionProps = (
    lambdaName: string,
    context: CDKContext,
    environmentVariables?: {
        [key: string]: string
    }
): NodejsFunctionProps => {
    return {
        functionName: `${context.appName}-${lambdaName.split('/').pop()}-${context.region}-${context.environment.toString()}`,
        entry: `src/${lambdaName}.ts`,
        handler: lambdaName.split('/').pop(),
        runtime: Runtime.NODEJS_16_X,
        memorySize: DEFAULT_LAMBDA_MEMORY_MB,
        timeout: Duration.seconds(DEFAULT_LAMBDA_TIMEOUT_SECONDS),
        bundling: {minify: true},
        environment: environmentVariables
    };
};
