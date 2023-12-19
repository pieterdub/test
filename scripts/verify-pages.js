const Octokit = require('octokit')

async function main() {
  const token = process.argv[2];

  process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
  });

  const octokit = new Octokit({
    auth: token
  })
  
  const result = await octokit.request('GET /repos/pieterdub/test/pages', {
    owner: 'pieterdub',
    repo: 'test',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  console.log("Verifying pages", result)
}

main();
