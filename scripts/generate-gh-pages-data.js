async function generateGHPagesData() {
  logSuccessMessage('Successfully validated')
  logInfoMessage('Skipping validation')
  logVerificationFailure('Failed validation')
}

function logSuccessMessage(message) {
  console.log('\x1b[32m%s\x1b[0m', `\u2713 ${message}\n`);
}

function logInfoMessage(message) {
  console.log('\x1b[33m%s\x1b[0m', `\u2298 ${message}\n`);
}

function logVerificationFailure(err) {
  const message = err instanceof Error ? err.message : err;
  console.error('\x1b[31m%s\x1b[0m', `\u2718 Verification failed. ${message}\n`);
}

generateGHPagesData().catch((error) => {
  console.error(`Error generating gh pages data:`, error);
  process.exit(1);
});
