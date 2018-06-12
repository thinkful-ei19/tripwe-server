'use strict'
const bcrypt = require('bcryptjs');
const knex = require('knex');
//knex?

const userSchema = new knex.Schema({
    fullname: { type: String, default: '' },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true}
});
userSchema.set('toObject', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
    }
});
userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
};
  
userSchema.statics.hashPassword = function (password) {
    return bcrypt.hash(password, 10);
};
module.exports = knex.model('User', userSchema)