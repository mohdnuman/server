const abi=require("./hex_abi.json");
const Web3 = require("web3");
var web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://mainnet.infura.io/v3/da5fdf67575f4552998efd9df43f6c9b"
  )
);


getData=async(userAddress,blockTimestamp)=>{
    return new Promise(async (resolve, reject) => {
        try{
            const address="0x2b591e99afe9f32eaa6214f7b7629768c40eeb39";
            const contract=new web3.eth.Contract(abi,address);
            let stakeCount=await contract.methods.stakeCount(userAddress).call();
            let totalStake=0;
            for(let i=0;i<stakeCount;i++){
                let stake=await contract.methods.stakeLists(userAddress,i).call();
                totalStake+=stake.stakedHearts/10**8;
            }
            console.log("staked balance of",userAddress,totalStake,"HEX");

            let dataObject={
                userAddress:userAddress,
                chain:"ETH",
                protocolName:"hex",
                tag:"Staked",
                poolName:"HEX",
                balance:totalStake,
                balanceSymbol:"HEX",
                balanceContractAddress:address.toLowerCase(),
                blockTimestamp:blockTimestamp,
            }
            resolve(dataObject);
        }catch(error){
            reject(error);
        }
    });
}

module.exports={
    getData:getData
}

