const { Octokit } = require('octokit');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const now = new Date();
  const token = process.argv[2];
  const owner = process.argv[3];
  const repo = process.argv[4];

  const octokit = new Octokit({
    auth: token,
  });

  console.log('Trying to verify pages');

  while (true) {
    // Check status
    try {
      const result = await octokit.request('GET /repos/{owner}/{repo}/pages/builds/latest', {
        owner,
        repo,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
          'x-ratelimit-used': true,
          'x-ratelimit-reset': true,
        },
      });

      console.log(JSON.stringify(result, null, 2))

      console.log(result.data.created_at, now);

      if (result.data.created_at > now) {
        if (result.data.status === 'built') {
          console.log('Start verifying');
          break;
        }
      } else {
        if (new Date() - startTime > 60 * 1000) {
          console.log('Exiting loop after 1 minute without the correct result.');
          break;
        }
      }
    } catch (error) {}

    // Sleep for 10 seconds
    await sleep(15000);
  }

}

main();
