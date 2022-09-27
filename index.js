const axios = require("axios");
const Web3 = require("web3");
require('dotenv').config();
const {getDataFromProtocol}=require("./handler");

const apiCall = (address, page) => `https://api.scanmydefi.com/address/${address}/transactions?limit=${process.env.limit}&page=${page}`

const {UserModel}=require("./model");

//Array for infura servers
const serverArr = [
   "https://mainnet.infura.io/v3/9301e02f0e164f06b918b08b5321ad96",
   "https://mainnet.infura.io/v3/b1063d80e74443bfac4d744f46a2a98a",
   "https://mainnet.infura.io/v3/8257720148da41f1b4c1e3a79ce9bf1d",
   "https://mainnet.infura.io/v3/a3745c6dc07c45dcbf183d7743ee19c9"
];
// Contract address for the protocol
let address = process.env.address;
address = address.toLowerCase();
var web3Server = [];
for (let i = 0; i < serverArr.length; ++i) {
    web3Server.push(new Web3(new Web3.providers.HttpProvider(serverArr[i])))
}
//To get all the txn hash for that protocol
async function getTxnHashList(address,page) {
    return new Promise(async (resolve, reject) => {
        try {
            let txnHashList=[];
            let blockTimestampList=[];
            let response;
            let data;
            response = await axios.get(apiCall(address,page));
            data = response.data.result.data.transactionHashJSONDataList
            data.forEach((d) => {
                txnHashList.push(d.transactionHash);
                blockTimestampList.push(d.blockTimeStamp)
            });
           resolve({txnHashList:txnHashList,blockTimestampList: blockTimestampList, pageReturned:page+1});
        } catch (err) {
            reject(err);
        }
    })
};

var transactionsPromises=[],transactionsData=[],dataBuildingCalls=[],dataObjects=[],transactionsReceiptPromises=[],transactionsReceipts=[];
var txData;
var txReceipt;
var blockTimestamp;

// To get the required data from the txn hashes
async function getDataFromTxnHash() { //MAIN function
    return new Promise(async (resolve, reject) => {
        try {
            let count=0;
            let flag=true;
            let page=parseInt(process.env.page);
            while(flag){
                var {txnHashList, blockTimestampList, pageReturned} = await getTxnHashList(address,page);
                transactionsPromises=[]
                txnHashList.forEach((hash,iter)=>{
                    count++
                    transactionsPromises.push(web3Server[iter%web3Server.length].eth.getTransaction(hash))
                })
                transactionsData = await Promise.all(transactionsPromises);

                transactionsReceiptPromises=[]
                txnHashList.forEach((hash,iter)=>{
                    count++
                    transactionsReceiptPromises.push(web3Server[iter%web3Server.length].eth.getTransactionReceipt(hash))
                })
                transactionsReceipts = await Promise.all(transactionsPromises);

                dataBuildingCalls=[];
                for(let iterTransaction=0;iterTransaction<transactionsData.length;++iterTransaction){
                    txData=transactionsData[iterTransaction];
                    txReceipt=transactionsReceipts[iterTransaction];
                    blockTimestamp = blockTimestampList[iterTransaction];
                    userAddress=txData.from.toLowerCase();
                    contractAddress=txData.to.toLowerCase();
                    methodId=txReceipt.input.substring(0,10);
                    logs=txReceipt.logs;
                    
                    dataBuildingCalls.push(getDataFromProtocol(userAddress,contractAddress,logs,methodId,blockTimestamp))
                }
                dataObjects=await Promise.all(dataBuildingCalls);
                // console.log(dataObjects);

                let operations = [];
                dataObjects.forEach((user) => {
                  if(user.length!=undefined){
                    for(let i=0;i<user.length;i++){
                      operations.push({
                        "updateOne": {
                          "filter": {
                            userAddress: user[i].userAddress,
                            protocolName: user[i].protocolName,
                            tag: user[i].tag,
                            poolName: user[i].poolName,
                            balanceContractAddress: user[i].balanceContractAddress
                          },
                          "update": user[i],
                          "upsert": true,
                        },
                      });
                    }
                  }else{
                  operations.push({
                    "updateOne": {
                      "filter": {
                        userAddress: user.userAddress,
                        protocolName: user.protocolName,
                        tag: user.tag,
                        poolName: user.poolName,
                      },
                      "update": user,
                      "upsert": true,
                    },
                  });
                }
                });
                await UserModel.bulkWrite(operations, { ordered: false });



                process.env.page=pageReturned;
                console.log(`${count} rows entered. On page ${page}`);
                page=pageReturned;
           }
            console.log("processed finished")
            resolve();
        } catch (err) {
            console.log(err);
            reject(err);
            process.exit();
        }
    })
};
getDataFromTxnHash();