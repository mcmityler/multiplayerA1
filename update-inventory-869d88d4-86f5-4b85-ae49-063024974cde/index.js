const AWS = require('aws-sdk'); //ensures that you are using aws package
const db = new AWS.DynamoDB.DocumentClient(); //access to dynamo db package

exports.handler = async (event) => {
    //Get user input
    const requestedUserAccount = event.body;
    let enteredID = JSON.parse(requestedUserAccount).user_id;
    let enteredCookie = JSON.parse(requestedUserAccount).cookieGiven;
    let enteredItemID = JSON.parse(requestedUserAccount).item_entered;
    //Check that none of the text fields the player are either empty or null
    if(enteredID == null || enteredID == "" || enteredCookie == null || enteredCookie == "" || enteredItemID == null || enteredItemID == ""){
         const response = {
            statusCode: 400,
            body: "Cannot leave any text fields empty",
        };
        return response;
    }
    //Check if player ID entered by user is real
    let params = {
        TableName : 'user-profile',
        Key: { "user_id":
         enteredID
        }
    };
    
    let result = await db.get(params).promise();
    if(result.Item == null){
        const response = {
            statusCode: 404,
            body: "User ID is non existent",
        };
        return response;
    }
    
    //Values from results
    let currentCookie = result.Item.session_cookie;
    let playersMoney = result.Item.money;
    let playersInventory = result.Item.inventory;
    
    //Check if cookie user entered is right
    if(currentCookie == enteredCookie){
        //Check if item is real
        let shopParams = {
            TableName : 'store-table',
            Key: { "item_id":
             enteredItemID
            }
        };
        let itemResult = await db.get(shopParams).promise();
        //Check if item user entered is a real item in the shop
        if(itemResult.Item == null){
            const response = {
                statusCode: 403,
                body: "Item ID is non existent",
            };
            return response;
        }
        //Set values
        let itemCost = itemResult.Item.item_price
        let selling = JSON.parse(requestedUserAccount).sellingItem;
        let buying = JSON.parse(requestedUserAccount).buyingItem;
        let newInv = {};
        //Check what the player intends to do
        if(selling == true && buying == true){
            const response = {
                statusCode: 400,
                body: "Cant buy and sell",
            };
            return response;
        }
        else if(selling == false && buying == false){
            const response = {
                statusCode: 400,
                body: "You have to buy or sell something",
            };
            return response;
        }
        //If player is selling item
        else if(selling == true && buying == false){
            //Check if player owns item
            let removedItem = false;
            for (var i=playersInventory.length-1; i>=0; i--) {
                
                //Remove item from inventory list
                if (playersInventory[i] === enteredItemID) {
                    playersInventory.splice(i, 1);
                    removedItem = true;
                    break;       //<-- Uncomment  if only the first term has to be removed
                }
            }
            if(removedItem == true){
                 //Add cost of item to players money
                playersMoney += itemCost;
                
            }else if (removedItem == false){
                const response = {
                    statusCode: 403,
                    body: JSON.stringify("You do not have that item to sell.. your items: " + playersInventory),
                };
                return response;
            }
           
        } 
        //If player is buying an item
        else if(selling == false && buying == true){
             //Check if user has enough money to purchase
            if(playersMoney < itemCost){
                const response = {
                    statusCode: 403,
                    body: "Not enough money",
                };
                return response;
            }else{
              //Remove total from users money
              playersMoney -= itemCost;
              //Add item to inventory
              playersInventory.push(enteredItemID);
            }
        }
        //set item back to players password so it doest get erased.
        let playerPassword = result.Item.password;
         let newID = {
               TableName : 'user-profile',
                Item: {
                    "user_id": enteredID,
                    "password": playerPassword,
                    "inventory": playersInventory,
                    "money" : playersMoney,
                    "session_cookie": currentCookie
                }
            };
            
        // Call DynamoDB to change the item in the table
           await db.put(newID, function(err, data) {
                if (err) {
                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("Added item:", JSON.stringify(data, null, 2));
                }
            }).promise();
       
        
        //Display/Update
         if(selling){
            const response = {
            statusCode: 200,
            body: "Sold "+ enteredItemID +" successfully! \nPlayers Money: $" + playersMoney + "  \n" + enteredID + "'s inventory: " + playersInventory,
            };
            return response;
        }
        if(buying){
            const response = {
            statusCode: 200,
            body: "Bought "+ enteredItemID +" successfully! \nPlayers Money: $" + playersMoney + "  \n" + enteredID + "'s inventory: " + playersInventory,
            };
            return response;
        }
    }
    else{
         const response = {
            statusCode: 404,
            body: "Session cookie is non existent",
        };
        return response;
    }
    
   
    // TODO implement
};



