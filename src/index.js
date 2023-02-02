'use strict';
const ccxt = require ('ccxt');
const {lbank} = require("ccxt");

(async function () {
    // console.log(ccxt.exchanges.length, ccxt.exchanges)
    console.log('============= DeFi combat bot ============')
    console.log('============= initializing... ============\n')
    // const exchanges = [
    //     new ccxt.binance ({
    //         // apiKey: 'YOUR_PUBLIC_API_KEY',
    //         // secret: 'YOUR_SECRET_PRIVATE_KEY',
    //     }),
    //     new ccxt.kucoin(),
    //     new ccxt.bitfinex(),
    //     // new ccxt.bitstamp(),
    //     // new ccxt.okx(),
    //     // new ccxt.bithumb(),
    //     new ccxt.bybit(),
    //     new ccxt.bitget(),
    //     // new ccxt.bitmex(),
    //     new ccxt.huobi(),
    //     new ccxt.gateio(),
    //     new ccxt.gemini(),
    //     new ccxt.cryptocom(),
    //     // new ccxt.bitflyer(),
    //     new ccxt.mexc(),
    //     new ccxt.bkex,
    //     new ccxt.lbank(),
    //     // new ccxt.coincheck(),
    //     new ccxt.upbit(),
    //
    //
    // ]
    const brokenExchanges = ['bitflyer', 'bithumb', 'bitstamp', 'btcalpha', 'buda', 'btcmarkets', 'coinmate',
        'huobijp', 'coinone', 'kuna', 'mercado', 'luno', 'therock', 'tidex', 'ripio', 'yobit', 'zipmex', 'okex',
        'okx', 'okex5', 'binanceus', 'coinbase']
    const exchanges = ccxt.exchanges.map(ex => {
        return !brokenExchanges.includes(ex) ? new ccxt[ex]() : null
    }).filter(el => el)
    console.log('loading markets...')
    await Promise.all(exchanges.map(exchange => exchange.loadMarkets()))
    console.log('markets loaded.\n')
    // console.log(binance)
    // console.log(binance.symbols)
    // console.log(exchanges[1].markets['AAVE/USDT'])
    let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));
    while (true) {
        const trades = await Promise.all(
            exchanges.map(exchange => exchange.fetchTrades ('BTC/USDT', undefined, 1)
        ))
        trades.forEach((trade, index) => {
            const {price, symbol} = trade[trade.length - 1]
            console.log(exchanges[index].id, symbol, price)
            // process.stdout.write(`${exchanges[index].id}, ${symbol}, ${price}; `);
        })
        const prices = trades.map((trade, index) => {
            const {price, symbol} = trade[trade.length - 1]
            return {id : exchanges[index].id, price, symbol}
        })
        // console.log(`${prices[0].id}/${prices[1].id}, ${((1 - (prices[0].price/prices[1].price)) * 100).toFixed(4)}%`)
        process.stdout.write('\n')
        await sleep (500) // milliseconds
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