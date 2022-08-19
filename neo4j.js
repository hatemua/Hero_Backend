const neo4j = require("neo4j-driver");
require('dotenv').config()
let driver;
exports.initDriver=()=> {
    // TODO: Create an instance of the driver here
    driver = neo4j.driver(
      process.env.DBURL,
      neo4j.auth.basic(process.env.DBNAME, process.env.DBPASSWORD)
    ),
    {
      maxConnectionPoolSize: 100,
      connectionTimeout: 30000, // 30 seconds
      logging: {
        level: 'info',
        logger: (level, message) => console.log(level + ' ' + message)
      },
    }
    return driver.verifyConnectivity()
    .then(()=> driver).catch(err=>console.log(err))
  }

  exports.getdriver=()=>{
    return driver;
}