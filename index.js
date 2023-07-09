const express = require('express');
const axios = require('axios');
const { addRSI } = require('./lib/rsi');
const { convertToHeinkin } = require('./lib/heinkin');
const { oscillation } = require('./lib/oscillation');
const { gamble, exitPosition } = require('./lib/trade');
const { optimize } = require('./lib/confidence');

const app = express();
const PORT = 3002;

app.listen(PORT, () => {
  console.log(`Listening : http://127.0.0.1:${PORT}/`);
  console.log(`API : http://127.0.0.1:${PORT}/api`);
});

let history = [];
let trades = [];

/**
 * Each 10 secondes for each multiple of 5 minutes
 */
setInterval(() => {
    if (String(new Date().getMinutes()).endsWith('5') || String(new Date().getMinutes()).endsWith('0')) {
      fetchData();
    }
}, 10000);

/**
 * Get data from bitmex public API
 * Set history or append last candle to history if new candle arrive
 * Compute Heinkin, RSI, get all oscilations and gamble when new oscillation detected
 * or close trade when new exitDate
 */
 const fetchData = () => {
  axios.get('http://www.bitmex.com/api/v1/trade/bucketed?binSize=1h&partial=false&symbol=XBTUSD&count=750&reverse=true')
    .then(function (response) {
      console.log('Fetching...');
      if (!history.length) {
        history = response.data.sort((a, b) => {
          return new Date(a.timestamp) - new Date(b.timestamp);
        });
        console.log(`Fetched last ${history.length} candles`);
      } else if (history[history.length - 1].timestamp !== response.data[0].timestamp) {
        history.push(response.data.sort((a, b) => {
          return new Date(a.timestamp) - new Date(b.timestamp);
        })[response.data.length - 1]);
        console.log(`Appending last candle (${history.length})`);
      } else {
        return;
      }
      const heinkinHistory = convertToHeinkin(history);
      const rsiHistory = addRSI(heinkinHistory);
      trades = oscillation(rsiHistory);
      trades = optimize(trades);
      console.log(`Detected ${trades.length} oscillations`);
      if (trades[trades.length - 1].holdingPeriod === 1) {
        console.log(`Detected 1 new oscillation (${trades.length}) !`);
        // gamble(trades[trades.length - 1]);
      }
      if (trades[trades.length - 1].exitDate) {
        console.log(`Detected exit the position ;( (${trades[trades.length - 1].exitDate}) !`);
        // exitPosition(trades[trades.length - 1]);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

/**
* Call fetchData before first setInterval is triggered
*/
fetchData();

/**
 * Proxy last candles in API endpoint,
 * also perform backtest and trigger bitmex calls
 */
app.get('/api', (req, res) => {
  res.send({
      history,
      trades
  });
});

 /**
 * Serve chart that consume API
 */
 app.use(express.static('static'));
