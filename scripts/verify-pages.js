const assert = require ('node:assert');
const { go } = require ('@api3/promise-utils');
const dAPIManagementCurrentHashData = require ('../data/dapi-management-merkle-tree-root/current-hash.json');
const dAPIPricingCurrentHashData = require ('../data/dapi-pricing-merkle-tree-root/current-hash.json');
const signedApiUrlCurrentHashData = require ('../data/signed-api-url-merkle-tree-root/current-hash.json');
const packageInfo = require ('../package.json');
const { logSuccessMessage } = require ('./verification/utils');
const { pick } = require ('lodash');

const DAPI_MANAGEMENT_SUBFOLDER = 'dapi-management-merkle';
const DAPI_PRICING_SUBFOLDER = 'dapi-pricing-merkle';
const SIGNED_API_URL_SUBFOLDER = 'signed-api-url-merkle';


const subfolderDataMapping = {
  [DAPI_MANAGEMENT_SUBFOLDER]: dAPIManagementCurrentHashData,
  [DAPI_PRICING_SUBFOLDER]: dAPIPricingCurrentHashData,
  [SIGNED_API_URL_SUBFOLDER]: signedApiUrlCurrentHashData,
};

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

  await assertMarketEndpoints(baseUrl);
  await assertHashRegisterEndpoints(baseUrl);

  logSuccessMessage('Successfully verified gh pages');
}

async function assertMarketEndpoints(baseUrl) {
  await assertMerkleData(DAPI_PRICING_SUBFOLDER, `${baseUrl}/market/${DAPI_PRICING_SUBFOLDER}/data.json`);
  await assertMerkleData(DAPI_MANAGEMENT_SUBFOLDER, `${baseUrl}/market/${DAPI_MANAGEMENT_SUBFOLDER}/data.json`);
  await assertMerkleData(SIGNED_API_URL_SUBFOLDER, `${baseUrl}/market/${SIGNED_API_URL_SUBFOLDER}/data.json`);
}

async function assertMerkleData(merkleTree, endpoint) {
  const data = subfolderDataMapping[merkleTree];

  const ghPageResult = (await fetchData(endpoint));
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

async function assertHashRegisterEndpoints(baseUrl) {
  const ghPageResult = (await fetchData(`${baseUrl}/hash-register/version.json`));
  assert.equal(
    packageInfo.version,
    ghPageResult,
    `Expected gh pages hash register version to match version in local package.json`
  );

  const allMerkleTypes = {
    'dapi-management-merkle': pick(dAPIManagementCurrentHashData, ['hash', 'timestamp']),
    'dapi-pricing-merkle': pick(dAPIPricingCurrentHashData, ['hash', 'timestamp']),
    'signed-api-url-merkle': pick(signedApiUrlCurrentHashData, ['hash', 'timestamp']),
  };

  const ghPageAllTypesResult = (await fetchData(`${baseUrl}/hash-register/all-merkle-types/data.json`));
  assert.equal(
    allMerkleTypes,
    ghPageAllTypesResult,
    `Expected gh pages hash register all merkle types to match data in local current-hash.json files`
  );
}

main();
