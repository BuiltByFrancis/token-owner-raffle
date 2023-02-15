const { Network, Alchemy } = require("alchemy-sdk");
require("dotenv").config();

const { ALCHEMY_KEY, CONTRACT_ADDRESS } = process.env;

const settings = {
  apiKey: ALCHEMY_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);
const winners = 10;

async function main() {
  const response = await alchemy.nft.getOwnersForContract(CONTRACT_ADDRESS, {
    withTokenBalances: true,
  });

  const cleaned = response.owners
    .filter((o) => addressIsValid(o.ownerAddress))
    .map((o) => ({
      ownerAddress: o.ownerAddress,
      balance: o.tokenBalances.length,
    }));

  const total = cleaned.reduce((accumulator, c) => accumulator + c.balance, 0);
  const result = [];
  for (let i = 0; i < winners; ) {
    var current = getWinner(getRandomInt(total), cleaned);
    if (!result.includes(current.ownerAddress)) {
      result.push(current.ownerAddress);
      ++i;
    }
  }

  console.log(result);
}

function addressIsValid(address) {
  return address != "0x0000000000000000000000000000000000000000";
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getWinner(token, owners) {
  let goal = token;
  for (let item of owners) {
    if (goal < item.balance) {
      return item;
    }
    goal -= item.balance;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
