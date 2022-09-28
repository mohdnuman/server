const abi = require("./lootex_abi.json");
const Web3 = require("web3");
var web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://mainnet.infura.io/v3/4376590313124e3289a13ac3028571c4"
  )
);

getData = async (userAddress, blockTimestamp) => {
  return new Promise(async (resolve, reject) => {
    try {
      const address = "0xe366f742A0d7A679446198487550A362076833A5";
      const contract = new web3.eth.Contract(abi, address);
      let stakeofuser = await contract.methods
        .getTotalDeposit(userAddress)
        .call();
      stakeofuser = stakeofuser / 10 ** 18;

      let rewardsofuser = await contract.methods
        .withdrawableRewardsOf(userAddress)
        .call();
      rewardsofuser = rewardsofuser / 10 ** 18;

      let token = "0x721a1b990699ee9d90b6327faad0a3e840ae8335";
      token = token.toLowerCase();

      let dataObject = {
        userAddress: userAddress,
        chain: "ETH",
        protocolName: "lootex",
        tag: "Staked",
        poolName: "LOOT",
        balance: stakeofuser,
        balanceSymbol: "LOOT",
        balanceContractAddress: token,
        rewards: rewardsofuser,
        rewardsSymbol: "LOOT",
        rewardsContractAddress: token,
        blockTimestamp: blockTimestamp,
      };
      resolve(dataObject);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  getData: getData,
};
