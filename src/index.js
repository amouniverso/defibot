'use strict';
const ccxt = require ('ccxt');
const chalk = require ('chalk');

const log = console.log
const createTable = (exchanges, prices, colCount) => {
    const result = []
    for (let i = 0; i < exchanges.length; i += colCount) {
        result.push(
            exchanges.reduce((accumRow, currRow, indexRow, arrayRow) => {
                return ({...accumRow, [currRow.id]: arrayRow.slice(i, i + colCount).reduce((accumCol, currCol) => {
                        let priceRatio = prices[currRow.id].price / prices[currCol.id].price
                        priceRatio = (((priceRatio >= 1 ? priceRatio: 1/priceRatio) - 1) * 100).toFixed(4)
                        priceRatio = priceRatio > 1 ? priceRatio : '<=1'
                        const priceDiff = currRow.id !== currCol.id ? `${priceRatio}%` : ''
                        return {...accumCol, [currCol.id]: priceDiff}
                    }, {})})
            }, {})
        )
    }
    return result
}

(async function () {
    console.log(chalk.green('============= DeFi combat bot ============'))
    console.log(chalk.green('============= Initializing... ============\n'))

    const blacklistExchanges = ['bitflyer', 'bithumb', 'bitstamp', 'btcalpha', 'buda', 'btcmarkets', 'coinmate',
        'huobijp', 'coinone', 'kuna', 'mercado', 'luno', 'therock', 'tidex', 'ripio', 'yobit', 'zipmex', 'okex',
        'okx', 'okex5', 'binanceus', 'kraken', 'bitfinex2', 'timex', 'blockchaincom', 'coinbase', 'alpaca', 'woo',
        'hollaex']
    const pair = 'SAND/USDT'
    let exchanges = ccxt.exchanges.map(ex => {
        return !blacklistExchanges.includes(ex) ? new ccxt[ex]() : null
    }).filter(el => el)
    console.log('Loading markets...')
    await Promise.all(exchanges.map(exchange => exchange.loadMarkets()))
    exchanges = exchanges.filter(el => el.symbols.includes(pair))
    console.log('Markets loaded. Num of valid exchanges: ', exchanges.length, '\n')

    let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));
    log('Loading volume...')
    const tickers = await Promise.all(
        exchanges.map(exchange => exchange.fetchTicker(pair)
    ))
    console.log('Quote volume for ' + pair + ':')
    tickers.forEach((el, index) => {
        console.log(exchanges[index].id + ':',
            chalk.green(new Intl.NumberFormat('en-US').format(el.quoteVolume), pair.split('/')[1])
        )
    })
    // while (true) {
        log('\nLoading trades...')
        const trades = await Promise.all(
            exchanges.map(exchange => exchange.fetchTrades (pair, undefined, 1)
        ))
        const prices = {}
        trades.forEach((trade, index) => {
            const lastTrade = trade[trade.length - 1]
            const {price, symbol} = lastTrade ? lastTrade : {}
            prices[exchanges[index].id] = {price, symbol}
        })
        console.log(pair + ':')
        createTable(exchanges, prices, 9).forEach(page => {
            console.table(page)
        })
        process.stdout.write('\n')
        // await sleep (10000) // milliseconds
    // }
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