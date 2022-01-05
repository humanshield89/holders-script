require('dotenv').config();
const {performance} = require('perf_hooks');
const axios = require("axios");
const cheerio = require("cheerio");
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const port = process.env.NODE_PORT
const explorerUrl = process.env.NODE_EXPLORER_URL;
const tokenAddress = process.env.NODE_TOKEN_ADDRESS;

if(!explorerUrl) throw "explorerUrl: undefined";
if(!tokenAddress) throw "explorerUrl: undefined";
if(!port) throw "port: undefined";

const url = `${explorerUrl}/token/${tokenAddress}`;

const numbers = '0123456789';

async function scrapeData() {
    try {
        const { data } = await axios.get(url);

        const $ = cheerio.load(data);

        const holders = $("div.mr-3").text();
            
        let holdersNumber = '';
        for(let i = 0 ; i < holders.length ; i++)
            if(numbers.includes(holders.charAt(i)))
                holdersNumber = holdersNumber + holders.charAt(i);
        
        
        //console.log(holdersNumber);
        return holdersNumber;

    } catch (err) {
      console.error(err.message);
    }
  }

  let lastNumber;
  let lastChecked;
  app.get('/', async (req, res) => {
      //console.log('received request')
      if(!lastNumber || performance.now()-lastChecked > 10000){ // if 10 sec have passed let refreshthe data we have
            lastNumber = await scrapeData();
            lastChecked = performance.now();
            //console.log('called backend')
      }
    res.send(lastNumber);
  })
  
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
  })

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}