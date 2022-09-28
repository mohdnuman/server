const abi = require("./sushiswap_abi.json");
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
      let LPtoken = logs[logs.length - 1].address;
      if (methodId == "0xded9382a") {
        for (let i = 0; i < logs.length; i++) {
          if (
            logs[i].topics[0] ===
            "0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496"
          ) {
            LPtoken = logs[i].address;
            break;
          }
        }
      } else if (methodId == "0x02751cec") {
        LPtoken = logs[logs.length - 3].address;
      } else if (methodId == "0xaf2979eb") {
        LPtoken = logs[logs.length - 4].address;
      } else if (methodId == "0x5b0d5984") {
        LPtoken = logs[logs.length - 3].address;
      }
      const contract = new web3.eth.Contract(abi, LPtoken);
      let LPtokensReceived = await contract.methods
        .balanceOf(userAddress)
        .call();
      let totalSupply = await contract.methods.totalSupply().call();
      let reserves = await contract.methods.getReserves().call();
      let token0 = await contract.methods.token0().call();
      let token1 = await contract.methods.token1().call();
      const token0instance = new web3.eth.Contract(abi, token0);
      const token1instance = new web3.eth.Contract(abi, token1);
      let symbol0 = await token0instance.methods.symbol().call();
      let symbol1 = await token1instance.methods.symbol().call();
      let decimals0 = await token0instance.methods.decimals().call();
      let decimals1 = await token1instance.methods.decimals().call();

      let token0amount =
        (LPtokensReceived / totalSupply) * (reserves[0] / 10 ** decimals0);
      let token1amount =
        (LPtokensReceived / totalSupply) * (reserves[1] / 10 ** decimals1);


      let dataObject = [
        {
          userAddress: userAddress,
          chain: "ETH",
          protocolName: "sushiswap",
          tag: "Liquidity Pool",
          poolName: symbol0 + " + " + symbol1,
          balance: token0amount,
          balanceSymbol: symbol0,
          balanceContractAddress: token0.toLowerCase(),
          blockTimestamp: blockTimestamp,
        },
        {
          userAddress: userAddress,
          chain: "ETH",
          protocolName: "sushiswap",
          tag: "Liquidity Pool",
          poolName: symbol0 + " + " + symbol1,
          balance: token1amount,
          balanceSymbol: symbol1,
          balanceContractAddress: token1.toLowerCase(),
          blockTimestamp: blockTimestamp,
        },
      ];

      resolve(dataObject);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  getData: getData,
};
