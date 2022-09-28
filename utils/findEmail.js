const { getdriver,initDriver } = require("../neo4j");
const neo4j = require("neo4j-driver");
 
async function findEmail(email){
    await initDriver();
    var driver = getdriver();
    var session = driver.session({
      database: process.env.DBNAME ||'Hero',
      defaultAccessMode: neo4j.session.READ
    })
    const [q1,q2]= await Promise.all(
      [ await session.run(`match(n:Activist{email:$email}) return n`,{
        email
    }),await session.run(`match(n:Customer{email:$email}) return n`,{
      email
  })
]
    )
  return q2.records.length+q1.records.length;   
}

module.exports = findEmail;