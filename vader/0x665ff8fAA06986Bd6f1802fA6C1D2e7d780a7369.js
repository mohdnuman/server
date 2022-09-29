const abi = require("./vader_abi.json");
const Web3 = require("web3");
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

getData = async (userAddress, blockTimestamp, logs, methodId) => {
  return new Promise(async (resolve, reject) => {
    try {
      var web3 = new Web3(
        new Web3.providers.HttpProvider(
          serverArr[blockTimestamp % serverArr.length]
        )
      );
      const staker = "0x665ff8fAA06986Bd6f1802fA6C1D2e7d780a7369";
      const stakingInstance = new web3.eth.Contract(abi, staker);

      const vader = "0x2602278EE1882889B946eb11DC0E810075650983";
      const vaderInstance = new web3.eth.Contract(abi, vader);

      let xVader = await stakingInstance.methods.balanceOf(userAddress).call();
      let totalVaderContract = await vaderInstance.methods
        .balanceOf(staker)
        .call();
      let totalShares = await stakingInstance.methods.totalSupply().call();
      let amount = (xVader * totalVaderContract) / totalShares;
      amount = (amount / 10 ** 18);

      if (amount == 0) {
        resolve(null);
      }

      let dataObject = {
        userAddress: userAddress,
        chain: "ETH",
        protocolName: "vader",
        tag: "Staked",
        poolName: "VADER",
        balance: amount,
        balanceSymbol: "VADER",
        balanceContractAddress: vader.toLowerCase(),
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
