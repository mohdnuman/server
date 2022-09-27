const mongoose = require("mongoose");
const db = mongoose.createConnection("mongodb+srv://mohdnuman:_9!-kAExvCLxEsB@cluster0.rvvxe.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

db.on("connected", function () {
  console.log(`MongoDB :: connected ${this.name}`);
});

const userSchema = new mongoose.Schema(
  {
    userAddress: {
      type: String,
    },
    protocolName: {
      type: String,
    },
    chain: {
      type: String,
      default: "ETH",
    },
    tag: {
      type: String,
    },
    poolName: {
      type: String,
    },
    healthRate: {
      type: String,
    },
    supplied: {
      type: Number,
    },
    suppliedSymbol: {
      type: String,
    },
    suppliedContractAddress: {
      type: String,
    },
    borrowed: {
      type: Number,
    },
    borrowedSymbol: {
      type: String,
    },
    borrowedContractAddress: {
      type: String,
    },
    balance: {
      type: Number,
    },
    balanceSymbol: {
      type: String,
    },
    balanceContractAddress: {
      type: String,
    },
    rewards: {
      type: Number,
    },
    rewardsSymbol: {
      type: String,
    },
    rewardsContractAddress: {
      type: String,
    },
    unlockTime: {
      type: Date,
    },
    blockTimestamp: {
      type: Number,
    },
    claimableAmount: {
      type: Number,
    },
    claimableAmountSymbol: {
      type: String,
    },
    claimableAmountContractAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = db.model("user", userSchema);

module.exports = {
  UserModel
};
