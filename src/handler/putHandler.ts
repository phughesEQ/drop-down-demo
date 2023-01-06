import {putItem} from "../dynamoDB/dynamoClient";


export const putHandler = async (event) => {
    try {
        const item = JSON.parse(event.body)
        console.log("Event Body: ", item)
        await putItem(process.env.TABLE_NAME, item)
        return {statusCode: 200, body: "Successfully added"}
    } catch (e) {
        console.error(`An error occurred ${e}`)
        return e
    }
}
