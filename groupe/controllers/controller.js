const {initDriver,getdriver} = require("../../neo4j");
const neo4j = require("neo4j-driver");
const {createAccount} = require("../../stripe/utils/utils");
const { createTagsRelations } = require("../utils/util");
const NodeCache = require( "node-cache" );
const myCache = new NodeCache({ stdTTL: 0, checkperiod: 30});

exports.createGroup = async(req,res,next)=>{
    const {grName,grDesc,country,tags} = req.body;
    console.log("test")
    try {
        await initDriver();
        var driver = getdriver();
        var session = driver.session({
            database: 'Hero'
        })
        const test = await session
        var gr = await session.run("match(g:Groupe{Name:$grName})return g",{
            grName
        })
        console.log(gr)
        if(gr.records.length>0){
            return res.status(422).json("Groupe name already exists !");
        }
        console.log(gr.records.length)
        var account = await createAccount();
        if(!account){
            return res.status(500).send("stripe account creation failed !")
        }
        var result = await session.run("merge(g:Groupe{Name:$grName,Description:$grDesc,balance:$balance,accountId:$actId,members:$members})",{
            grName,
            grDesc,
            balance:0,
            actId:account.id,
            members:0
        })
        await createTagsRelations(grName,tags);
        await session.run("match(g:Groupe{Name:$grName}) match(l:Location{Name:$country}) merge(g)-[:LOCATED_IN]->(l)",{
            grName,
            country
        });
        return res.status(200).json("Groupe created Successfully !");
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          return err;
    }
}


exports.getGroupe = async(req,res,next)=>{
    const grName = req.params.grName;
    if(myCache.get("Get-Group")){
        return res.status(200).json(myCache.get("Get-Group"));
    }
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
            database: 'Hero',
            defaultAccessMode: neo4j.session.READ
    })
    const query = await session.run("match(g:Groupe{Name:$grName})return g",{
        grName
    })
    const singleRecord = query.records[0];
    const node = singleRecord.get(0);
    myCache.set("Get-Group",node.properties);
    return res.status(200).json(node.properties);
}
exports.getMembers = async(req,res,next)=>{
    const grName = req.params.grName;
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
            database: 'Hero',
            defaultAccessMode: neo4j.session.READ
    })
    var result = await session.run("match(a:Activist)-[:PART_OF]->(g:Groupe{Name:$grName}) return a",{
        grName
    })
    let activists = []
    result.records.map(record => activists.push(record.get(0).properties) )
    return res.status(200).json(activists);

}
exports.getSupporters = async(req,res,next)=>{
    const grName = req.params.grName;
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
            database: 'Hero',
            defaultAccessMode: neo4j.session.READ
    })
    var result = await session.run("match(c:Customer)-[:JOINED]->(g:Groupe{Name:$grName}) return c",{
        grName
    })
    let supporters = []
    result.records.map(record => {
        var supporter = {
            email:record.get(0).properties.email,
            customerId:record.get(0).properties.CustomerId,
            walletAddress: record.get(0).properties.walletAddress
        }
        supporters.push(supporter) 
    })
    return res.status(200).json(supporters);

}

exports.getAll = async(req,res)=>{
    try {
        await initDriver();
        var driver = getdriver();
        var session = driver.session({
            database: 'Hero'
        })
        let groups=[];
        const {tags,locations} = req.body;
        if(tags.length==0 && locations.length != 0){
            var result = await session.run("unwind $locations as loc match(g:Groupe)-[:LOCATED_IN]->(l:Location{Name:loc}) return g",{
                locations
            })
        
            result.records.map(record => groups.push(record.get(0).properties) )
            return res.status(200).json(groups);
        }
        if(locations.length==0 &&  tags.length != 0){
            var result = await session.run("unwind $tags as tag match(g:Groupe)-[:INTEREST]->(t:Tag{Name:tag}) return g",{
                tags
            })
        
            result.records.map(record => groups.push(record.get(0).properties) )
            return res.status(200).json(groups);
        }
        else if(locations.length != 0 && tags.length != 0){
            var result = await session.run("unwind $tags as tags unwind $locations as loc match(t:Tag{Name:tags})<-[:INTEREST]-(g:Groupe)-[:LOCATED_IN]->(l:Location{Name:loc}) return g",{
                tags,
                locations
            })
        
            result.records.map(record => groups.push(record.get(0).properties) )
            return res.status(200).json(groups);
        }else{
            var result = await session.run("match(g:Groupe)return g");
            result.records.map(record => groups.push(record.get(0).properties) );
            return res.status(200).json(groups);
        }
    } catch (err) {
        console.log(err)
    }
}

exports.addMedia = async(req,res,next)=>{
    const {grName,url} = req.body;

    await initDriver();
   var driver = getdriver();
   var session = driver.session({
           database: 'Hero',
           defaultAccessMode: neo4j.session.WRITE
   })
   await session.run("match(g:Groupe{Name:$grName})set g.Media=g.Media+$media",{
       grName,
       media:url
   });
   return res.status(200).json("Media added successfully !")
}