const {initDriver,getdriver} = require("../../neo4j");
const neo4j = require("neo4j-driver");
// const {createAccount} = require("../../stripe/utils/utils");
const NodeCache = require( "node-cache" );
const myCache = new NodeCache({ stdTTL: 0, checkperiod: 30});

exports.getActivist = async(req,res,next)=>{
    if(myCache.get("ac")){
        return res.status(200).json(myCache.get("ac-All"))
    }
    const wallet = req.params.wallet;
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
            database: 'Hero',
            defaultAccessMode: neo4j.session.READ
    })
    var result = await session.run("match(a:Activist{wallet:$wallet})-[:PART_OF]->(g:Groupe) return g,a",{
        wallet
    });
    const gNode = result.records[0].get(0);
    const aNode = result.records[0].get(1);
    const data = {
        ...aNode.properties,
        balance:gNode.properties.balance/gNode.properties.members
    }
    myCache.set("ac",data);
    return res.status(200).json(data);
}

exports.getTransactions = async(req,res,next)=>{
    const wallet = req.params.wallet;
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
            database: 'Hero',
            defaultAccessMode: neo4j.session.READ
    })
    const result = await session.run("match(c:Activist{wallet:$wallet})-[:PART_OF]->(g:Groupe) match(t:Transaction{To:g.Name}) return t",{
        wallet
    });
    let transactions=[];
     result.records.map(record => transactions.push(record.get(0).properties) )
    return res.status(200).json(transactions)
}

exports.getActivists= async(req,res,next)=>{
    if(myCache.get("ac-all")){
        return res.status(200).json(myCache.get("ac-all"));
    }
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
            database: 'Hero',
            defaultAccessMode: neo4j.session.READ
    })
    var result = await session.run("match(a:Activist) return a");
    let activists = [];
    result.records.map(record => activists.push(record.get(0).properties) )
    myCache.set("ac-all",activists)
    return res.status(200).json(activists)

}

exports.addMedia = async(req,res,next)=>{
     const {email,url} = req.body;

     await initDriver();
    var driver = getdriver();
    var session = driver.session({
            database: 'Hero',
            defaultAccessMode: neo4j.session.WRITE
    })
    await session.run("match(a:Activist{email:$email})set a.Media=a.Media+$media",{
        email,
        media:url
    });
    return res.status(200).json("Media added successfully !")
}