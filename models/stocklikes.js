// Set up mongoose connection to MONGO DB:
const mongoose = require('mongoose');
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database connection successful');
  })
  .catch((err) => {
    console.error('Database connection error');
  });

// https://mongoosejs.com/docs/guide.html
// https://mongoosejs.com/docs/api.html
const stockLikesSchema = new mongoose.Schema({
  stock_ticker: String,
  hashed_ip: String,
});

// Enforce stock_ticker and hashed_ip to be unique:
// https://mongoosejs.com/docs/guide.html#indexes
stockLikesSchema.index({ stock_ticker: 1, hashed_ip: 1 }, { unique: true });

const stockLikes = mongoose.model('stockLikes', stockLikesSchema);

module.exports = stockLikes;
