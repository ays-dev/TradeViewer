/**
 * Here's the magick of detecting oscillations of RSI between
 * two signals SHORT and LONG
 * It's starting FLAT. Return trades with theirs respective profits
 * and an array of details indicating state of trade at each step
 */
const oscillation = (candlesHistory) => {
    let position = 'FLAT';
    let holdingPeriod = 0;
    const results = [];
    let details = [];
    let entryPrice = null;
    let profit = 0;

    for (const [key, candle] of candlesHistory.entries()) {
        /**
         * If last candle is above 70 and current rsi start descending and position is not already SHORT
         */
        if (candlesHistory[key - 1]?.rsi14 > 70 && candlesHistory[key - 1]?.rsi14 > candle.rsi14 && position !== 'SHORT') {
            results.push({
                ...candle,
                details,
                position,
                holdingPeriod,
                profit,
                entryPrice
            });
            entryPrice = candle.close;
            details = [];
            profit = 0;
            holdingPeriod = 0;
            position = 'SHORT';
        }
        /**
         * If last candle is below 30 and current rsi start ascending and position is not already LONG
         */
         if (candlesHistory[key - 1]?.rsi14 < 30 && candlesHistory[key - 1]?.rsi14 < candle.rsi14 && position !== 'LONG') {
            results.push({
                ...candle,
                details,
                position,
                holdingPeriod,
                profit,
                entryPrice
            });
            entryPrice = candle.close;
            details = [];
            profit = 0;
            holdingPeriod = 0;
            position = 'LONG';
        }

        if (position === 'SHORT') {
            profit = entryPrice - candle.close;
        }
        if (position === 'LONG') {
            profit = candle.close - entryPrice;
        }

        holdingPeriod += 1;

        live = {
            ...candle,
            position,
            holdingPeriod,
            profit,
            entryPrice,
            live: true
        };
        details.push(live);
    }
    return [
            ...results, {
                ...live,
                details
            }
        ];
};

module.exports = {
    oscillation
};