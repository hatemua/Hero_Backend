const { initDriver, getdriver } = require("../../neo4j");
const neo4j = require("neo4j-driver");
const { createAccount } = require("../../stripe/utils/utils");
const { createTagsRelations } = require("../utils/util");
const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 0, checkperiod: 30 });
const uniqid = require("uniqid");
const getTime = require("../../utils/getTime");
const { checkProperties } = require("ethers/lib/utils");
exports.createGroup = async(req, res, next) => {
    const { grName, grDesc, country, tags } = req.body;
    console.log("test")
    try {
        await initDriver();
        var driver = getdriver();
        var session = driver.session({
            database: process.env.DBNAME || 'Hero'
        })
        const test = await session
        var gr = await session.run("match(g:Groupe{Name:$grName})return g", {
            grName
        })
        console.log(gr)
        if (gr.records.length > 0) {
            return res.status(422).json("Groupe name already exists !");
        }
        console.log(gr.records.length)
            //var account = await createAccount();
            /*if(!account){
                return res.status(500).send("stripe account creation failed !")
            }*/
        var result = await session.run("merge(g:Groupe{Name:$grName,Description:$grDesc,balance:$balance,accountId:$actId,members:$members})", {
            grName,
            grDesc,
            balance: 0,
            actId: "", //account.id,
            members: 0
        })
        await createTagsRelations(grName, tags);
        await session.run("match(g:Groupe{Name:$grName}) match(l:Location{Name:$country}) merge(g)-[:LOCATED_IN]->(l)", {
            grName,
            country
        });
        return res.status(200).json("Groupe created Successfully !");
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        return res.status(500).json(err)
    }
}


exports.getGroupe = async(req, res, next) => {
    const grName = req.params.grName.replace(":", "");
    console.log(grName);
    if (myCache.get("Get-Group")) {
        return res.status(200).json(myCache.get("Get-Group"));
    }
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
        database: process.env.DBNAME || 'Hero',
        defaultAccessMode: neo4j.session.READ
    })
    const query = await session.run("match(g:Groupe{Name:$grName})-[]-(k:Victories),(g)-[]-(l:Campaign) return g,k,l", {
        grName
    })
    console.log(query.records[0]._fields[2]);
    const singleRecord = query.records[0];
    const node = singleRecord.get(0);
    myCache.set("Get-Group", node.properties);
    return res.status(200).json(node.properties);
}
const getvideoByTag = async(Tags) => {
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
        database: process.env.DBNAME || 'Hero',
        defaultAccessMode: neo4j.session.READ
    })
    query = await session.run("match(n:Groupe)-[]-(l:Videos) where $tags in n.Tags return n.Name as circleName,n.Description as circleDesc,l.path as videoPath,l.affiche as videoAffiche,l.default as videoDefault,l.id as videoId,l.MimeType as mimeType", {
        tags: Tags
    })


    return query;
}
exports.getVideosByCirclesTag = async(req, res, next) => {

    await initDriver();
    var driver = getdriver();
    var session = driver.session({
        database: process.env.DBNAME || 'Hero',
        defaultAccessMode: neo4j.session.READ
    })
    let queryPrincipal = await session.run("match (c:Tag) return c.title")
    Tags = [];
    queryPrincipal.records.map(record => {

        record._fields.map(tag => {
            if (tag != null) {
                Tags.push(tag);
            }
        })
    });

    let query;
    query = await session.run("match(n:Groupe)-[]-(l:Videos) where  n.priotity=1 return n.Name as circleName,n.Description as circleDesc,l.path as videoPath,l.affiche as videoAffiche,l.default as videoDefault,l.id as videoId,l.MimeType as mimeType")

    /*tags == tags.lowercase();   
    query = await session.run("match(n:Groupe)-[]-(l:Videos) where $tags in n.Tags return n.Name as circleName,n.Description as circleDesc,l.path as videoPath,l.affiche as videoAffiche,l.default as videoDefault,l.id as videoId,l.MimeType as mimeType",{
        tags
    })
    }*/

    //console.log(principal);


    /*console.log(query.records[0]._fields[0]);
    const singleRecord = query.records[0];
    const node = singleRecord.get(0);
    myCache.set("Get-Group",node.properties);*/
    const MM = {}
    query.records.map(record => {
            MM["Principal"] = {
                nameCircle: record.get(0),
                circleDesc: record.get(1),

                videoPath: record.get(2),
                videoAffiche: record.get(3),
                videoDefault: record.get(4),
                videoId: record.get(5).low,

                mimeType: record.get(6)
            }
        }

    )

    let str = "";
    for (var f = 0; f < Tags.length; f++) {
        if (str == "") {
            str = "b.title='" + Tags[f] + "'";
        } else {
            str = str + " OR " + "b.title='" + Tags[f] + "'";
        }
    }

    let queryFinal = await session.run("match(n:Groupe)-[]-(l:Videos) match(n:Groupe)-[]-(b:Tag) where " + str + " return n.Name as circleName,n.Description as circleDesc,l.path as videoPath,l.affiche as videoAffiche,l.default as videoDefault,l.id as videoId,l.MimeType as mimeType ,l.VideoCard as VideoCard, b.title as tags")
    let x = [];
    for (var l = 0; l < Tags.length; l++) {
        resFinalTags = [];
        queryFinal.records.map(record => {

            if (record._fields[record._fields.length - 1] == Tags[l]) {
                resFinalTags.push({

                    nameCircle: record._fields[0],
                    circleDesc: record._fields[1],
                    videoPath: record._fields[2],
                    videoAffiche: record._fields[3],
                    videoDefault: record._fields[4],
                    videoId: record._fields[5].low,
                    mimeType: record._fields[6],
                    VideoCard: record._fields[7],
                    tag: record._fields[record._fields.length - 1]

                })


            }



        });
        console.log(Tags[l], resFinalTags)
        if (resFinalTags.length <= 6) {
            for (let ind = 0; ind <= 6 - resFinalTags.length; ind++) {
                resFinalTags.push({
                    nameCircle: "",
                    circleDesc: "",
                    videoPath: "",
                    videoAffiche: "",
                    videoDefault: "",
                    videoId: "",
                    mimeType: "",
                    VideoCard: "",
                    tag: ""
                })
            }
        }
        x.push({ tag: Tags[l], videos: resFinalTags })
    }

    console.log("MM");
    console.log(x);

    res.end(
        JSON.stringify({ Principal: MM.Principal, Videos: x })
    );

    //console.log(resu);

}
exports.getMembers = async(req, res, next) => {
    const grName = req.params.grName;
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
        database: process.env.DBNAME || 'Hero',
        defaultAccessMode: neo4j.session.READ
    })
    var result = await session.run("match(a:Activist)-[:PART_OF]->(g:Groupe{Name:$grName}) return a", {
        grName
    })
    let activists = []
    result.records.map(record => activists.push(record.get(0).properties))
    return res.status(200).json(activists);

}
exports.getSupporters = async(req, res, next) => {
    const grName = req.params.grName.replace(":", "");
    console.log(grName);
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
        database: process.env.DBNAME || 'Hero',
        defaultAccessMode: neo4j.session.READ
    })
    var result = await session.run("match(c:Customer)-[l:JOINED]->(g:Groupe{Name:$grName}) return c order by l.date desc", {
        grName
    })
    let supporters = []
    result.records.map(record => {
        if (record.get(0).properties.imageUrl != "") {
            var supporter = {
                email: record.get(0).properties.email,
                customerId: record.get(0).properties.CustomerId,
                walletAddress: record.get(0).properties.walletAddress,
                fullname: record.get(0).properties.name + " " + record.get(0).properties.lastname,
                profileImage: record.get(0).properties.imageUrl,
                googleID: record.get(0).properties.googleId,
                nbSupporters: result.records.length
            }
            supporters.push(supporter)
        }
        if (supporters.length == 3) {
            return res.status(200).json(supporters);
        }
    })
    return res.status(200).json(supporters);

}

exports.getAll = async(req, res) => {
    try {
        await initDriver();
        var driver = getdriver();
        var session = driver.session({
            database: process.env.DBNAME || 'Hero'
        })
        let groups = [];
        const { tags, locations } = req.body;
        if (tags.length == 0 && locations.length != 0) {
            var result = await session.run("unwind $locations as loc match(g:Groupe)-[:LOCATED_IN]->(l:Location{Name:loc}) return g", {
                locations
            })

            result.records.map(record => groups.push(record.get(0).properties))
            return res.status(200).json(groups);
        }
        if (locations.length == 0 && tags.length != 0) {
            var result = await session.run("unwind $tags as tag match(g:Groupe)-[:INTEREST]->(t:Tag{Name:tag}) return g", {
                tags
            })

            result.records.map(record => groups.push(record.get(0).properties))
            return res.status(200).json(groups);
        } else if (locations.length != 0 && tags.length != 0) {
            var result = await session.run("unwind $tags as tags unwind $locations as loc match(t:Tag{Name:tags})<-[:INTEREST]-(g:Groupe)-[:LOCATED_IN]->(l:Location{Name:loc}) return g", {
                tags,
                locations
            })

            result.records.map(record => groups.push(record.get(0).properties))
            return res.status(200).json(groups);
        } else {
            var result = await session.run("match(g:Groupe)return g");
            result.records.map(record => groups.push(record.get(0).properties));
            return res.status(200).json(groups);
        }
    } catch (err) {
        console.log(err)
    }
}



exports.addMedia = async(req, res, next) => {
    const { groupe, url, desc, title, typeMedia } = req.body;
    const id = uniqid();
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
        database: process.env.DBNAME || 'Hero',
        defaultAccessMode: neo4j.session.WRITE
    })
    await session.run("merge(p:Post{id:$id,title:$title,description:$desc,media:$url,type:$typeMedia,time:$time}) with p as p match(g:Groupe{Name:$groupe}) merge(g)-[:CREATED]->(p)", {
        title,
        url: url || "",
        groupe,
        desc,
        id,
        time: getTime(),
        typeMedia: typeMedia || ""
    });
    return res.status(200).json("Media added successfully !")
}

exports.getFeed = async(req, res) => {
    const { cercle, page } = req.body;
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
        database: process.env.DBNAME || 'Hero',
        defaultAccessMode: neo4j.session.READ
    })
    const limit = 10;
    const skip = (page * limit) - limit;
    const result = await session.run(`match(g:Groupe{Name:$cercle})-[:CREATED]->(n:Post)
    return n 
    order by n.time
    skip $skip
    limit toInteger($limit)
    `, {
        cercle,
        skip: neo4j.int(skip),
        limit: neo4j.int(limit)
    })
    var posts = [];
    result.records.map(record => posts.push(record.get(0).properties))
    return res.status(200).json(result.records)
}

exports.getComments = async(req, res) => {
    const { postId, page } = req.body;
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
        database: process.env.DBNAME || 'Hero',
        defaultAccessMode: neo4j.session.READ
    })
    const limit = 10;
    const skip = (page * limit) - limit;
    const result = await session.run("match(p:Post{id:$postId})-[c:COMMENTED]-(n) return c skip $skip limit $limit", {
        postId,
        skip: neo4j.int(skip),
        limit: neo4j.int(limit)
    });
    var comments = [];
    result.records.map(record => comments.push(record.get(0).properties))
    return res.status(200).json({ comments })

}


exports.getLikes = async(req, res) => {
    const { postId, page } = req.body;
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
        database: process.env.DBNAME || 'Hero',
        defaultAccessMode: neo4j.session.READ
    })
    const limit = 10;
    const skip = (page * limit) - limit;
    const result = await session.run("match(p:Post{id:$postId})-[c:LIKE]-(n) return c skip $skip limit $limit", {
        postId,
        skip: neo4j.int(skip),
        limit: neo4j.int(limit)
    });
    var likes = [];
    result.records.map(record => likes.push(record.get(0).properties))
    return res.status(200).json({ likes })

}

exports.getDislikes = async(req, res) => {
    const { postId, page } = req.body;
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
        database: process.env.DBNAME || 'Hero',
        defaultAccessMode: neo4j.session.READ
    })
    const limit = 10;
    const skip = (page * limit) - limit;
    const result = await session.run("match(p:Post{id:$postId})-[c:DISLIKE]-(n) return c skip $skip limit $limit", {
        postId,
        skip: neo4j.int(skip),
        limit: neo4j.int(limit)
    });
    var dislikes = [];
    result.records.map(record => dislikes.push(record.get(0).properties))
    return res.status(200).json({ dislikes })

}

exports.getCirleInformation = async(req, res, next) => {
    const grName = req.params.grName.replace(":", "");
    console.log(grName);
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
        database: process.env.DBNAME || 'Hero',
        defaultAccessMode: neo4j.session.READ
    })

    const result = await session.run("match(g:Groupe{Name:$grName})-[]-(l:Campaign),(g)-[]-(m:Activist) match(c:Customer)-[J:JOINED]->(g:Groupe{Name:$grName}) return c,g,l,m", {
        grName
    })
    const result2 = await session.run("match(g:Groupe{Name:$grName})-[]-(k:Moments) return g,k", {
        grName
    })
    const result3 = await session.run("match(g:Groupe{Name:$grName})-[]-(k:Moments)  return g,k", {
        grName
    })
    const result4 = await session.run("match(g:Groupe{Name:$grName})-[]-(k:Activist)  return g,k", {
        grName
    })
    const result5 = await session.run("match(g:Groupe{Name:$grName})-[]-(k:Customer)  return g,k", {
        grName
    })
    const result6 = await session.run("match(g:Groupe{Name:$grName})-[]-(k:Videos)  return g,k", {
        grName
    })
    let mobilizers = [];
    result4.records.map(record => mobilizers.push({
        name: record.get(1).properties.Name,
        address: record.get(1).properties.address,
        picture: record.get(1).properties.imgProfil,
        media: record.get(1).properties.Media,
        Socials: record.get(1).properties.Socials,
    }))
    let supporters = [];
    result5.records.map(record => supporters.push({
        name: record.get(1).properties.name,
        picture: record.get(1).properties.imageUrl,
    }))
    let histroies = [];
    result2.records.map(record => histroies.push(record.get(1).properties.description))
    let nextHistroies;
    nextHistroies = "The UK government declared a climate emergency after a shut down of London for 10 days."
    record = result.records[0]
    console.log(record)
    var info = {
        name: record.get(1).properties.Name,
        desciption: record.get(1).properties.Description,
        video: result6.records[0].get(1).properties.path,
        videoPoster: record.get(0).properties.imageUrl,
        mobilizers: mobilizers,
        supporters: supporters,
        histroies: histroies,
        nextHistory: nextHistroies,
    }
    return res.status(200).json(info);
}