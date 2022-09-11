const {initDriver,getdriver} = require("../../neo4j");
const neo4j = require("neo4j-driver");
const NodeCache = require( "node-cache" );
const myCache = new NodeCache({ stdTTL: 0, checkperiod: 30});
const getTime = require("../../utils/getTime");
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

exports.reactPost = async(req,res)=>{
 const  {type,postId,email} = req.body; 
 console.log(type);
 if(type !== "DISLIKE" || type !== "LIKE"){
    return res.status(400).json("Type not accepted !");
}
 await initDriver();
 var driver = getdriver();
 var session = driver.session({
         database: 'Hero'
 })

 const [q1,q2]= await Promise.all(
    [ await session.run(`match(c:Customer{email:$email})match(p:Post{id:$postId}) match(c)-[L:LIKE]->(p) return L`,{
      email,
      postId
  }),await session.run(`match(c:Customer{email:$email})match(p:Post{id:$postId}) match(c)-[L:DISLIKE]->(p) return L`,{
      email,
      postId
})])
const result = q2.records.length+q1.records.length;
console.log(result)
if(result>0){
    if(q2.records.length>q1.records.length){
        await session.run(`match(c:Customer{email:$email})match(p:Post{id:$postId}) match (c)-[t:DISLIKE]->(p) detach delete t`,{
            email,
            postId,
            type
        });
    }else{
        await session.run(`match(c:Customer{email:$email})match(p:Post{id:$postId}) match (c)-[t:LIKE]->(p) detach delete t`,{
            email,
            postId,
            type
        });
    }
       
       return res.status(200).json("Reaction deleted successfully !");
}else{
    await session.run(`match(c:Customer{email:$email}) match(p:Post{id:$postId}) merge(c)-[:${type}]->(p)`,{
        email,
        postId,
        type
    });
    return res.status(200).json("Reaction Added successfully !");
}
}


exports.commentPost = async(req,res)=>{
    const {comment,email,postId} = req.body;
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
            database: 'Hero'
    })
   await session.run("match(a:Customer{email:$email})match(p:Post{id:$postId}) merge (a)-[:COMMENTED{comment:$comment,time:$time}]->(p)",{
    postId,
    email,
    comment,
    time:getTime()
   })
   return res.status(200).json("Comment Added successfully !")
   }