const { Octokit } = require('octokit');

async function main() {
  const now = new Date();
  const token = process.argv[2];
  const owner = process.argv[3];
  const repo = process.argv[4];

  process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
  });

  const octokit = new Octokit({
    auth: token,
  });

  while (true) {
    // Check status
    try {
      const result = await octokit.request('GET /repos/{owner}/{repo}/pages/builds/latest', {
        owner,
        repo,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      console.log(result.data.created_at, now)

      if (result.data.create_at > now) {
        if (deployment.status === 'succeed') {
          console.log("Start verifying")
          break;
        }
      }
    } catch (error) {}
  }

  const result = await octokit.request('GET /repos/{owner}/{repo}/pages/builds/latest', {
    owner,
    repo,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  console.log('Verifying pages', result);
}

main();
