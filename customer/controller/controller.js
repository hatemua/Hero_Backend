const {initDriver,getdriver} = require("../../neo4j");
const neo4j = require("neo4j-driver");
const NodeCache = require( "node-cache" );
const myCache = new NodeCache({ stdTTL: 0, checkperiod: 30});

exports.getTransactions = async(req,res,next)=>{
    if(myCache.get("cu-tr")){
        return res.status(200).json(myCache.get("cu-tr"));
    }
    const wallet = req.params.wallet;
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
            database: 'Hero',
            defaultAccessMode: neo4j.session.READ
    })
    const result = await session.run("match(c:Customer{walletAddress:$wallet}) match(t:Transaction{From:c.CustomerId}) return t",{
        wallet
    });
    let transactions=[];
     result.records.map(record => transactions.push(record.get(0).properties) )
     myCache.set("cu-tr",transactions)
    return res.status(200).json(transactions)
}