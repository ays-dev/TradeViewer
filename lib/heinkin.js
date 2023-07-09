const HeikinAshi = require("heikinashi");

/**
 * Simply convert to Heinkin
 */
const convertToHeinkin = (results) => {
    return HeikinAshi(results);
};

module.exports = {
    convertToHeinkin
};