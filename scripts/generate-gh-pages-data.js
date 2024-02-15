const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');
const { ethers } = require('ethers');
const { createDapiPricingMerkleTree } = require('./utils');

const dapiPricingCurrentHashData = require('../data/dapi-pricing-merkle-tree-root/current-hash.json');


async function generateGHPagesData() {
  await generatePricingRootData();
  await splitPricingValues();

  const execute = promisify(exec);
  await execute('yarn format');
}

async function generatePricingRootData() {
  const outputPath = path.join(__dirname, '..', 'market');

  const pricingDataPath = path.join(outputPath, 'dapi-pricing-merkle');
  fs.mkdirSync(pricingDataPath, { recursive: true });

  const data = {
    timestamp: dapiPricingCurrentHashData.timestamp,
    hash: dapiPricingCurrentHashData.hash,
  };

  fs.writeFileSync(`${pricingDataPath}/data.json`, JSON.stringify(data, null, 4));
}

async function splitPricingValues() {
  const outputPath = path.join(__dirname, '..', 'market', 'dapi-pricing-merkle');

  const { merkleTreeValues } = dapiPricingCurrentHashData;

  const tree = createDapiPricingMerkleTree(merkleTreeValues);
  const valuesByChainAndDapiName = {};

  for (const [idx, item] of tree.entries()) {
    const [hashedDapiName, chainId] = item;
    const dapiName = ethers.utils.parseBytes32String(hashedDapiName);
    const name = dapiName.replace('/', '-');

    const proof = tree.getProof(idx);
    const leaf = { value: item, proof };

    if (!valuesByChainAndDapiName[chainId]) {
      valuesByChainAndDapiName[chainId] = {};
    }

    if (!valuesByChainAndDapiName[chainId][name]) {
      valuesByChainAndDapiName[chainId][name] = [leaf];
    } else {
      valuesByChainAndDapiName[chainId][name].push(leaf);
    }
  }

  for (const chainId in valuesByChainAndDapiName) {
    for (const dapiName in valuesByChainAndDapiName[chainId]) {
      const valueCollection = valuesByChainAndDapiName[chainId][dapiName];
      const content = { merkleRoot: tree.root, leaves: valueCollection };

      const chainPath = path.join(outputPath, chainId);
      const filePath = path.join(chainPath, `${dapiName}.json`);
      fs.mkdirSync(chainPath, { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
    }
  }
}

generateGHPagesData().catch((error) => {
  console.error(`Error generating gh pages data:`, error);
  process.exit(1);
});
