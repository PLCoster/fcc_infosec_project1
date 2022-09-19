'use strict';

const {
  processStockQuery,
  addLikeForStocks,
  getStockLikeCount,
} = require('../controllers/stocklikescontroller');

module.exports = function (app) {
  app
    .route('/api/stock-prices')
    .get(processStockQuery, addLikeForStocks, getStockLikeCount, (req, res) => {
      // If one stock requests, just return data object
      if (res.locals.stockInfo.length === 1) {
        return res.json({ stockData: res.locals.stockInfo[0] });
      }

      return res.json({ stockData: res.locals.stockInfo });
    });
};
