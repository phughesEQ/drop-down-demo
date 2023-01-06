import {DynamoDBClient, PutItemCommand, ScanCommand} from "@aws-sdk/client-dynamodb";
import {PutEventType} from "../events/types";

const client = new DynamoDBClient({region: "us-east-1"});

export const getAllItems = async (tableName: string) => {
    try {
        const scanCommand: ScanCommand = new ScanCommand({
            TableName: tableName,
        });

        const result = await client.send(scanCommand);

        if (!result || !result.Items || result.Items?.length === 0) {
            return [];
        }

        return result.Items;
    } catch (error) {
        console.error("An error occurred when trying to read all from Dynamo: ", error)
        throw error;
    }
};

export const putItem = async (tableName: String, item: PutEventType) => {
    try {
        const params = {
            Item: {
                itemId: {S: `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`},
                URL: {S: item.URL},
                vertical: {S: item.vertical},
                partner: {S: item.partner},
                attributes: {S: item.attributes.toString()}
            },
            TableName: tableName
        };

        const putItemCommand = new PutItemCommand(params);

        return await client.send(putItemCommand)
    } catch (error) {
        console.error("An error occurred when trying to put an item into Dynamo: ", error)
        throw error;
    }
}
