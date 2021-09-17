const contactsRouter = require('./contactRouter');
const homeRouter = require('./homeRouter');
const userRouter = require('./userRouter');
const authRouter = require('./Authentication/authRouter');


function route(app) {
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        next();
      });
    app.use('/login-register', authRouter);
    app.use('/contact', contactsRouter);
    app.use('/home', homeRouter);
    app.use('/updateProfile',userRouter)
}

module.exports = route;
