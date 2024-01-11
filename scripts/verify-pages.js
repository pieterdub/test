const assert = require('node:assert');
const forEach = require('lodash/forEach');
const dAPIManagementCurrentHashData = require('../data/dapi-management-merkle-tree-root/current-hash.json');
const dAPIPricingCurrentHashData = require('../data/dapi-pricing-merkle-tree-root/current-hash.json');
const signedApiUrlCurrentHashData = require('../data/signed-api-url-merkle-tree-root/current-hash.json');
const { logSuccessMessage } = require('./utils');

const DAPI_MANAGEMENT_SUBFOLDER = 'dapi-management-merkle-tree-root';
const DAPI_PRICING_SUBFOLDER = 'dapi-pricing-merkle-tree-root';
const SIGNED_API_URL_SUBFOLDER = 'signed-api-url-merkle-tree-root';

const subfolderDataMapping = {
  [DAPI_MANAGEMENT_SUBFOLDER]: dAPIManagementCurrentHashData,
  [DAPI_PRICING_SUBFOLDER]: dAPIPricingCurrentHashData,
  [SIGNED_API_URL_SUBFOLDER]: signedApiUrlCurrentHashData,
};

const fetchData = async (pagesEndpoint) => {
  try {
    const response = await fetch(pagesEndpoint);

    // Check if the request was successful (status code 200)
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Failed to fetch GitHub Pages. Status:', response.status);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

async function main() {
  const owner = process.argv[2];
  const repo = process.argv[3];

  const baseUrl = `https://${owner}.github.io/${repo}`;

  forEach(Object.keys(subfolderDataMapping), async (merkleTree) => {
    await assertCurrentHashData(merkleTree, baseUrl);
  });

  logSuccessMessage('Successfully verified gh pages');
}

async function assertCurrentHashData(merkleTree, baseUrl) {
  const data = subfolderDataMapping[merkleTree];

  if (merkleTree != DAPI_PRICING_SUBFOLDER) {
    const ghPageResult = await fetchData(`${baseUrl}/data/${merkleTree}/current-hash.json`);
    assert.equal(
      data.timestamp,
      ghPageResult.timestamp,
      `Expected gh pages ${merkleTree} timestamp to match timestamp in local current-hash.json`
    );
    assert.equal(
      data.hash,
      ghPageResult.hash,
      `Expected gh pages ${merkleTree} hash to match hash in local current-hash.json`
    );
  } else {
    const ghPageResult = await fetchData(`${baseUrl}/data/${merkleTree}/metadata.json`);
    assert.equal(
      data.timestamp,
      ghPageResult.timestamp,
      `Expected gh pages ${merkleTree} timestamp to match timestamp in local current-hash.json`
    );
    assert.equal(
      data.hash,
      ghPageResult.hash,
      `Expected gh pages ${merkleTree} hash to match hash in local current-hash.json`
    );
  }
}

main();
