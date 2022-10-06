const {initDriver,getdriver} = require("../../neo4j");
const neo4j = require("neo4j-driver");
const NodeCache = require( "node-cache" );
const myCache = new NodeCache({ stdTTL: 0, checkperiod: 30});
const getTime = require("../../utils/getTime");
const aes256 = require("aes256");
const handlebars = require("handlebars");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const fs = require("fs");
const path = require("path");
let Datastore = require("nedb");

const data = new Datastore({
  filename: 'data.db',
  autoload: true,
})

const createTransporter = async () => {
    const oauth2Client = new OAuth2(
      "112603853738-firv146ngs4te6uonb9s25bnk6a77bk3.apps.googleusercontent.com",
      "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",
      "https://developers.google.com/oauthplayground"
    );
  
    oauth2Client.setCredentials({
      refresh_token: "1//04WFBIcSeac0NCgYIARAAGAQSNwF-L9IrhMZted2r55axHJdBNsEzFAEC7ue7ehloeMSHtmUzjOlNWsR4cmVWQkP2wZKhpOI6Roo"
    });
  
    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject();
        }
        resolve(token);
      });
    });
  
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "hi@hero-labs.co",
        accessToken,
        clientId: "1//04WFBIcSeac0NCgYIARAAGAQSNwF-L9IrhMZted2r55axHJdBNsEzFAEC7ue7ehloeMSHtmUzjOlNWsR4cmVWQkP2wZKhpOI6Roo",
        clientSecret: "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",
        refreshToken: "1//04WFBIcSeac0NCgYIARAAGAQSNwF-L9IrhMZted2r55axHJdBNsEzFAEC7ue7ehloeMSHtmUzjOlNWsR4cmVWQkP2wZKhpOI6Roo"
      }
    });
  
    return transporter;
  };

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


}
const x =await session.run(`match(p:Post{id:$postId}) return p`,{
    postId
   });
return res.status(200).json(x.records);

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
    var {newPassword,email,code} = req.body;

    email = email.trim();
    newPassword = newPassword.trim();
    console.log(newPassword,email);
    console.log(code);
    var key = email+"+-*/"+newPassword;
    try{

        const codeDoc= await new Promise((resolve, reject) => { 
             data.find({code:parseInt(code),email:email},function(err,doc)
        {
            resolve(doc);
        })
         }
        )
        console.log(codeDoc.length);
        if(codeDoc.length == 0){
            console.log("Invalid code check your email !");
            return res.status(400).json("Invalid code check your email !");
        }
        const validtime = codeDoc[0].date+3600;
        const currentDate = new Date().getTime();
        if(validtime> currentDate){
            console.log("Session closed !");
            return res.status(400).json("Session closed !");
            
        }


        await initDriver();
        var driver = getdriver();
        var session = driver.session({
                database: process.env.DBNAME ||'Hero'
        })
        var result = await session.run("match(c:Customer{email:$email}) return c",{
            email
        });
        if (result.records.length==0){ 
            console.log("Email not found");
            return res.end(JSON.stringify({found:"Email not found"}));
      
        }
        var Customer = result.records[0].get("c").properties;
          
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



exports.getCode = async(req,res,next)=>{
    const email = req.body.email;

    try{
        await initDriver();
        var driver = getdriver();
        var session = driver.session({
                database: process.env.DBNAME ||'Hero'
        }) ;
        const result = await session.run("match(c:Customer{email:$email}) return c",{
            email
        });
        if(result.records.length ==0){
            return res.status(400).json("A user with this email couldn't be found !");
        }else{
            const user = result.records[0].get("c").properties;

            const sendEmail = async (emailOptions) => {
                let emailTransporter = await createTransporter();
                await emailTransporter.sendMail(emailOptions);
            };
            const html = fs.readFileSync(path.join(__dirname,"emailTemplates","resetPassword.html"), 'utf8');
            var handlebarsTemplate = handlebars.compile(html);
            var Code = Math.floor(Math.random() * 10000);
            data.insert({email:email,code:Code,type:"Password Reset",date:new Date().getTime()}, function (err, newDoc) {   // Callback is optional
                console.log(newDoc);
              });
            var handlebarsObj = {
                title:"Password reset From Hero!",
                fullname:user.name,
                link:"https://herocircle.app/lostPassword?code="+Code+"&email="+email
            };
            var compiledData = handlebarsTemplate(handlebarsObj)
            sendEmail({
                subject: "Password Reset !",
                html:compiledData,
                text:"Password Reset !",
                to: user.email,
                from: "hi@hero-labs.co"
              });

            return res.status(200).json("Email sent successfully !")

        }
    }catch(err){
        return res.status(500).json(err)
    }
}

