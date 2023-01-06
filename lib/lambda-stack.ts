import {CfnOutput, RemovalPolicy, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {CDKContext} from "./types/types";
import {getFunctionProps} from "./lambda-config";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import {AttributeType, Table} from "aws-cdk-lib/aws-dynamodb";
import {LambdaIntegration} from "aws-cdk-lib/aws-apigateway";

export class LambdaStack extends Stack {

    constructor(scope: Construct, id: string, props: StackProps, context: CDKContext) {
        super(scope, id, props);

        // Create dynamo table
        const dynamoTable = new Table(this, 'integrations-config-table', {
            partitionKey: {
                name: 'itemId',
                type: AttributeType.STRING
            },
            tableName: 'INTEGRATION_CONFIG',

            /**
             *  The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
             * the new table, and it will remain in your account until manually deleted. By setting the policy to
             * DESTROY, cdk destroy will delete the table (even if it has data in it)
             */
            removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
        });

        // Create lambdas for read and write
        const readFunctionProps = getFunctionProps('readHandler', context, dynamoTable.tableName);
        const putFunctionProps = getFunctionProps('putHandler', context, dynamoTable.tableName);

        const readLambda: NodejsFunction = new NodejsFunction(this, "readHandler-function", readFunctionProps);
        const putLambda: NodejsFunction = new NodejsFunction(this, "putHandler-function", putFunctionProps);

        // Add permissions to lambdas to read and write to dynamo
        dynamoTable.grantReadData(readLambda);
        dynamoTable.grantWriteData(putLambda);

        // Create API gateway
        const api = new apigateway.RestApi(this, 'drop-down-api-gateway', {
            restApiName: 'restApi',
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS
            }
        });

        const readIntegration = new LambdaIntegration(readLambda);
        const putIntegration = new LambdaIntegration(putLambda);

        const integrations = api.root.addResource('integrations');
        integrations.addMethod('Get', readIntegration);
        integrations.addMethod('Put', putIntegration);

        // CNF outputs 
        new CfnOutput(this, 'api-gateway', { value: api.url });

        new CfnOutput(this, `${readLambda.node.id}-name`, {
            value: readLambda.functionName,
        });
    }
}
