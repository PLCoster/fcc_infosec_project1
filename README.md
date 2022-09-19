# Free Code Camp: Information Security Project 1 - Stock Price Checker

## Stock Price Checker

The aim of this project was to build a small web app with functionality similar to: https://stock-price-checker.freecodecamp.rocks

The project was built using the following technologies:

- **HTML**
- **JavaScript** with **[Node.js](https://nodejs.org/en/) / [NPM](https://www.npmjs.com/)** for package management.
- **[Express](https://expressjs.com/)** web framework to build the web API.
- **[mongoose](https://mongoosejs.com/)** for MongoDB object modeling, interacting with a **[MongoDB Atlas](https://www.mongodb.com/atlas/database)** database.
- **[Helmet](https://helmetjs.github.io/)** for Express.js security with HTTP headers.
- **[bcrypt](https://www.npmjs.com/package/bcryptjs)** for hashing user IP addresses for anonymity.
- **[Bootstrap](https://getbootstrap.com/)** for styling with some custom **CSS**.
- **[FontAwesome](https://fontawesome.com/)** for icons.
- **[Mocha](https://mochajs.org/)** test framework with **[Chai](https://www.chaijs.com/)** assertions for testing.
- **[nodemon](https://nodemon.io/)** for automatic restarting of server during development.

Live stock prices are provided by the Free Code Camp Stock Price Checker Proxy: https://stock-price-checker-proxy.freecodecamp.rocks

### Project Requirements:

- **User Story #1:** The content security policy should be set to only allow loading of scripts and CSS from your server (via `helmet`).

- **User Story #2:** You can send a `GET` request to `/api/stock-prices`, passing a NASDAQ stock symbol to a stock query parameter. The returned object will contain a property named `stockData`.

- **User Story #3:** The `stockData` property includes the `stock` symbol as a string, the `price` as a number, and `likes` as a number.

- **User Story #4:** You can also optionally pass include a `like` query parameter with a value of `true` to have your like added to the stock(s). Only 1 like per IP should be accepted.

- **User Story #5:** If you pass along 2 stocks with the `GET` request to `/api/stock-prices`, the returned value will be an array with information about both stocks. As well as `likes`, it will display `rel_likes` (the difference between the likes on both stocks) for both `stockData` objects.

- **User Story #6:** The 5 following functional tests for the `GET /api/stock-prices` route are complete and passing:
  - Viewing one stock: GET request to `/api/stock-prices/`
  - Viewing one stock and liking it: GET request to `/api/stock-prices/`
  - Viewing the same stock and liking it again: GET request to `/api/stock-prices/`
  - Viewing two stocks: GET request to `/api/stock-prices/`
  - Viewing two stocks and liking them: GET request to `/api/stock-prices/`

### Project Writeup:

The first Free Code Camp: Information Security Project is a simple Stock Price Checking App and API. Users can view current price information for a single selected stock or compare two stocks. In addition, users can 'like' selected stocks. Likes are limited to one like for each stock per unique IP address. IP address are anonymised by hashing using `bcrypt` before being stored in a MongoDB database. The following actions are possible:

- View a single stock price and number of likes from users by submitting the relevant form on the App homepage, or by sending a GET request to `/api/stock-prices?stock=<SYMBOL>` where `<SYMBOL>` is the symbol of the desired stock (e.g. `GOOG`). An optional `like` query parameter with a value of `true` can also be added to add a 'like' to the selected stock.

- View a comparison of two stocks by submitting the relevant form on the App homepage, or by sending a GET request to `/api/stock-prices?stock=<SYMBOL1>&stock=<SYMBOL2>`, where `<SYMBOLX>` are the symbols of the desired stocks. An optional `like` query parameter with a value of `true` can also be added to add a 'like' both of the selected stocks.

A test suite has been written for the app:

- `tests/2_functional-tests.js` contains functional tests of the application routes (GET requests to `/api/stock-prices`).

### Project Files:

- `server.js` - the main entry point of the application, an express web server handling the routes defined in the specification.

- `/routes/api.js` - contains the major API routes for the express web app.

- `/controllers` - contains the `stocklikescontroller.js` middleware, with methods to get stock price information, and add likes for requested stocks if desired.

- `/models` - contains `mongoose` database schema for the application. The `StockLikes` schema represents a specific user (identified by a hash of their IP address) liking a specific stock (identified by the stock symbol).

- `public/` - contains static files for the web app (stylesheet, logo, favicons etc), served by express using `express.static()`.

  - `script.js` contains a JS script for handling front-end form submission and UI updates with responses, and is loaded by `index.html`.

- `views/` - contains the single html page for the web app, `index.html`, which is served by express on `GET` requests to `/`

- `tests/` - contains the test suite for the application.

### Usage:

Requires Node.js / NPM in order to install required packages. After downloading the repo, install required dependencies with:

`npm install`

To run the app locally, valid production and testing MongoDB database URIs are required to be entered as environmental variables (`MONGO_URI`, `TEST_MONGO_URI`), which can be done via a `.env` file (see sample.env). One possible MongoDB service is **[MongoDB Atlas](https://www.mongodb.com/atlas/database)**.

In addition, a valid bcrypt salt is required to be entered as an environmental variable (`HASH_SALT`). One can be created by running `bcrypt.genSaltSync(12)`.

A development mode (with auto server restart on file save), can be started with:

`npm run dev`

The application can then be viewed at `http://localhost:3000/` in the browser.

To start the server without auto-restart on file save:

`npm start`

To run the test suite:

`npm test`

# Stock Price Checker

The initial boilerplate for this app can be found at https://github.com/freeCodeCamp/boilerplate-project-stockchecker

Instructions for building the project can be found at https://freecodecamp.org/learn/information-security/information-security-projects/stock-price-checker
