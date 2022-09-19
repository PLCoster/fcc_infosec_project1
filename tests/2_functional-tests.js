const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;

const server = require('../server');
const StockLikes = require('../models/stocklikes');

chai.use(chaiHttp);

// Helper function to check that response when requesting a single stock ticker is valid
function checkSingleStockResponseValid(response, stockTicker, expectedLikes) {
  assert.equal(response.status, 200, 'Response status should be 200');
  assert.equal(
    response.type,
    'application/json',
    'Response type should be "application/json"',
  );
  assert.isObject(response.body, 'Response body should be an object');
  assert.hasAllKeys(
    response.body,
    ['stockData'],
    'Response body object should have a single "stockData" property',
  );
  assert.isObject(
    response.body.stockData,
    'Stock Data Property Value should be an Object',
  );

  const stockData = response.body.stockData;
  assert.hasAllKeys(
    stockData,
    ['stock', 'price', 'likes'],
    'Stock Data Object should have expected keys',
  );
  assert.equal(
    stockData.stock,
    stockTicker,
    'Stock info ticker should match requested ticker',
  );
  assert.isNumber(stockData.price, 'Stock info price should be a number');
  assert.equal(
    stockData.likes,
    expectedLikes,
    'Stock info likes should match expected number of likes',
  );

  return true;
}

// Helper function to check that response when requesting a two stock tickers is valid
function checkTwoStockResponseValid(
  response,
  tickerArr,
  likesArr,
  relLikesArr,
) {
  assert.equal(response.status, 200, 'Response status should be 200');
  assert.equal(
    response.type,
    'application/json',
    'Response type should be "application/json"',
  );
  assert.isObject(response.body, 'Response body should be an object');
  assert.hasAllKeys(
    response.body,
    ['stockData'],
    'Response body object should have a single "stockData" property',
  );
  assert.isArray(
    response.body.stockData,
    'Response stockData should be an Array',
  );
  assert.equal(
    response.body.stockData.length,
    2,
    'stockData Array should contain two stock data objects',
  );

  response.body.stockData.forEach((data, i) => {
    assert.hasAllKeys(
      data,
      ['stock', 'price', 'likes', 'rel_likes'],
      'Stock Data Object should have expected keys',
    );
    assert.equal(
      data.stock,
      tickerArr[i],
      'Stock info ticker should match requested ticker',
    );
    assert.isNumber(data.price, 'Stock info price should be a number');
    assert.equal(
      data.likes,
      likesArr[i],
      'Stock info rel_likes should match expected number of rel_likes',
    );
    assert.equal(
      data.rel_likes,
      relLikesArr[i],
      'Stock info rel_likes should match expected number of rel_likes',
    );
  });

  return true;
}

suite('Functional Tests', function () {
  // Delete all StockLikes documents before running test suite
  suiteSetup(function (done) {
    console.log('Emptying StockLikes collection before running tests...');
    StockLikes.deleteMany({})
      .then((res) => {
        if (!res.acknowledged) {
          throw new Error('Before Suite Database Deletion not acknowledged');
        }
        done();
      })
      .catch((err) => done(err));
  });

  // Delete all StockLikes documents after running test suite
  suiteTeardown(function (done) {
    console.log('Emptying StockLikes collection after running tests...');
    StockLikes.deleteMany({})
      .then((res) => {
        if (!res.acknowledged) {
          throw new Error('afterAll Database Deletion not acknowledged');
        }
        done();
      })
      .catch((err) => done(err));
  });

  test('Ensure Test Database Contains 0 StockLike documents before running tests', function (done) {
    StockLikes.countDocuments({})
      .then((count) => {
        assert.equal(
          count,
          0,
          'Document count should be 0 before running tests',
        );
        done();
      })
      .catch((err) => done(err));
  });

  suite('API Tests', function () {
    suite(
      'GET /api/stock-prices with a single stock => Stock Price and Likes Info',
      function () {
        test('GET /api/stock-prices with single stock query param returns stock info', function (done) {
          const stockTicker = 'GOOG';
          const expectedLikes = 0;

          chai
            .request(server)
            .get(`/api/stock-prices?stock=${stockTicker}`)
            .then((res) => {
              assert.isTrue(
                checkSingleStockResponseValid(res, stockTicker, expectedLikes),
              );
              done();
            })
            .catch((err) => done(err));
        });

        test('GET /api/stock-prices with single stock query param and a like param set to "true" results in incrementing a stocks likes', function (done) {
          const stockTicker = 'GOOG';
          const expectedLikes = 1;

          chai
            .request(server)
            .get(`/api/stock-prices?stock=${stockTicker}&like=true`)
            .then((res) => {
              assert.isTrue(
                checkSingleStockResponseValid(res, stockTicker, expectedLikes),
              );
              done();
            })
            .catch((err) => done(err));
        });

        test('GET /api/stock-prices with single stock query param and a like param set to "true" on the same stock does not increase likes on the stock', function (done) {
          const stockTicker = 'GOOG';
          const expectedLikes = 1;

          chai
            .request(server)
            .get(`/api/stock-prices?stock=${stockTicker}&like=true`)
            .then((res) => {
              assert.isTrue(
                checkSingleStockResponseValid(res, stockTicker, expectedLikes),
              );
              done();
            })
            .catch((err) => done(err));
        });

        test('GET /api/stock-prices with a non-existent stock ticker returns an error JSON', function (done) {
          const stockTicker = 'QAZX';

          chai
            .request(server)
            .get(`/api/stock-prices?stock=${stockTicker}&like=true`)
            .then((res) => {
              assert.equal(res.status, 200, 'Response status should be 200'); // !!!
              assert.equal(
                res.type,
                'application/json',
                'Response type should be "application/json"',
              );
              assert.hasAllKeys(res.body, ['error']);
              done();
            })
            .catch((err) => done(err));
        });

        test('GET /api/stock-prices with an invalid stock ticker returns an error JSON', function (done) {
          const stockTicker = '1234';

          chai
            .request(server)
            .get(`/api/stock-prices?stock=${stockTicker}&like=true`)
            .then((res) => {
              assert.equal(res.status, 200, 'Response status should be 200'); // !!!
              assert.equal(
                res.type,
                'application/json',
                'Response type should be "application/json"',
              );
              assert.hasAllKeys(res.body, ['error']);
              done();
            })
            .catch((err) => done(err));
        });

        test('GET /api/stock-prices with no stock ticker returns an error JSON', function (done) {
          chai
            .request(server)
            .get(`/api/stock-prices?like=true`)
            .then((res) => {
              assert.equal(res.status, 200, 'Response status should be 200'); // !!!
              assert.equal(
                res.type,
                'application/json',
                'Response type should be "application/json"',
              );
              assert.hasAllKeys(res.body, ['error']);
              done();
            })
            .catch((err) => done(err));
        });
      },
    );

    suite(
      'GET /api/stock-prices with two stocks => Stock Prices and Relative Likes Info',
      function () {
        test('GET /api/stock-prices with two stock query params returns info and relative likes for both stocks', function (done) {
          const stockTicker1 = 'GOOG';
          const stockTicker2 = 'MSFT';
          const expectedLikes = [1, 0];
          const expectedRelLikes = [1, -1];

          chai
            .request(server)
            .get(
              `/api/stock-prices?stock=${stockTicker1}&stock=${stockTicker2}`,
            )
            .then((res) => {
              assert.isTrue(
                checkTwoStockResponseValid(
                  res,
                  [stockTicker1, stockTicker2],
                  expectedLikes,
                  expectedRelLikes,
                ),
              );
              done();
            })
            .catch((err) => done(err));
        });

        test('GET /api/stock-prices with two stock query params and like=true likes both stocks if they were not previously liked', function (done) {
          const stockTicker1 = 'AAPL';
          const stockTicker2 = 'AMZN';
          const expectedLikes = [1, 1];
          const expectedRelLikes = [0, 0];

          chai
            .request(server)
            .get(
              `/api/stock-prices?stock=${stockTicker1}&stock=${stockTicker2}&like=true`,
            )
            .then((res) => {
              assert.isTrue(
                checkTwoStockResponseValid(
                  res,
                  [stockTicker1, stockTicker2],
                  expectedLikes,
                  expectedRelLikes,
                ),
              );

              // Check that individual stock likes are incremented
              return Promise.all(
                [stockTicker1, stockTicker2].map((stockTicker) => {
                  return chai
                    .request(server)
                    .get(`/api/stock-prices?stock=${stockTicker}`)
                    .then((res) => {
                      assert.isTrue(
                        checkSingleStockResponseValid(res, stockTicker, 1),
                      );
                      return true;
                    });
                }),
              );
            })
            .then((res) => done())
            .catch((err) => done(err));
        });

        test('GET /api/stock-prices with two stock query params and like=true likes a stock that was not previously liked', function (done) {
          const stockTicker1 = 'GOOG';
          const stockTicker2 = 'MSFT';
          const expectedLikes = [1, 1];
          const expectedRelLikes = [0, 0];

          chai
            .request(server)
            .get(
              `/api/stock-prices?stock=${stockTicker1}&stock=${stockTicker2}&like=true`,
            )
            .then((res) => {
              assert.isTrue(
                checkTwoStockResponseValid(
                  res,
                  [stockTicker1, stockTicker2],
                  expectedLikes,
                  expectedRelLikes,
                ),
              );

              // Check that individual stock likes are incremented
              return Promise.all(
                [stockTicker1, stockTicker2].map((stockTicker) => {
                  return chai
                    .request(server)
                    .get(`/api/stock-prices?stock=${stockTicker}`)
                    .then((res) => {
                      assert.isTrue(
                        checkSingleStockResponseValid(res, stockTicker, 1),
                      );
                      return true;
                    });
                }),
              );
            })
            .then((res) => done())
            .catch((err) => done(err));
        });

        test('GET /api/stock-prices with two stock query params, one being invalid, returns an error', function (done) {
          const stockTicker1 = 'GOOG';
          const stockTicker2 = '1234';

          chai
            .request(server)
            .get(
              `/api/stock-prices?stock=${stockTicker1}&stock=${stockTicker2}&like=true`,
            )
            .then((res) => {
              assert.equal(res.status, 200, 'Response status should be 200'); // !!!
              assert.equal(
                res.type,
                'application/json',
                'Response type should be "application/json"',
              );
              assert.hasAllKeys(res.body, ['error']);
              done();
            })
            .catch((err) => done(err));
        });
      },
    );
  });
});
