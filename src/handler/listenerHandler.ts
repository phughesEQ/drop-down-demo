import {putItem} from "../dynamoDB/dynamoClient";
import {getParameterWorker} from "../utils/ParamStore";


export const listenerHandler = async (event) => {
    try {
        const message = JSON.parse(event.Records[0].Sns.Message)
        const paramName = message.detail.name
        console.log("Event SNS: ", event.Records[0].Sns)

        const itemString: string = await getParameterWorker(paramName, false)
        const item = JSON.parse(itemString)
        await putItem(process.env.TABLE_NAME, item)
    } catch (e) {
        console.error(`An error occurred ${e}`)
        return e
    }
}
