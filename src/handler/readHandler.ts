import {getAllItems} from "../dynamoDB/dynamoClient";

export const readHandler = async (_) => {
    try {
        const items = await getAllItems(process.env.TABLE_NAME)
        return {
            statusCode: 200,
            body: JSON.stringify(items),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET",
                "Access-Control-Allow-Headers": "*"
            }
        }
    } catch (e) {
        console.error(`An error occurred ${e}`)
        return e
    }
}
