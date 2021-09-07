const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const userRouter = require(`${__dirname}/routes/userRoutes`);
const viewRouter = require(`${__dirname}/routes/viewRoutes`);
const postRouter = require(`${__dirname}/routes/postRoutes`);
const storyRouter = require(`${__dirname}/routes/storyRoutes`);
const chitChatRouter = require(`${__dirname}/routes/chitChatRoutes`);
const AppError = require('./utils/appError');
const globalErrorHandler = require('./Controller/errorController');
const bodyParser = require('body-parser');
const app = express();

// setting secure header
app.use(helmet());
//it allow max request per windowMs request to server from an ip
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from an IP, try again later in on hour',
});
app.use('/v1', limiter);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
//data sanization against noSQL query injections
app.use(mongoSanitize());

//data sanitization from xss
app.use(xss());

//preventing from parameter pollution, removes duplicates query
app.use(
  hpp({
    whitelist: [], // pass parameter for which duplicates are allowed
  })
);

app.use(express.static(`${__dirname}/public`));

//routes
app.use('/', viewRouter);
app.use('/v1/story/', storyRouter);
app.use('/v1/users/', userRouter);
app.use('/v1/posts/', postRouter);
app.use('/v1/chitChat/', chitChatRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this Server`, 404));
});

// Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
