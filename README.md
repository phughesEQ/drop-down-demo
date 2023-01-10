# Welcome to your CDK TypeScript project

## Running Locally

export AWS credentials
 
Start docker with the following commands
```shell
$ docker run -p 8000:8000 amazon/dynamodb-local
```

Create a table for the dynamoDB
```shell 
$ aws dynamodb create-table --cli-input-json file://src/dynamoDB/integrationConfig.json --endpoint-url http://localhost:8000
```
                               
Verify the table has been created 
```shell 
$ aws dynamodb list-tables --endpoint-url http://localhost:8000
```

Expected output
```json
{
    "TableNames": [
        "INTEGRATION_CONFIG"
    ]
}
```

Synth Lambda
```shell
$ CDK synth
```

Invoke Lambda 
```shell
$ sam local invoke -t cdk.out/drop-down-demo.template.json readHandler-function
```

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
