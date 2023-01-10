import {CfnOutput, RemovalPolicy, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {CDKContext} from "./types/types";
import {getFunctionProps} from "./util/lambda-config";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import {AttributeType, Table} from "aws-cdk-lib/aws-dynamodb";
import {LambdaIntegration} from "aws-cdk-lib/aws-apigateway";
import {StringParameter} from "aws-cdk-lib/aws-ssm";
import {Topic} from "aws-cdk-lib/aws-sns";
import {LambdaSubscription} from "aws-cdk-lib/aws-sns-subscriptions";
import {EventBus, Rule} from "aws-cdk-lib/aws-events";
import * as targets from 'aws-cdk-lib/aws-events-targets';

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

        // Create environment variables for read/write lambdas
        const environmentVariables = {
            TABLE_NAME: dynamoTable.tableName.toString()
        }

        // Create lambdas for read
        const readFunctionProps = getFunctionProps('handler/readHandler', context, environmentVariables);
        const listenerFunctionProps = getFunctionProps('handler/listenerHandler', context, environmentVariables);

        const readLambda: NodejsFunction = new NodejsFunction(this, "readHandler-function", readFunctionProps);
        const listenerLambda: NodejsFunction = new NodejsFunction(this, "listenerHandler-function", listenerFunctionProps);

        // Add permissions to lambdas to read and write to dynamo
        dynamoTable.grantReadData(readLambda);
        dynamoTable.grantWriteData(listenerLambda);

        // Create API gateway
        const api = new apigateway.RestApi(this, 'drop-down-api-gateway', {
            restApiName: 'restApi',
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS
            }
        });

        // Add read lambda to API Gateway
        const readIntegration = new LambdaIntegration(readLambda);
        const integrations = api.root.addResource('integrations');
        integrations.addMethod('Get', readIntegration);

        // Create API topic
        const topic = new Topic(this, 'ListenerTopic', {
            displayName: 'ListenerTopic'
        })

        // Subscribe listener lambda to topic
        const lambdaSub = new LambdaSubscription(listenerLambda)
        topic.addSubscription(lambdaSub)

        const lambdaNames = ['leadCloudHandler']

        lambdaNames.map(name => {
            const lambdaProps = getFunctionProps(`integrationHandler/${name}`, context);
            const lambda: NodejsFunction = new NodejsFunction(this, `${name}-function`, lambdaProps);

            const param = {name: lambda.functionName, URL: lambda.functionArn}

            const paramStore = new StringParameter(this, `${name}-parameter`, {
                parameterName: `/drop-down-demo/${name}`,
                stringValue: JSON.stringify(param)
            })

            paramStore.grantRead(listenerLambda)

            const rule = new Rule(this, `${name}-rule`, {
                eventPattern: {
                    "source": ["aws.ssm"],
                    "detailType": [
                        "Parameter Store Create"
                    ],
                    "detail": {
                        "name": [
                            "drop-down-demo",
                            `/drop-down-demo/${name}`
                        ],
                        "operation": [
                            "Create",
                            "Update"
                        ]
                    }
                },
            })

            rule.addTarget(new targets.SnsTopic(topic))
        })

        // CFN outputs
        new CfnOutput(this, 'api-gateway', {value: api.url});

        new CfnOutput(this, `${readLambda.node.id}-name`, {
            value: readLambda.functionName,
        });
    }
}
