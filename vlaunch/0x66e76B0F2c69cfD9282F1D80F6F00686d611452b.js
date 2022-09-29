const abi = require("./vlaunch_abi.json");
const Web3 = require("web3");
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

getData = async (userAddress, blockTimestamp, logs, methodId) => {
  return new Promise(async (resolve, reject) => {
    try {
      var web3 = new Web3(
        new Web3.providers.HttpProvider(
          serverArr[blockTimestamp % serverArr.length]
        )
      );

      const VPADADD = "0x66e76B0F2c69cfD9282F1D80F6F00686d611452b";
      var Decimal = 10 ** 18;
      let token = "0x51FE2E572e97BFEB1D719809d743Ec2675924EDc";
      token = token.toLowerCase();
      const VPADContract = new web3.eth.Contract(abi, VPADADD);
      var stakingNUM = await VPADContract.methods
        .stakingNonce(userAddress)
        .call();

      let total = 0;
      for (var i = 0; i < stakingNUM; i++) {
        const TimeToUnlock = await VPADContract.methods
          .stakingInfoForAddress(userAddress, i)
          .call();
        Timestacking = new Date(TimeToUnlock[2] * 1000).toLocaleString(
          undefined,
          { timeZone: "UTC" }
        );

        const staking = await VPADContract.methods
          .stakingInfoForAddress(userAddress, i)
          .call();
        let newstaking = staking[4] / Decimal;
        total += newstaking;
      }

      if (total == 0) {
        resolve(null);
      }

      let dataObject = {
        userAddress: userAddress,
        chain: "ETH",
        protocolName: "vlaunch",
        tag: "Staked",
        poolName: "VPAD",
        balance: total,
        balanceSymbol: "VPAD",
        balanceContractAddress: token,
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
