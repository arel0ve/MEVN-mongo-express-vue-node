const express = require('express');
// const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');
const mongoose = require('mongoose');

const userRouter = require('./routes/user');

const ws = require('./ws');

const app = express();

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/api', userRouter);


mongoose.connect(config.dbURL, config.options);
mongoose.connection
    .once('open', () => {
      console.log(`Mongoose - successful connection ...`);
      app.listen(process.env.PORT || config.port,
          () => console.log(`Server start on port ${config.port} ...`))
    })
    .on('error', error => console.warn(error));
