import { MongoClient, ServerApiVersion } from 'mongodb';
import dns from 'node:dns'; // use import dns from 'node:dns'; if using ES modules

dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = "mongodb+srv://udayganguru2000_db_user:srzkJlTemZdpYXds@cluster0.fzx6hvu.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
/*async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    let gmailToolsDeclaration = await (await client.db("pa").collection("tools_coll").find(
    {$or:[{"name": "gmailToolDeclaration"},{"name": "commandToolDeclaration"}]},{projection:{_id:0,functionDeclarations:1}}
    )).toArray();
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
*/
async function getGmailConfig(){
    try{
        await client.connect();
        let pa = client.db("pa");
        let gmailToolsDeclaration = await (await pa.collection("tools_coll").find(
            {$or:[{"name": "gmailToolDeclaration"},{"name": "commandToolDeclaration"},{"name": "planningToolDeclaration"}]},{projection:{_id:0,functionDeclarations:1}}
            )).toArray();
        let gmailSystemPrompt = (await pa.collection("prompts_coll").findOne({"title": "gmailManager"},{projection:{_id:0,prompt:1}})).prompt;
        return [gmailToolsDeclaration,gmailSystemPrompt];
    } finally{
        await client.close();
    }
}

async function getScratchPad(){
try{
        await client.connect();

        let scratchPadContent = (await client.db("pa").collection("general_coll").findOne()).content;
        console.log(scratchPadContent);
        return scratchPadContent;
    } finally{
        await client.close();
    }
}

async function setScratchPad(approach){
try{
     await client.connect();

     await client.db("pa").collection("general_coll").updateOne({},{$set:{content:approach}});
    } finally{
        await client.close();
    }
}

export {getGmailConfig, setScratchPad,getScratchPad};