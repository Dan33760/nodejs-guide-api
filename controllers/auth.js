const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statuCode = 422;
        error.data = errors.array();
        throw error;
    }
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    bcrypt.hash(password, 12)
        .then(hashedPwd => {
            const user = new User({
                name: name,
                email: email,
                password: hashedPwd
            });
            return user.save()
        })
        .then(result => {
            res.status(201).json({
                message: 'User created!',
                userId: result._id
            });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({ email: email })
        .then(user => {
            if(!user) {
                const error = new Error('A user with this email could not be found.');
                error.statuCode = 401;
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if(!isEqual) {
                const error = new Error('Wrong password!');
                error.statuCode = 401;
                throw error;
            }
            const token = jwt.sign({
                    email: loadedUser.email,
                    userId: loadedUser._id.toString()
                },
                'somesupersecretsecretsecret',
                { expiresIn: '1h' }
            );
            res.status(200).json({
                token: token,
                userId: loadedUser._id.toString()
            });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}