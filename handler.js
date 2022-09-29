const handlers = {
    "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f": require("./sushiswap/0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f"),
    "0x665ff8fAA06986Bd6f1802fA6C1D2e7d780a7369": require('./vader/0x665ff8fAA06986Bd6f1802fA6C1D2e7d780a7369'),
    "0x66e76B0F2c69cfD9282F1D80F6F00686d611452b": require("./vlaunch/0x66e76B0F2c69cfD9282F1D80F6F00686d611452b")
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
  