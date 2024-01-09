const fetchData = async (pagesEndpoint) => {
  try {
    const response = await fetch(pagesEndpoint);

    // Check if the request was successful (status code 200)
    if (response.ok) {
      const data = await response.text();
      console.log('GitHub Pages response:', data);
    } else {
      console.error('Failed to fetch GitHub Pages. Status:', response.status);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function main() {
  const owner = process.argv[2];
  const repo = process.argv[3];

  console.log('Trying to verify pages');

  const baseUrl = `https://${owner}.github.io/${repo}`

  process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
  });

  const result = await fetchData(`${baseUrl}`)

  console.log(JSON.stringify(result, null, 2),'Done');

}

main();
