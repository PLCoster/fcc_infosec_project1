const fetch = require('node-fetch');
const bcrypt = require('bcrypt');

const StockLikes = require('../models/stocklikes');

const stockLikesController = {};

// First middleware to call, processes query params and gets stock price info
stockLikesController.processStockQuery = (req, res, next) => {
  let { stock, like } = req.query;

  if (typeof stock === 'string') {
    stock = [stock];
  } else if (stock.length > 2) {
    stock = stock.slice(2);
  }

  Promise.all(
    stock.map((ticker) => {
      // Fetch current stock info by ticker through API
      return fetch(
        `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${ticker}/quote`,
      ).then((res) => {
        if (res.status === 200) {
          return res.json();
        }
        throw new Error(
          'Bad status when trying to get stock info - stock price API may be down',
        );
      });
    }),
  )
    .then((resArr) => {
      res.locals.stockInfo = [];
      resArr.forEach((result, i) => {
        if (result === 'Unknown symbol' || result === 'Invalid symbol') {
          throw new Error(
            `Stock ticker ${stock[i]} could not be found by API - please check ticker is correct`,
          );
        } else {
          const { symbol: stock, iexRealtimePrice: price } = result;
          res.locals.stockInfo.push({ stock, price });
        }
      });
      return next();
    })
    .catch((err) => {
      console.error(
        'Error when trying to get stock ticker info: ',
        err.message,
      );
      return res.json({ error: err.message });
    });
};

stockLikesController.addLikeForStocks = (req, res, next) => {
  // If no likes requested, skip adding likes to stocks
  if (req.query.like !== 'true') {
    return next();
  }

  const salt = process.env.HASH_SALT;
  bcrypt
    .hash(req.ip, salt)
    .then((hash) => {
      // Try to add a like to all stocks:
      return Promise.all(
        res.locals.stockInfo.map(({ stock }) => {
          // Check if stock has already been liked
          return StockLikes.findOne({
            stock_ticker: stock,
            hashed_ip: hash,
          }).then((document) => {
            if (!document) {
              return StockLikes.create({
                stock_ticker: stock,
                hashed_ip: hash,
              });
            }
            return 'Already Liked';
          });
        }),
      );
    })
    .then((resArray) => {
      return next();
    })
    .catch((err) => {
      console.error('Error in stockLikesController.addLikeForStocks: ', err);
      return next(err);
    });
};

stockLikesController.getStockLikeCount = (req, res, next) => {
  // Get count of likes for all stocks:
  Promise.all(
    res.locals.stockInfo.map(({ stock }) => {
      return StockLikes.countDocuments({ stock_ticker: stock }).exec();
    }),
  ).then((countArr) => {
    countArr.forEach((likeCount, i) => {
      res.locals.stockInfo[i].likes = likeCount;
    });

    // If two stocks, then return relative likes:
    if (countArr.length > 1) {
      const higherLikes = Math.max(
        res.locals.stockInfo[0].likes,
        res.locals.stockInfo[1].likes,
      );

      const lowerLikes = Math.min(
        res.locals.stockInfo[0].likes,
        res.locals.stockInfo[1].likes,
      );

      res.locals.stockInfo.forEach(({ likes }, i) => {
        if (likes === higherLikes) {
          res.locals.stockInfo[i].rel_likes = higherLikes - lowerLikes;
        } else {
          res.locals.stockInfo[i].rel_likes = lowerLikes - higherLikes;
        }
      });
    }

    next();
  });
};

module.exports = stockLikesController;
