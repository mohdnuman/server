const axios = require("axios");
const Web3 = require("web3");
const config = require("./config.json");
const { getDataFromProtocol } = require("./handler");

const apiCall = (address, page) =>
  `https://api.scanmydefi.com/address/${address}/transactions?limit=${config.limit}&page=${page}`;

const { UserModel } = require("./model");

const Twitter = require("twitter");


const client = new Twitter({
  consumer_key: "nZ2svFKO1dDiogksJNhH05u76",
  consumer_secret: "20h8F6WayuYcpEdVgaGo8AN3DflQV2RE6p3OuFIqGlMEQ2D5CH",
  access_token_key: "1486096407299694593-xXHWqu7N6TwABsNyh17Xbw3Mwnjmyv",
  access_token_secret: "3Ep5A6hUOTZyy77thXudXKO0r5UzT4hE41imlxlQQnFqZ",
});


postUpdate = async (count) => {
  client.post(
    "statuses/update",
    {
      status:`${count} transactions processed for address ${config.address}`,
    },
    function (error, tweet, response) {
      if (error) throw error;
    }
  );
};



//Array for infura servers
const serverArr = [
  "https://mainnet.infura.io/v3/50a72678aa084ee1a0da05f5f8df7890",
  "https://mainnet.infura.io/v3/04d81dcf588244ff8c85e8fa81caa81e",
  "https://mainnet.infura.io/v3/4309f303319d428dbff81f8250577e79",
  "https://mainnet.infura.io/v3/c66d20a147fe42c1bfd675adffc062d5",
  "https://mainnet.infura.io/v3/a1aa5bc700af43de87de85842cac103c",
  "https://mainnet.infura.io/v3/813ca5be650a4ee1bc7a0cc0864279b8",
  "https://mainnet.infura.io/v3/727e083f40db4adcb87ebfc0faba1ee2",
  "https://mainnet.infura.io/v3/befe496d2f73413cace22db8aa8ccf8a",
  "https://mainnet.infura.io/v3/e6d50edd104f4b0eb3714999d05b801a",
  "https://mainnet.infura.io/v3/4b503e251f90481781d3af6303c37c68",
];
// Contract address for the protocol
let address = config.address;
address = address.toLowerCase();
var web3Server = [];
for (let i = 0; i < serverArr.length; ++i) {
  web3Server.push(new Web3(new Web3.providers.HttpProvider(serverArr[i])));
}
//To get all the txn hash for that protocol
async function getTxnHashList(address, page) {
  return new Promise(async (resolve, reject) => {
    try {
      let txnHashList = [];
      let blockTimestampList = [];
      let response;
      let data;
      response = await axios.get(apiCall(address, page));
      data = response.data.result.data.transactionHashJSONDataList;
      data.forEach((d) => {
        txnHashList.push(d.transactionHash);
        blockTimestampList.push(d.blockTimeStamp);
      });
      resolve({
        txnHashList: txnHashList,
        blockTimestampList: blockTimestampList,
        pageReturned: page + 1,
      });
    } catch (err) {
      reject(err);
    }
  });
}

var transactionsPromises = [],
  transactionsData = [],
  dataBuildingCalls = [],
  dataObjects = [],
  transactionsReceiptPromises = [],
  transactionsReceipts = [];
var txData;
var txReceipt;
var blockTimestamp;

// To get the required data from the txn hashes
async function getDataFromTxnHash() {
  //MAIN function
  return new Promise(async (resolve, reject) => {
    try {
      let count = 0;
      let flag = true;
      let page = parseInt(config.page);
      console.log("attempting to start server from page no.", page);
      while (flag) {
        if(count%config.twitterDelayTransactions==0){
            postUpdate(count);
        }
        var { txnHashList, blockTimestampList, pageReturned } =
          await getTxnHashList(address, page);
        transactionsPromises = [];
        txnHashList.forEach((hash, iter) => {
          count++;
          transactionsPromises.push(
            web3Server[iter % web3Server.length].eth.getTransaction(hash)
          );
        });
        transactionsData = await Promise.all(transactionsPromises);

        transactionsReceiptPromises = [];
        txnHashList.forEach((hash, iter) => {
          transactionsReceiptPromises.push(
            web3Server[iter % web3Server.length].eth.getTransactionReceipt(hash)
          );
        });
        transactionsReceipts = await Promise.all(transactionsReceiptPromises);

        dataBuildingCalls = [];
        for (
          let iterTransaction = 0;
          iterTransaction < transactionsData.length;
          ++iterTransaction
        ) {
          if (transactionsData[iterTransaction].to == null) {
            continue;
          }
          if (transactionsReceipts[iterTransaction].status == false) {
            continue;
          }

          txData = transactionsData[iterTransaction];
          txReceipt = transactionsReceipts[iterTransaction];
          blockTimestamp = blockTimestampList[iterTransaction];
          userAddress = txData.from.toLowerCase();
          contractAddress = txData.to;
          methodId = txData.input.substring(0, 10);
          logs = txReceipt.logs;

          if (config.methodIds.indexOf(methodId) != -1)
            dataBuildingCalls.push(
              getDataFromProtocol(
                userAddress,
                contractAddress,
                logs,
                methodId,
                blockTimestamp
              )
            );
        }
        dataObjects = await Promise.all(dataBuildingCalls);

        let operations = [];
        dataObjects.forEach((user) => {
          if (user != null) {
            if (user.length != undefined) {
              for (let i = 0; i < user.length; i++) {
                operations.push({
                  updateOne: {
                    filter: {
                      userAddress: user[i].userAddress,
                      protocolName: user[i].protocolName,
                      tag: user[i].tag,
                      poolName: user[i].poolName,
                      balanceContractAddress: user[i].balanceContractAddress,
                    },
                    update: user[i],
                    upsert: true,
                  },
                });
              }
            } else {
              operations.push({
                updateOne: {
                  filter: {
                    userAddress: user.userAddress,
                    protocolName: user.protocolName,
                    tag: user.tag,
                    poolName: user.poolName,
                    balanceContractAddress: user.balanceContractAddress,
                  },
                  update: user,
                  upsert: true,
                },
              });
            }
          }
        });
        let buildReceipt = await UserModel.bulkWrite(operations, {
          ordered: false,
        });
        console.log(`${count} transactions processed till page ${page}`);
        console.log(buildReceipt.result.nModified, "documents modified");
        console.log(buildReceipt.result.nUpserted, "documents upserted");

        await new Promise((res) => setTimeout(res, config.delay));

        page = pageReturned;
      }
      console.log("processed finished");
      resolve();
    } catch (err) {
      console.log(err);
      reject(err);
      process.exit();
    }
  });
}
getDataFromTxnHash();
