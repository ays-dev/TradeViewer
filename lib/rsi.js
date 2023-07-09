const { RSI } = require('technicalindicators');

const RSI_WINDOW = 14;

/**
 * Add RSI to history
 * Let first RSI_WINDOW values be 0
 */
const addRSI = (candlesHistory) => {
    const index = RSI.calculate({
        values: candlesHistory.map(a => {
            return a.close;
        }),
        period: RSI_WINDOW
    });
    return candlesHistory.map((a, k) => {
        if (k > RSI_WINDOW - 1) {
            return {
                timestamp: a.timestamp,
                open: a.open,
                high: a.high,
                low: a.low,
                close: a.close,
                rsi14: index[k - RSI_WINDOW]
            };
        }
        return {
            timestamp: a.timestamp,
            open: a.open,
            high: a.high,
            low: a.low,
            close: a.close,
            rsi14: 0
        };
    });
};

module.exports = {
    addRSI
};