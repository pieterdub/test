


function main() {
  const token = process.argv[2];

  process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
  });
  
  // Verify merkle tree data (before HashRegistry checks)
  console.log("Verifying pages", token)
}

main();
