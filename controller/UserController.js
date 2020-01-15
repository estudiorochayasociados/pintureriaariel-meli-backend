const UserModel = require('../model/UserModel');

exports.list = async () => {
    return UserModel.find();
}

exports.create = (body) => {
    var data = new UserModel({
        email: body.email,
        password: body.password
    });
    return data.save()
        .then(saved => { return { status:200, data: saved }})
        .catch(err => { return { status:500, data: err.message }});
};

exports.update = (item) => {
    return UserModel.findOneAndUpdate({ '_id': item._id }, { $set: item }, { new: true }, function (err, body) {
        if (err) console.log(err)
        return body
    })
};

exports.view = function (user_id) {
    return UserModel.findOne({ '_id': ObjectId(user_id) }, (err, res) => { return res });
};

exports.login = function (email, password) {
    return UserModel.findOne({ 'email': email, 'password': password }, (err, res) => {
        return res
    });
};

exports.delete = function (user_id) {
    return UserModel.deleteOne({ '_id': ObjectId(user_id) }, (err, res) => { return res });
};