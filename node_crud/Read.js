'use strict';

console.log('Loading function');

let config = {};

let { done, GetSecrets, CreateConnection } = require('./utility');

CreateConnection = CreateConnection.bind(null, config);

const GetAllDocuments = _ => {
    return db.collection('documents').find().toArray();
}

exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;   
    let Done = done.bind(null, callback);
    CreateConnection()
    .then(GetAllDocuments)
    .then(data => {
        Done(null, {
            statusCode: 200,
            body: data
        });
    })
    .catch(err => {
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
  