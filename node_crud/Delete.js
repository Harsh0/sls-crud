'use strict';

console.log('Loading function');

let config = {};

let { done, GetSecrets, CreateConnection } = require('./utility');

CreateConnection = CreateConnection.bind(null, config);

const ValidateId = id => {
    if(!id||isNaN(Number(id))){
        throw {
            statusCode: 400,
            msg: '_id is not valid'
        }
    }
    return Number(id)
}

const DeleteDocument = _id => {
    return db.collection('documents').deleteOne({_id});
}

exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;   
    let Done = done.bind(null, callback);
    CreateConnection()
    .then(ValidateId.bind(null, event.pathParameters._id))
    .then(DeleteDocument)
    .then(data => {
        data = JSON.parse(JSON.stringify(data));
        Done(null, {
            statusCode: data.n?200:404,
            body: {
                message: data.n?'document deleted successfully':'document doesn\'t exist for corresponding _id'
            }
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
  