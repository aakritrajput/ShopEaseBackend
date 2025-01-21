import { createClient } from "redis";
import { promisify  } from "util"

const client =  createClient();

client.on("error",(err)=>{
    console.log("error establishing connection with redis ", err)
});
client.on("connect", ()=>{
    console.log("Successfully connected to redis")
});

const asyncGet = promisify(client.get).bind(client)
const asyncSetx = promisify(client.setEx).bind(client)

export { client, asyncGet, asyncSetx}