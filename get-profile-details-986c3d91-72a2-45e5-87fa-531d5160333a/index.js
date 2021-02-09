const AWS = require('aws-sdk'); //ensures that you are using aws package
const db = new AWS.DynamoDB.DocumentClient(); //access to dynamo db package

exports.handler = async (event) => {
    
    //get users ID input
    const wantedID = event.queryStringParameters.user_id;
    //Check if wanted ID is filled out
    if(wantedID == null || wantedID == ""){
        const response = {
            statusCode: 400,
            body: "Need a value to search",
        };
        return response;
    }
    //Get information related to entered ID
     let params = {
        TableName : 'user-profile',
        Key: { "user_id":
         wantedID
        }
    };
    //await getting info from the server
    let result = await db.get(params).promise();
    //Check that the player you are searching is a real user.
    if(result.Item == null){
        const response = {
            statusCode: 404,
            body: "User "+ wantedID +" is non existent",
        };
        return response;
    }
    //Send back the correct information you want. 
     const response = {
        statusCode: 200,
        body: "Players ID: " + result.Item.user_id + "\nPlayers Money: $" + result.Item.money + "\nPlayers Inventory: " + result.Item.inventory,
    };
    return response;
};
    
    
