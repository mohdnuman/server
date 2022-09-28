const handlers = {
    "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f": require("./sushiswap/0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f"),
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
  