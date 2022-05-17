const {MongoClient,ServerApiVersion} = require("mongodb")
require("dotenv").config()
const uri = process.env.DB_URI
const client = new MongoClient(uri,{ useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })
let dbConnected = false
let db
async function connectdb(dbName) {
	try {  
		await client.connect()
        dbConnected = true
		db = client.db(dbName)
		console.log(`connected to database ${db.databaseName}`)
	}
	catch(ex){
        dbConnected = false
		console.error(`Connecting to db failed: ${ex}`)
        client.close()
	}
}

async function getQuestionData(questionSlug) {
    if(!dbConnected)
        return
	try {  
		const problems = db.collection("problems")
        const data = await problems.findOne({ titleSlug : questionSlug
                    })
        console.log("Found data for problem"+ data)
        return data
	}
	catch(ex){
		console.error(`Something bad happend ${ex}`)
	}
}


module.exports = {
    connectdb,
    getQuestionData
}