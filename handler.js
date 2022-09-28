const handlers = {
    "0xe366f742a0d7a679446198487550a362076833a5": require("./lootex/0xe366f742a0d7a679446198487550a362076833a5"),
  };
  
  const getDataFromProtocol = async (
    userAddress,
    contractAddress,
    logs,
    methodId,
    blockTimestamp
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        let dataObject=await handlers[contractAddress].getData(userAddress,blockTimestamp,logs, methodId);
        resolve(dataObject);
      } catch (err) {
        reject(err);
      }
    });
  };
  
  module.exports = {
    getDataFromProtocol,
  };
  