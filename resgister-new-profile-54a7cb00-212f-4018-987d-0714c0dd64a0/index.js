const AWS = require('aws-sdk'); //ensures that you are using aws package
const db = new AWS.DynamoDB.DocumentClient(); //access to dynamo db package

exports.handler = async (event) => {
    
    //Get inputs from user
    const requestedUserAccount = event.body;
    let wantedID = JSON.parse(requestedUserAccount).user_id;
    let wantedPassword = JSON.parse(requestedUserAccount).password;
    let baseMoney = 100;
    
     if(wantedID == null || wantedID == ""){
        const response = {
            statusCode: 404,
            body: "User ID cant be empty",
        };
        return response;
    }
    if(wantedPassword == null || wantedPassword == ""){
        const response = {
            statusCode: 400,
            body: "You need to enter a Password",
        };
        return response;
    }
    //Check if user ID is taken
     let params = {
        TableName : 'user-profile',
        Key: { "user_id":
         wantedID
        }
    };
    //if ID taken give error code
    let result = await db.get(params).promise();
    if(result.Item != null){
        const response = {
            statusCode: 404,
            body: "User ID is already taken",
        };
        return response;
    }
    
    if(wantedPassword == null){
        const response = {
            statusCode: 403,
            body: "Something is wrong with the password",
        };
        return response;
    }
    
    //if ID not taken, create new account in table, with base money & no items
    let newID = {
       TableName : 'user-profile',
        Item: {
            "user_id": wantedID,
            "password": wantedPassword,
            "inventory": ["apple", "banana"],
            "money" : baseMoney
        }
    };
    
    // Call DynamoDB to add the item to the table
   // await db.put(newID).promise();
   await db.put(newID, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
        }
    }).promise();
    
    
    
    /*const requestUID = event.queryStringParameters.user_id;
    
    //get the item from the database
    let params = {
        TableName : 'user-profiles',
        Key: { "user_id":
         requestUID
        }
    };
    //return the item json
    let result = await db.get(params).promise();
    if(result.Item == null){
        const response = {
            statusCode: 404,
            body: "Could not find user with given ID",
        };
        return response;
    }
    
    
    const responseBody = {
        "name": result.Item.user_name,
        "level": result.Item.level
    };
    */
    // TODO implement
    const response = {
        statusCode: 200,
        body: "successfully registered " + wantedID,
    };
    return response;
};
