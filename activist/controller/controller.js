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
            database: process.env.DBNAME ||'Hero',
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
            database: process.env.DBNAME ||'Hero',
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
            database: process.env.DBNAME ||'Hero',
            defaultAccessMode: neo4j.session.READ
    })
    var result = await session.run("match(a:Activist) return a");
    let activists = [];
    result.records.map(record => activists.push(record.get(0).properties) )
    myCache.set("ac-all",activists)
    return res.status(200).json(activists)

}
exports.getActivistByAccID = async(req,res,next)=>{
    const accountId = req.body.accountId;
    await initDriver();

    var driver = getdriver();
    var session = driver.session({
        database: process.env.DBNAME ||'Hero',
        defaultAccessMode: neo4j.session.WRITE
})
    var result = await session.run("match(a:Activist{accountId:$accountId})-[]-(c:Moments) return a.Name as name,a.accountId as username,a.address as address,a.description as description,a.Socials as Socials,a.Media as video,a.videoPoster as videoPoster,c.description as historicMoments",{accountId});
    var result1 = await session.run("match(a:Activist{accountId:$accountId})-[]-(c:Groupe) return c.Name ",{accountId});

    let Memories=[]
    result.records?.map(record => Memories.push(record._fields[7]) )
    let activist={}
    if (Memories.length==0)
    {       var result = await session.run("match(a:Activist{accountId:$accountId}) return a.Name as name,a.accountId as username,a.address as address,a.description as description,a.Socials as Socials,a.Media as video,a.videoPoster as videoPoster",{accountId});
        
        activist = {
            name: result.records[0]._fields[0],
        username: result.records[0]._fields[1],
        address: result.records[0]._fields[2],
        description:
        result.records[0]._fields[3],
        socialNetworks: JSON.parse(result.records[0]._fields[4]),
        video: result.records[0]._fields[5],
        videoPoster: result.records[0]._fields[6],
        historicMoments: Memories,
        nextMoment:
          "Don’t miss out on the next one! Support this Circle and acces exclusive updates.",
        circle : result1.records[0]._fields[0]
    
        };
        return res.status(200).json(activist)

    }
    activist = {
        name: result.records[0]._fields[0],
    username: result.records[0]._fields[1],
    address: result.records[0]._fields[2],
    description:
    result.records[0]._fields[3],
    socialNetworks: JSON.parse(result.records[0]._fields[4]),
    video: result.records[0]._fields[5],
    videoPoster: result.records[0]._fields[6],
    historicMoments: Memories,
    nextMoment:
      "Don’t miss out on the next one! Support this Circle and acces exclusive updates.",

    };

    return res.status(200).json(activist)

}

exports.addMedia = async(req,res,next)=>{
     const {email,url,desc,title,typeMedia} = req.body;
    const id = uniqid();
     await initDriver();
    var driver = getdriver();
    var session = driver.session({
            database: process.env.DBNAME ||'Hero',
            defaultAccessMode: neo4j.session.WRITE
    })
    await session.run("merge(p:Post{id:$id,title:$title,description:$desc,media:$url,time:$time,type:$typeMedia}) with p as p match(a:Activist{email:$email}) merge(a)-[:CREATED]->(p)",{
        title,
        url:url || "",
        email,
        desc,
        id,
        time:getTime(),
        typeMedia:typeMedia|| ""
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
            database: process.env.DBNAME ||'Hero'
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
        await session.run(`match(c:Activist{email:$email})match(p:Post{id:$postId})set p.dislikes=p.dislikes-1 with p match (c)-[t:DISLIKE]->(p) detach delete t`,{
            email,
            postId,
            type
        });
    }else{
        await session.run(`match(c:Activist{email:$email})match(p:Post{id:$postId})set p.likes=p.likes-1 with p match (c)-[t:LIKE]->(p) detach delete t`,{
            email,
            postId,
            type
        });
    }
       
       return res.status(200).json("Reaction deleted successfully !");
   }else{
    var l = "likes";

    if(type !== "LIKE"){
        l="dislikes"
    }
       await session.run(`match(c:Activist{email:$email})match(p:Post{id:$postId})set p.${l}=p.${l}+1 merge(c)-[:${type}]->(p)`,{
           email,
           postId,
           type
       });
       await session.run(`match(p:Post{id:$postId})set p.${l}=p.${l}+1`,{
        postId
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
            database: process.env.DBNAME ||'Hero'
    })
   await session.run("match(a:Activist{email:$email})match(p:Post{id:$postId}) merge (a)-[:COMMENTED{comment:$comment,time:$time,creator:$email}]->(p)",{
    postId,
    email,
    comment,
    time:getTime()
   })
   await session.run("match(p:Post{id:$postId})set p.comments=p.comments+1 ",{
    postId
   })
   return res.status(200).json("Comment Added successfully !")
   }