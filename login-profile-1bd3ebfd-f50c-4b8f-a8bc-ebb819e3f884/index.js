const AWS = require('aws-sdk'); //ensures that you are using aws package
const db = new AWS.DynamoDB.DocumentClient(); //access to dynamo db package

exports.handler = async (event) => {
    
    //Gets users input
    const requestedUserAccount = event.body;
    let enteredID = JSON.parse(requestedUserAccount).user_id;
    let enteredPassword = JSON.parse(requestedUserAccount).password;
    let _sessionCK = "1234";
     _sessionCK = makeid();
    function makeid() {
       let result           = '';
       let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
       let charactersLength = characters.length;
       for ( let i = 0; i < 5; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
       }
       return result;
    }
    if(enteredID == null || enteredID == "" || enteredPassword == null || enteredPassword == ""){
        const response = {
            statusCode: 400,
            body: "You need to enter a Username and Password",
        };
        return response;
    }
    //checks username & password against table
    let params = {
        TableName : 'user-profile',
        Key: { "user_id":
         enteredID
        }
    };
    
    //if wrong display error
    let result = await db.get(params).promise();
    if(result.Item == null){
        const response = {
            statusCode: 404,
            body: "User ID is non existent",
        };
        return response;
    }
   
    
    //if correct, create, output & store session cookie
     else if(result.Item.user_id == enteredID){
        if(result.Item.password == enteredPassword){
            let userMoney = result.Item.money;
            let userItems = result.Item.inventory;
            
              let newID = {
               TableName : 'user-profile',
                Item: {
                    "user_id": enteredID,
                    "password": enteredPassword,
                    "inventory": userItems,
                    "money" : userMoney,
                    "session_cookie": _sessionCK
                }
            };
            
             // Call DynamoDB to add the item to the table
                 await db.put(newID, function(err, data) {
                    if (err) {
                        console.error("Unable to add item. Error JSON:", JSON.stringify(err));
                    } else {
                        console.log("Added item:", data);
                    }
                }).promise();
           
            const response = {
                statusCode: 200,
                body: "Your session cookie is: " + _sessionCK,
            };
            return response;
        }else{
            const response = {
                statusCode: 404,
                body: "Wrong password",
            };
            return response;
        }
    }
  
    
  
};
