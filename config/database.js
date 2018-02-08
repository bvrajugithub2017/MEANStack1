const crypto = require('crypto');

const encryptedValue = crypto.randomBytes(256).toString('hex');
//Provides cryptographic functionality

module.exports = {
    //uri: 'mongodb://localhost:27017/forMEANdb1',
    //for development
    uri: 'mongodb://raju:datapro9@ds125588.mlab.com:25588/raju-mean1',
    //for production
    secret : encryptedValue
}