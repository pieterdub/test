const github = require('@actions/github')

async function main() {
  const token = process.argv[2];

  process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
  });

  const octokit = new github.getOctokit({
    auth: token
  })
  
  const result = await octokit.request('GET /repos/{owner}/{repo}/pages/builds/latest', {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  console.log("Verifying pages", result)
}

main();
