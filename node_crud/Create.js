'use strict';

console.log('Loading function');

let config = {};

let { done, GetSecrets, CreateConnection } = require('./utility');

CreateConnection = CreateConnection.bind(null, config);

const ValidateBody = body => {
    try{
        body = JSON.parse(body);
    }catch(err){
        throw {
            code: 400,
            msg: 'request body should be json type'
        }
    }
    if(!body._id||typeof body._id != 'number'){
        throw {
            code: 400,
            msg: '_id is not \'number\''
        }
    }
    return body;
}

const InsertDocument = body => {
    return db.collection('documents').insertOne(body);
}

exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;   
    let Done = done.bind(null, callback);
    CreateConnection()
    .then(ValidateBody.bind(null, event.body))
    .then(InsertDocument)
    .then(data => {
        Done(null, {
            statusCode: 201,
            body: {
                message: 'document created successfully'
            }
        });
    })
    .catch(err => {
        if(err.code==11000){
            //duplicate key
            return Done({
                statusCode:400,
                body:{
                    message: 'document already exist for corresponding id'
                }
            });
        }
        console.log(err);
        //if some custom error to be throw pass json like this {msg:'err message',code:401(http status code)}
        Done({
            statusCode:err.message?500:err.code,
            body:{
                //if err has message, some internal error is there, otherwise pass custom error
                message:err.message?"Internal Server Error":err.msg
            }
        });
    })
};
  