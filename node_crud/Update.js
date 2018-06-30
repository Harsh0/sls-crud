'use strict';

console.log('Loading function');

let config = {};

let { done, GetSecrets, CreateConnection } = require('./utility');

CreateConnection = CreateConnection.bind(null, config);

const ValidateBody = (_id, body) => {
    try{
        body = JSON.parse(body);
    }catch(err){
        throw {
            code: 400,
            msg: 'request body should be json type'
        }
    }
    if(!_id||isNaN(Number(_id))){
        throw {
            code: 400,
            msg: '_id is not \'number\''
        }
    }
    body._id = Number(_id);
    return body;
}

const UpdateDocument = body => {
    return db.collection('documents').updateOne({_id: body._id},{$set:body});
}

exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;   
    let Done = done.bind(null, callback);
    CreateConnection()
    .then(ValidateBody.bind(null, event.pathParameters._id, event.body))
    .then(UpdateDocument)
    .then(data => {
        data = JSON.parse(JSON.stringify(data));
        Done(null, {
            statusCode: data.n?200:404,
            body: {
                message: data.n?'document updated successfully':'document doesn\'t exist for corresponding _id'
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
  