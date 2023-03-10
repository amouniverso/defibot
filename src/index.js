'use strict';
const ccxt = require ('ccxt');
const chalk = require ('chalk');

const initialParams = {
    // PAIR: 'BTC/USDT',
    VOLUME_LIMIT: 200000,
    BLACKLISTED_EXCHANGES: ['bitflyer', 'bithumb', 'bitstamp', 'btcalpha', 'buda', 'btcmarkets', 'coinmate',
        'huobijp', 'coinone', 'kuna', 'mercado', 'luno', 'therock', 'tidex', 'ripio', 'yobit', 'zipmex', 'okex',
        'okx', 'okex5', 'binanceus', 'kraken', 'bitfinex2', 'timex', 'blockchaincom', 'coinbase', 'alpaca', 'woo',
        'hollaex', 'bitpanda', 'bitmart', 'phemex']
}

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
                        if (priceRatio > 1) {
                            return {...accumCol, [currCol.id]: priceDiff}
                        } else {
                            return {...accumCol}
                        }
                    }, {})})
            }, {})
        )
    }
    return result
}

(async function () {
    log(chalk.green('============= DeFi combat bot ============'))
    log(chalk.green('============= Initializing... ============\n'))
    log(initialParams)

    let exchanges = ccxt.exchanges.map(ex => {
        return !initialParams.BLACKLISTED_EXCHANGES.includes(ex) ? new ccxt[ex]() : null
    }).filter(el => el)

    log('Loading markets...')
    await Promise.all(exchanges.map(exchange => exchange.loadMarkets()))
    log('Markets loaded.\n')
    const binancePairs = exchanges.find(el=>el.id === 'binance').symbols.filter(el=>el.includes('USDT'))
    for (const [i, pair] of binancePairs.entries()) {
        try {
            log(pair + ' pair scanning...', chalk.blue((i + 1) + ' of ' + binancePairs.length))
            let filteredExchanges = exchanges.filter(el => el.symbols.includes(pair))
            log('Num of valid exchanges: ', filteredExchanges.length)
            log('Loading volume...')
            const tickers = await Promise.all(filteredExchanges.map(exchange => exchange.fetchTicker(pair)))

            const volumeLog = []
            tickers.forEach((ticker, index) => {
                const volume = ticker.quoteVolume
                const exchange = filteredExchanges[index]
                if (volume >= initialParams.VOLUME_LIMIT) {
                    volumeLog.push(exchange.id + ':' + chalk.green(new Intl.NumberFormat('en-US').format(volume) + pair.split('/')[1]))
                } else {
                    filteredExchanges[index] = null
                }
            })
            filteredExchanges = filteredExchanges.filter(ex => ex)
            log('Num of valid exchanges after volume filter: ', filteredExchanges.length)
            log('Loading trades...')
            const trades = await Promise.all(
                filteredExchanges.map(exchange => exchange.fetchTrades(pair, undefined, 1)
                ))
            const prices = {}
            trades.forEach((trade, index) => {
                const lastTrade = trade[trade.length - 1]
                const {price, symbol} = lastTrade ? lastTrade : {}
                prices[filteredExchanges[index].id] = {price, symbol}
            })
            let hasOpportunities = false
            createTable(filteredExchanges, prices, 9).forEach(page => {
                if (Object.values(page).some(rowValue => Object.keys(rowValue).length)) {
                    console.table(page)
                    hasOpportunities = true
                }
            })
            if (hasOpportunities) {
                log('Quote 24h volume for ' + pair + ':')
                volumeLog.forEach(el => {
                    log(el)
                })
            } else {
                log('Nothing.')
            }
            process.stdout.write('\n')
        } catch (e) {
            log(chalk.red(e))
        }
    }
}) ();