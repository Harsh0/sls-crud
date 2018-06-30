'use strict';

const aws = require('aws-sdk');
const kms = new aws.KMS();
const { MongoClient } = require('mongodb');

const done = (cb, err, res) => {
    cb(null, {
        statusCode: err ? err.statusCode||'400' : res.statusCode||'200',
        body: err ? JSON.stringify(err.body) : JSON.stringify(res.body),
        headers: {
            'Content-Type': 'application/json'
          }
    });
}

const GetSecrets = (config, key) => {
    return new Promise((resolve,reject) => {
        if(config[key]){
            return resolve(config[key]);
        }
        kms.decrypt({CiphertextBlob:
            new Buffer(process.env[key], 'base64')},
            (err, data) => {
            if(err) return reject(err);
            //cache for future use
            config[key] = data.Plaintext.toString('ascii');
            resolve(config[key]);
        });
    });
}

const CreateConnection = config => {
    return new Promise((resolve, reject) => {
        if(global.db){
            //if connection is already there, use it
            resolve();
        }else{
            //create new connection by getting the secret using kms
            GetSecrets(config, 'MONGO_URI')
            .then(url => {
                return MongoClient.connect(url);    
            })
            .then(connection => {
                global.db = connection.db(connection.s.options.dbName);
                resolve();
            })
        }
    })
}

module.exports = {
    done,
    GetSecrets,
    CreateConnection
}