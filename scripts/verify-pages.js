const assert = require('node:assert');
const { go } = require('@api3/promise-utils');
const dapiPricingCurrentHashData = require('../data/dapi-pricing-merkle-tree-root/current-hash.json');
const { logSuccessMessage } = require('./verification/utils');

async function fetchData(endpoint) {
  const result = await go(async () => {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}. Status ${response.status}`);
    }
    return await response.json();
  });

  if (result.error) {
    throw result.error;
  }

  return result.data;
}

async function main() {
  const baseUrl = 'https://pieterdub.github.io/test';

  await assertPricingEndpoints(baseUrl);

  logSuccessMessage('Successfully verified gh pages');
}

async function assertPricingEndpoints(baseUrl) {
  const ghPageResult = (await fetchData(`${baseUrl}/market/dapi-pricing-merkle/data.json`));
  assert.equal(
    dapiPricingCurrentHashData.timestamp,
    ghPageResult.timestamp,
    `Expected gh pages dapi-pricing-merkle timestamp to match timestamp in local current-hash.json`
  );
  assert.equal(
    dapiPricingCurrentHashData.hash,
    ghPageResult.hash,
    `Expected gh pages dapi-pricing-merkle hash to match hash in local current-hash.json`
  );
}

main();
