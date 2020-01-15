const TokenModel = require('../model/TokenModel');

exports.list = async () => {
    return TokenModel.find();
}

exports.create = (item) => {
    var data = new TokenModel(item);
    data.save(function (err, body) {
        if (err) console.log(err);
        return body
    })
};

exports.update = (item) => {
    return TokenModel.findOneAndUpdate({ 'user_id': item.user_id }, { $set: item }, { upsert: true }, function (err, body) {
        if (err) console.log(err)
        console.log(body);
        return body
    })
};

exports.view = function (user_id) {
    return TokenModel.findOne({ 'user_id': user_id }, (err, res) => { return res });
};
 