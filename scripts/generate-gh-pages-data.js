const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');
const { ethers } = require('ethers');
const { createDapiPricingMerkleTree } = require('./utils');
const dAPIManagementCurrentHashData = require('../data/dapi-management-merkle-tree-root/current-hash.json');
const dAPIPricingCurrentHashData = require('../data/dapi-pricing-merkle-tree-root/current-hash.json');
const signedApiUrlCurrentHashData = require('../data/signed-api-url-merkle-tree-root/current-hash.json');
const packageInfo = require('../package.json');

async function generateGHPagesData() {
  await generateMarketData();
  await splitPricingValues();
  await generateHashRegisterData();

  const execute = promisify(exec);
  await execute('yarn format');
}

async function generateMarketData() {
  const outputPath = path.join(__dirname, '..', 'market');

  const managementDataPath = path.join(outputPath, 'dapi-management-merkle');
  await fs.promises.mkdir(managementDataPath, { recursive: true });
  const pricingDataPath = path.join(outputPath, 'dapi-pricing-merkle');
  await fs.promises.mkdir(pricingDataPath, { recursive: true });
  const signedApiDataPath = path.join(outputPath, 'signed-api-url-merkle');
  await fs.promises.mkdir(signedApiDataPath, { recursive: true });

  writeMarketData(`${managementDataPath}/data.json`, dAPIManagementCurrentHashData);
  writeMarketData(`${pricingDataPath}/data.json`, dAPIPricingCurrentHashData);
  writeMarketData(`${signedApiDataPath}/data.json`, signedApiUrlCurrentHashData);
}

async function generateHashRegisterData() {
  const outputPath = path.join(__dirname, '..', 'hash-register');

  await fs.promises.mkdir(outputPath, { recursive: true });
  fs.writeFileSync(`${outputPath}/version.json`, JSON.stringify(packageInfo.version, null, 4));
}

function writeMarketData(path, currentDataHash) {
  const data = {
    timestamp: currentDataHash.timestamp,
    hash: currentDataHash.hash,
  };

  fs.writeFileSync(path, JSON.stringify(data, null, 4));
}

async function splitPricingValues() {
  const outputPath = path.join(__dirname, '..', 'market', 'dapi-pricing-merkle');

  const { merkleTreeValues } = dAPIPricingCurrentHashData;

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
      const content = { merkleTreeRoot: tree.root, leaves: valueCollection };

      const chainPath = path.join(outputPath, chainId);
      const filePath = path.join(chainPath, `${dapiName}.json`);
      await fs.promises.mkdir(chainPath, { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
    }
  }
}

generateGHPagesData().catch((error) => {
  console.error(`Error generating gh pages data:`, error);
  process.exit(1);
});
