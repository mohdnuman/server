const handlers = {
    "0x2b591e99afe9f32eaa6214f7b7629768c40eeb39": require("./hex/0x2b591e99afe9f32eaa6214f7b7629768c40eeb39"),
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
  