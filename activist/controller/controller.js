const {initDriver,getdriver} = require("../../neo4j");
const neo4j = require("neo4j-driver");
// const {createAccount} = require("../../stripe/utils/utils");
const NodeCache = require( "node-cache" );
const myCache = new NodeCache({ stdTTL: 0, checkperiod: 30});
const uniqid = require("uniqid");
const getTime = require("../../utils/getTime");
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
     const {email,url,desc,title,typeMedia} = req.body;
    const id = uniqid();
     await initDriver();
    var driver = getdriver();
    var session = driver.session({
            database: 'Hero',
            defaultAccessMode: neo4j.session.WRITE
    })
    await session.run("merge(p:Post{id:$id,title:$title,description:$desc,media:$url,time:$time,type:$typeMedia}) with p as p match(a:Activist{email:$email}) merge(a)-[:CREATED]->(p)",{
        title,
        url,
        email,
        desc,
        id,
        time:getTime(),
        typeMedia
    });
    return res.status(200).json("Media added successfully !")
}

exports.reactPost = async(req,res)=>{
    const  {type,postId,email} = req.body; 
    console.log(type)
    if(type == "DISLIKE" || type == "LIKE"){

        await initDriver();
    var driver = getdriver();
    var session = driver.session({
            database: 'Hero'
    })
   
    const [q1,q2]= await Promise.all(
       [ await session.run(`match(a:Activist{email:$email})match(p:Post{id:$postId}) match(c)-[L:LIKE]->(p) return L`,{
         email,
         postId
     }),await session.run(`match(c:Activist{email:$email})match(p:Post{id:$postId}) match(c)-[L:DISLIKE]->(p) return L`,{
         email,
         postId
   })])
   const result = q2.records.length+q1.records.length;
   console.log(result)
   if(result>0){
    if(q2.records.length>q1.records.length){
        await session.run(`match(c:Activist{email:$email})match(p:Post{id:$postId}) match (c)-[t:DISLIKE]->(p) detach delete t`,{
            email,
            postId,
            type
        });
    }else{
        await session.run(`match(c:Activist{email:$email})match(p:Post{id:$postId}) match (c)-[t:LIKE]->(p) detach delete t`,{
            email,
            postId,
            type
        });
    }
       
       return res.status(200).json("Reaction deleted successfully !");
   }else{
       await session.run(`match(c:Activist{email:$email}) match(p:Post{id:$postId}) merge(c)-[:${type}]->(p)`,{
           email,
           postId,
           type
       });
       return res.status(200).json("Reaction Added successfully !");
   }

       
    }else{
        return res.status(400).json("Type not accepted !");
    }
    
   }


   exports.commentPost = async(req,res)=>{
    const {comment,email,postId} = req.body;
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
            database: 'Hero'
    })
   await session.run("match(a:Activist{email:$email})match(p:Post{id:$postId}) merge (a)-[:COMMENTED{comment:$comment,time:$time}]->(p)",{
    postId,
    email,
    comment,
    time:getTime()
   })
   return res.status(200).json("Comment Added successfully !")
   }