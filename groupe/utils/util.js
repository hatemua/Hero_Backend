
const {initDriver,getdriver} = require("../../neo4j");
const neo4j = require("neo4j-driver");

exports.createTagsRelations = async(grName,tags)=>{
    try{
        await initDriver();
        var driver = getdriver();
        var session = driver.session({
                database: process.env.DBNAME ||'Hero'
        })
        await session.run("unwind $tags as tag match(g:Groupe{Name:$grName}) match(t:Tag{Name:tag}) merge(g)-[:INTEREST]->(t)",{
            grName,
            tags
        })
        return true;
    }catch(err){
        return false;
    }
    

}