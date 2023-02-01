'use strict';
const ccxt = require ('ccxt');

(async function () {
    console.log(ccxt.exchanges.length, ccxt.exchanges)
    // let bitfinex  = new ccxt.bitfinex ({ verbose: true })
    let binance = new ccxt.binance ({
        // apiKey: 'YOUR_PUBLIC_API_KEY',
        // secret: 'YOUR_SECRET_PRIVATE_KEY',
    })

    console.log(binance.id)
    await binance.loadMarkets()
    // console.log(binance)
    // console.log(binance.symbols)
    // console.log(binance.markets['AAVE/USDT'])
    let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));
    while (true) {
        const trades = await binance.fetchTrades ('BTC/USDT', undefined, 1)
        // console.log(trades)
        const {price, symbol} = trades[trades.length - 1]
        console.log(symbol, price)
        await sleep (binance.rateLimit) // milliseconds
    }


    // console.log (kraken.id,    await kraken.loadMarkets ())
    // console.log (bitfinex.id,  await bitfinex.loadMarkets  ())
    // console.log (huobipro.id,  await huobipro.loadMarkets ())
    //
    // console.log (kraken.id,    await kraken.fetchOrderBook (kraken.symbols[0]))
    // console.log (bitfinex.id,  await bitfinex.fetchTicker ('BTC/USD'))
    // console.log (huobipro.id,  await huobipro.fetchTrades ('ETH/USDT'))
    //
    // console.log (okcoinusd.id, await okcoinusd.fetchBalance ())
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