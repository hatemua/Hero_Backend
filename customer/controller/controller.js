const {initDriver,getdriver} = require("../../neo4j");
const neo4j = require("neo4j-driver");
const NodeCache = require( "node-cache" );
const myCache = new NodeCache({ stdTTL: 0, checkperiod: 30});
const getTime = require("../../utils/getTime");
const aes256 = require("aes256");
const e = require("express");


exports.getTransactions = async(req,res,next)=>{
    if(myCache.get("cu-tr")){
        return res.status(200).json(myCache.get("cu-tr"));
    }
    const wallet = req.params.wallet;
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
            database: process.env.DBNAME ||'Hero',
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
 if(type == "DISLIKE" || type == "LIKE"){
 await initDriver();
 var driver = getdriver();
 var session = driver.session({
         database: process.env.DBNAME ||'Hero'
 })
 const [q1,q2]= await Promise.all(
    [ await session.run(`match(c:Customer{email:$email})match(p:Post{id:$postId}) match(c)-[L:LIKE]->(p) return L`,{
      email,
      postId,
      type
  }),
    await session.run(`match(c:Customer{email:$email})match(p:Post{id:$postId}) match(c)-[L:DISLIKE]->(p) return L`,{
    email,
    postId,
    type
})
])
const result = q1.records.length+q2.records.length;

if(result>0){
    if(q2.records.length>q1.records.length){
        await session.run(`match(c:Customer{email:$email})match(p:Post{id:$postId})set p.dislikes=p.dislikes-1 with p match (c)-[t:DISLIKE]->(p) detach delete t`,{
            email,
            postId
        })
    }else{
        await session.run(`match(c:Customer{email:$email})match(p:Post{id:$postId})set p.likes=p.likes-1 with p match (c)-[t:LIKE]->(p) detach delete t`,{
            email,
            postId,
            type
        });
    }
       
}else{
    var l = "likes";

    if(type !== "LIKE"){
        l="dislikes"
    }
       await session.run(`match(c:Customer{email:$email})match(p:Post{id:$postId}) merge(c)-[:${type}]->(p)`,{
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

exports.getSubscription = async(req,res)=>{
    try{
        await initDriver();
        var driver = getdriver();
        var session = driver.session({
            database: process.env.DBNAME ||'Hero'
        })
        const email = req.body.email;
        const result = await session.run("match(a:Customer{email:$email})-[l:JOINED]-(g:Groupe) return g,l",{
            email
        })
        
        var subscriptions=[];
        result.records.map(record => {
            subscriptions.push({
                amount:record.get(1).properties.amount || 0,
                dateJoined:record.get(1).properties.date || "",
                grName:record.get(0).properties.Name,
                grDescription:record.get(0).properties.Description
            })
        })
        return res.status(200).json(subscriptions)
    
    }catch(err){
        console.log(err.message)
    }
}
exports.getExistHeroID = async(req,res)=>{
    const {HeroID} = req.body;
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
            database: process.env.DBNAME ||'Hero'
    })
   const resultat =await session.run("match(a:Customer{HeroId:$HeroID}) return a",{
    HeroID
   })
   return res.status(200).json({subscribed:resultat.records.length});
}

exports.commentPost = async(req,res)=>{
    const {comment,email,postId} = req.body;
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
            database: process.env.DBNAME ||'Hero'
    })
   await session.run("match(a:Customer{email:$email})match(p:Post{id:$postId})set p.comments=p.comments+1 merge (a)-[:COMMENTED{comment:$comment,time:$time,creator:$email}]->(p)",{
    postId,
    email,
    comment,
    time:getTime()
   })
   return res.status(200).json("Comment Added successfully !")
   }


   exports.isSubscribed = async(req,res)=>{
    const {email,circlename} = req.body;
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
            database: process.env.DBNAME ||'Hero'
    })
   const result = await session.run("match (n:Customer{email:$email})-[c:JOINED]-(p:Groupe{Name:$circlename}) return n",{
    email:email,
    circlename:circlename
   })
   
   return res.status(200).json({subscribed:result.records.length})
   }

exports.changePassword = async(req,res)=>{
    var {oldPassword,newPassword,email} = req.body;
    email = email.trim();
    newPassword = newPassword.trim();
    oldPassword = oldPassword.trim();
    var key = email+"+-*/"+oldPassword;
    try{
        await initDriver();
        var driver = getdriver();
        var session = driver.session({
                database: process.env.DBNAME ||'Hero'
        })
        var result = await session.run("match(c:Customer{email:$email}) return c",{
            email
        });
        if (result.records.length==0){ 
            return res.end(JSON.stringify({found:"Email not found"}));
      
        }
        var Customer = result.records[0].get("c").properties;
        var decrypt = aes256.decrypt(key,Customer.password).toString();
        if(decrypt === oldPassword){
            var regularExpression  = /^(?=.*\d)(?=.*[a-z])(?=.*[a-z]).{8,}$/gm;
            if(!regularExpression.test(newPassword)){
                return res.status(200).json("Your new password must be at least 8 characters and should include a combination of letters and at least one number and one special character (!$@%+-*/)")
            }
            key = email+"+-*/"+newPassword.toString();
            var encrypt = aes256.encrypt(key,newPassword);
            console.log(encrypt)
            await session.run("match(c:Customer{email:$email}) set c.password=$encrypt",{
                email,
                encrypt
            })
            return res.status(200).json("Password updated Successfully !");
        }else{
            return res.status(400).json("Please check password!");
        }
        
    }catch(err){
        return res.status(500).json(err.message)
    }
}


exports.LostPassword = async(req,res)=>{
    var {newPassword,email} = req.body;
    email = email.trim();
    newPassword = newPassword.trim();
    var key = email+"+-*/"+newPassword;
    try{
        await initDriver();
        var driver = getdriver();
        var session = driver.session({
                database: process.env.DBNAME ||'Hero'
        })
        var result = await session.run("match(c:Customer{email:$email}) return c",{
            email
        });
        if (result.records.length==0){ 
            return res.end(JSON.stringify({found:"Email not found"}));
      
        }
        var Customer = result.records[0].get("c").properties;
        var decrypt = aes256.decrypt(key,Customer.password).toString();
            var regularExpression  = /^(?=.*\d)(?=.*[a-z])(?=.*[a-z]).{8,}$/gm;
            if(!regularExpression.test(newPassword)){
                return res.status(200).json("Your new password must be at least 8 characters and should include a combination of letters and at least one number and one special character (!$@%+-*/)")
            }
            key = email+"+-*/"+newPassword.toString();
            var encrypt = aes256.encrypt(key,newPassword);
            console.log(encrypt)
            await session.run("match(c:Customer{email:$email}) set c.password=$encrypt",{
                email,
                encrypt
            })
            return res.status(200).json("Password updated Successfully !");
     
        
    }catch(err){
        return res.status(500).json(err.message)
    }
}