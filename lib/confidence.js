const STOP_LOSS = 800;
const TAKE_PROFIT = 300;

const optimize = (results) => {
    for (const [key, trade] of results.entries()) {
        let deltaRSICumul = 0;
        let optimizing = true;

        for (const [index, detail] of trade.details.entries()) {
            if (key && optimizing) {
                /**
                 * If stop loss reached stop optimize this trade and set informations
                 * about exit profit and date
                 */
                if (detail.profit < -STOP_LOSS) {
                    results[key].exitProfit = -STOP_LOSS;
                    results[key].exitDate = detail.timestamp;
                    results[key].profit = -STOP_LOSS;

                    optimizing = false;
                    break;
                }
                /**
                 * Start computing confidence for all
                 * steps of this trade
                 */
                let deltaRSI;

                if (trade.position === 'LONG') {
                    deltaRSI = (detail.rsi14 - trade.details[index - 1]?.rsi14);
                } else {
                    deltaRSI = (trade.details[index - 1]?.rsi14 - detail.rsi14);
                }

                if (typeof deltaRSI === 'number' && deltaRSI) {
                    deltaRSI = deltaRSI * detail.profit;
                    if (detail.profit > 0) {
                        deltaRSICumul = deltaRSI + deltaRSICumul;
                    } else {
                        deltaRSICumul = deltaRSICumul - deltaRSI;
                    }
                }
                /**
                 * Applying set of rules about confidence and
                 * various price configurations and our two vars STOP_LOSS
                 * and TAKE_PROFIT. This rules can be randomly choosed and optimized !
                 */
                let confidence = Math.ceil(deltaRSICumul / trade.entryPrice * 100);
                if (confidence >= 36 && detail.profit >= TAKE_PROFIT * 2) {
                    results[key].exitProfit = detail.profit;
                    results[key].exitDate = detail.timestamp;
                    results[key].profit = detail.profit;
                    optimizing = false;
                    break;
                }
                if (confidence >= 28 && detail.profit <= -100) {
                    results[key].exitProfit = detail.profit;
                    results[key].exitDate = detail.timestamp;
                    results[key].profit = detail.profit;
                    optimizing = false;
                    break;
                }
                if (confidence <= -14) {
                    results[key].exitProfit = detail.profit;
                    results[key].exitDate = detail.timestamp;
                    results[key].profit = detail.profit;
                    optimizing = false;
                    break;
                }
                if (confidence < 12 && detail.profit >= TAKE_PROFIT * 2) {
                    results[key].exitProfit = detail.profit;
                    results[key].exitDate = detail.timestamp;
                    results[key].profit = detail.profit;
                    optimizing = false;
                    break;
                }
                if (confidence >= 36 && detail.profit > TAKE_PROFIT) {
                    results[key].exitProfit = detail.profit;
                    results[key].exitDate = detail.timestamp;
                    results[key].profit = detail.profit;
                    optimizing = false;
                    break;
                }
                if (confidence >= 21 && detail.profit > 0 && detail.profit < TAKE_PROFIT) {
                    results[key].exitProfit = detail.profit;
                    results[key].exitDate = detail.timestamp;
                    results[key].profit = detail.profit;
                    optimizing = false;
                    break;
                }
            }
        }
    }
    return results;
}

module.exports = {
    optimize
}