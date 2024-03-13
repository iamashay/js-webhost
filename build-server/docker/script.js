const { spawn, exec } = require('child_process');
const cwd = '/home/app/output'
const path = require('path')
const {uploadFile} = require('./S3')
const {PROJECT_ID, BUILD_FOLDER, GIT_REPOSITORY_URL, MAX_GIT_SIZE} = process.env
const SOURCE_PATH = path.join(__dirname, 'output', BUILD_FOLDER)

const getGitDetails = async (userName, repoName) => {
  try {
      const response = await fetch(`https://api.github.com/repos/${userName}/${repoName}`)
      if (response.status !== 200) throw Error("No repo found!")
      return response.json()
  } catch(e) {
      console.error(e)
      throw Error('Error getting git details')
  }
}

const getUserRepoName = (giturl) => {
  const girURLSplitArr = giturl.split('/')
  const length = girURLSplitArr.length
  if (length < 1) throw Error("Not a valid github url")
  return [girURLSplitArr[length-2], girURLSplitArr[length-1]?.replace(".git", "")]
}


async function runExecCommand(title, command, options = {}) {
  return new Promise((resolve, reject) => {
    const child = exec(command, options);

    child.on('spawn', () => console.log(`${title} started...`))

    child.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    child.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command '${command}' failed with exit code ${code}`));
      }
    });
  });
}


(async () => {
  try {
    const startTime = performance.now()
    const [userName, repoName] = getUserRepoName(GIT_REPOSITORY_URL)
    //console.log(userName, repoName)
    const getDetails = await getGitDetails(userName, repoName)
    if (getDetails?.size > MAX_GIT_SIZE) throw Error("Repo is too large!")
    //Install git
    await runExecCommand('Clone github', `git clone ${GIT_REPOSITORY_URL} ${cwd};`)
    // Run npm install
    await runExecCommand('Installing Packages', 'npm install', {cwd});
    setTimeout(()=> 1, 60000)
    // Run npm build after successful installation
    await runExecCommand('Building Project', 'npm run build', {cwd});
    // Upload project to S3
    await uploadFile(SOURCE_PATH)
    const endTime = performance.now()
    const deployTimeTaken = ((endTime - startTime) / 1000).toFixed(1)
    console.log(`Deploy successfull! (${deployTimeTaken}s)`);
  } catch (error) {
    console.error(error.message);
  }
})();
