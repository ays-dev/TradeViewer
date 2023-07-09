const { BitmexAPI } = require('bitmex-node');

const bitmex = new BitmexAPI({
    testnet: true,
    apiKeyID: "XXXXXXX",
    apiKeySecret: "XXXXXXX"
});

const LEVERAGE = 60;
const AMOUNT_PER_TRADE = 8000;

/**
 * Gamble trade
 * Play it twice if a trade was already opened (supposedly in the opposite direction)
 */
const gamble = async (trade) => {
    console.log(trade);
    try {
        await bitmex.Order.cancelAll({
            symbol: "XBTUSD",
        });
        await bitmex.Position.updateLeverage({
            symbol: "XBTUSD",
            leverage: LEVERAGE,
        });
        const lastPosition = await bitmex.Position.get({
            symbol: "XBTUSD",
        });
        if (lastPosition[0]?.isOpen) {
            await bitmex.Order.new({
                symbol: "XBTUSD",
                side: trade.position === "SHORT" ? "Sell" : "Buy",
                orderQty: AMOUNT_PER_TRADE,
                ordType: "Market",
            });
        }
        await bitmex.Order.new({
            symbol: "XBTUSD",
            side: trade.position === "SHORT" ? "Sell" : "Buy",
            orderQty: AMOUNT_PER_TRADE,
            ordType: "Market",
        });
    } catch (err) {
        console.log(err);
    }
};

/**
 * An exit position had been set on the last trade
 * If a trade was already opened, open a trade in the opposite direction
 */
const exitPosition = async (trade) => {
    try {
        await bitmex.Order.cancelAll({
            symbol: "XBTUSD",
        });
        await bitmex.Position.updateLeverage({
            symbol: "XBTUSD",
            leverage: LEVERAGE,
        });
        const lastPosition = await bitmex.Position.get({
            symbol: "XBTUSD",
        });
        if (lastPosition[0]?.isOpen) {
            console.log(trade);
            await bitmex.Order.new({
                symbol: "XBTUSD",
                side: trade.position === "SHORT" ? "Buy" : "Sell",
                orderQty: AMOUNT_PER_TRADE,
                ordType: "Market",
            });
        }
    } catch (err) {
        console.log(err);
    }
};

module.exports = {
    gamble,
    exitPosition
}