const { Octokit } = require('octokit')

async function main() {
  const token = process.argv[2];
  const owner = process.argv[3];
  const repo = process.argv[4];

  process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
  });

  const octokit = new Octokit({
    auth: token
  })
  
  const result = await octokit.request('GET /repos/pieterdub/test/pages/builds/latest', {
    owner,
    repo,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  console.log("Verifying pages", result)
}

main();
