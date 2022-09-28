const axios = require("axios");
const Web3 = require("web3");
const config=require("./config.json");
const {getDataFromProtocol}=require("./handler");

const apiCall = (address, page) => `https://api.scanmydefi.com/address/${address}/transactions?limit=${config.limit}&page=${page}`

const {UserModel}=require("./model");

//Array for infura servers
const serverArr = [
  "https://mainnet.infura.io/v3/65ef0d20bce5453297371820335b0409",
  "https://mainnet.infura.io/v3/5e7260c217304f78a79b5e380feaab75",
  "https://mainnet.infura.io/v3/9391decbb427428fa4dcd947978e148d",
  "https://mainnet.infura.io/v3/85fae8d1614f4132b90afce4aa0e1292",
  "https://mainnet.infura.io/v3/e0c50dd3725b4d7e8c803a0d0db3c677",
  "https://mainnet.infura.io/v3/8a2345c9fdac4bb68099e914a91a0b2a",
  "https://mainnet.infura.io/v3/41fae05e0a2b4a7da83c689c5f7864af",
  "https://mainnet.infura.io/v3/deb3bac0272e46eab9003e57f1c30c6f",
  "https://mainnet.infura.io/v3/8d94194d3955498f9516fdd8d3247691",
  "https://mainnet.infura.io/v3/801c6ce484e44827891cde0ddd6aee0a",
  "https://mainnet.infura.io/v3/75a187fe366c46079a310da4c306e238",
  "https://mainnet.infura.io/v3/dc287669d7b54e7484ba2203f1312447",
  "https://mainnet.infura.io/v3/5b540620294847bc8514b59905619304",
  "https://mainnet.infura.io/v3/45bee824bd7a463789e6648ef0a29d74",
  "https://mainnet.infura.io/v3/dd29c3bf7bee424b9dbb98596e72ebdc",
  "https://mainnet.infura.io/v3/19e431afb27a4b35be7061a1b4b6b6a0",
  "https://mainnet.infura.io/v3/b00553321560431f808482760dbbfacf",
  "https://mainnet.infura.io/v3/96d82bb4d4a449d5a17c2ddf96969a79",
  "https://mainnet.infura.io/v3/f81722d6fda140f4a515c08485ee4e91",
  "https://mainnet.infura.io/v3/3d6a37a01ef74bbc917219b4f4d9b7ec",
  "https://mainnet.infura.io/v3/45a473125c9b4f938842b3c2aa3a9e92",
  "https://mainnet.infura.io/v3/45fc9bf3969140488231fc73578083bc",
  "https://mainnet.infura.io/v3/1c0b026e4afe47bba63fb80ee3c5cb51",
  "https://mainnet.infura.io/v3/4376590313124e3289a13ac3028571c4",
  "https://mainnet.infura.io/v3/e269089a73684bdba0b5577104e1eac8",
  "https://mainnet.infura.io/v3/eac4be7420724ec289e71ded9c0afae9",
  "https://mainnet.infura.io/v3/f47ddbe5274242919287d1fac55312f6",
];
// Contract address for the protocol
let address = config.address;
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
            let page=parseInt(config.page);
            console.log("attempting to start server from page no.",page);
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
                    transactionsReceiptPromises.push(web3Server[iter%web3Server.length].eth.getTransactionReceipt(hash))
                })
                transactionsReceipts = await Promise.all(transactionsReceiptPromises);

                dataBuildingCalls=[];
                for(let iterTransaction=0;iterTransaction<transactionsData.length;++iterTransaction){
                    if(transactionsData[iterTransaction].to==null){
                      continue;
                    }
                    if(transactionsReceipts[iterTransaction].status==false){
                      continue;
                    }
                   
                    txData=transactionsData[iterTransaction];
                    txReceipt=transactionsReceipts[iterTransaction];
                    blockTimestamp = blockTimestampList[iterTransaction];
                    userAddress=txData.from.toLowerCase();
                    contractAddress=txData.to.toLowerCase();
                    methodId=txData.input.substring(0,10);
                    logs=txReceipt.logs;
                    
                    if(config.methodIds.indexOf(methodId)!=-1)
                    dataBuildingCalls.push(getDataFromProtocol(userAddress,contractAddress,logs,methodId,blockTimestamp))
                    
                }
                dataObjects=await Promise.all(dataBuildingCalls);

                let operations = [];
                dataObjects.forEach((user) => {
                  if(user!=null){
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
                        balanceContractAddress: user.balanceContractAddress
                      },
                      "update": user,
                      "upsert": true,
                    },
                  });
                }
              }
          });
                let buildReceipt=await UserModel.bulkWrite(operations, { ordered: false });
                console.log(`${count} transactions processed till page ${page}`);
                console.log(buildReceipt.result.nModified,"documents modified");
                console.log(buildReceipt.result.nUpserted,"documents upserted");

                await new Promise(res => setTimeout(res, config.delay));

                
                page=pageReturned;
           }
            console.log("processed finished")
            resolve();
        } catch (err) {
            console.log(err,userAddress,logs[6].address,methodId);
            reject(err);
            process.exit();
        }
    })
};
getDataFromTxnHash();