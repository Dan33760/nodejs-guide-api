const path = require('path');

const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRouters = require('./routes/auth');

const MONGODB_URI = 'mongodb+srv://dansk:9ZW2QpyLCpetXzde@cluster0.pyg1o.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0';

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Math.random().toString() + '-img-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}

// app.use(bodyParser.urlencoded())
app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET', 'POST','PUT', 'PATCH', 'DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRouters);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({
        message: message,
        data: data
    });
})

mongoose
    .connect(MONGODB_URI)
    .then(result => {
        const server = app.listen(8080);
        const io = require('./socket').init(server);
        io.on('connection', socket => {
            console.log('Client connected!');
        })
    })
    .catch(err => console.log(err));