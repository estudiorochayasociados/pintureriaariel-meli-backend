const ConfigModel = require('../model/ConfigModel');

exports.list = async () => {
    return ConfigModel.find({}, function(err, body) {
        if (err) console.log(err);
        return body
     });
}

exports.create = (req,res) => {
    var data = new ConfigModel(req.body);
    data.save(function (err, body) {
        if (err) console.log(err);
        return body;
    })
};

exports.update = (configuration) => {
    return ConfigModel.updateMany ({}, { $set: configuration }, function (err, body) {
        if (err) console.log(err);
        return body;
    })
};
 