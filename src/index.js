'use strict';
const ccxt = require ('ccxt');

const sliceIntoChunks = (arr, chunkSize) => {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}

const createTable = (exchanges, prices) => {
    return exchanges.reduce((accumRow, currRow, indexRow, arrayRow) => {
        return ({...accumRow, [currRow.id]: arrayRow.reduce((accumCol, currCol) => {
                let priceRatio = prices[currRow.id].price / prices[currCol.id].price
                priceRatio = priceRatio <= 1 ? 1 - priceRatio : -(1 - 1/priceRatio)
                const priceDiff = currRow.id !== currCol.id ? `${(priceRatio * 100).toFixed(4)}%` : ''
                return {...accumCol, [currCol.id]: priceDiff}
            }, {})})
    }, {})
}

(async function () {
    console.log('============= DeFi combat bot ============')
    console.log('============= Initializing... ============\n')

    const unavailableExchanges = ['bitflyer', 'bithumb', 'bitstamp', 'btcalpha', 'buda', 'btcmarkets', 'coinmate',
        'huobijp', 'coinone', 'kuna', 'mercado', 'luno', 'therock', 'tidex', 'ripio', 'yobit', 'zipmex', 'okex',
        'okx', 'okex5', 'binanceus', 'kraken', 'bitfinex2', 'timex', 'blockchaincom', 'coinbase', 'alpaca']
    const pair = 'ETH/USDT'
    let exchanges = ccxt.exchanges.map(ex => {
        return !unavailableExchanges.includes(ex) ? new ccxt[ex]() : null
    }).filter(el => el)
    console.log('Loading markets...')
    await Promise.all(exchanges.map(exchange => exchange.loadMarkets()))
    exchanges = exchanges.filter(el => el.symbols.includes(pair))
    console.log('Markets loaded. Num of valid exchanges: ', exchanges.length, '\n')

    let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));
    while (true) {
        const trades = await Promise.all(
            exchanges.map(exchange => exchange.fetchTrades (pair, undefined, 1)
        ))
        const prices = {}
        trades.forEach((trade, index) => {
            const {price, symbol} = trade[trade.length - 1]
            prices[exchanges[index].id] = {price, symbol}
        })
        console.log(pair + ':')
        sliceIntoChunks(exchanges, 9).forEach(el => {
            console.table(createTable(el, prices))
        })
        process.stdout.write('\n')
        await sleep (10000) // milliseconds
    }
    //
    // // sell 1 BTC/USD for market price, sell a bitcoin for dollars immediately
    // console.log (okcoinusd.id, await okcoinusd.createMarketSellOrder ('BTC/USD', 1))
    //
    // // buy 1 BTC/USD for $2500, you pay $2500 and receive ฿1 when the order is closed
    // console.log (okcoinusd.id, await okcoinusd.createLimitBuyOrder ('BTC/USD', 1, 2500.00))
    //
    // // pass/redefine custom exchange-specific order params: type, amount, price or whatever
    // // use a custom order type
    // bitfinex.createLimitSellOrder ('BTC/USD', 1, 10, { 'type': 'trailing-stop' })

}) ();