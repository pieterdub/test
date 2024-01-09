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

  const val = await octokit.request('GET /repos/{owner}/{repo}/pages/builds/latest', {
    owner,
    repo,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
      'x-ratelimit-used': true,
      'x-ratelimit-reset': true,
    },
  });

  console.log(JSON.stringify(val, null, 2), now);

  // while (true) {
  //   // Check status
  //   try {
  //     const result = await octokit.request('GET /repos/{owner}/{repo}/pages/builds/latest', {
  //       owner,
  //       repo,
  //       headers: {
  //         'X-GitHub-Api-Version': '2022-11-28',
  //       },
  //     });

  //     console.log(result.data.created_at, now);

  //     if (result.data.create_at > now) {
  //       if (deployment.status === 'succeed') {
  //         console.log('Start verifying');
  //         break;
  //       }
  //     }
  //   } catch (error) {}

  //   // Sleep for 10 seconds
  //   await sleep(15000);
  // }

  // const result = await octokit.request('GET /repos/{owner}/{repo}/pages/builds/latest', {
  //   owner,
  //   repo,
  //   headers: {
  //     'X-GitHub-Api-Version': '2022-11-28',
  //   },
  // });

  // console.log('Verifying pages', result);
}

main();
