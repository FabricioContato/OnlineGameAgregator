const { createClient } = require('redis');
const client = createClient({
  url: 'redis://redis:6379'
});

client.on('error', err => console.log('Redis Client Error', err));

client.connect();

async function jsonStringIntoRedis(key, json) {
  const jsonStr = JSON.stringify(json);
  return await client.set(key, jsonStr);
}

async function getJsonFromJsonStringFromRedis(key) {
  //console.log('getJsonFromJsonStringFromRedis');
  const jsonStr = await client.get(key);
  return JSON.parse(jsonStr);
}


module.exports = {
                    client: client,
                    jsonStringIntoRedis: jsonStringIntoRedis,
                    getJsonFromJsonStringFromRedis: getJsonFromJsonStringFromRedis
                  }