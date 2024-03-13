const {
    S3Client,
    ListBucketsCommand,
    ListObjectsV2Command,
    GetObjectCommand,
    PutObjectCommand
} = require("@aws-sdk/client-s3")
const fsp = require('fs').promises
const {createReadStream} = require('fs')
const path = require('path')
const mime = require("mime-types");

const SOURCE_PATH = path.join(__dirname, 'home')

const {ACCOUNT_ID, ACCESS_KEY_ID, SECRET_ACCESS_KEY, PROJECT_ID = Math.floor(Math.random() * 10)} = process.env

const S3 = new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
});

async function uploadFile(directory) {
  const getFolderContents = await fsp.readdir(directory, {recursive: true})
  // console.log(getFolderContents)
  for (file of getFolderContents) {
    const filePath = path.join(directory, file)
    if ((await fsp.lstat(filePath)).isDirectory()) continue;
    file = file.replaceAll("\\", "/")
    process.stdout.write(`Uploading ${file}: `)
    const startTime = performance.now()
    const baseFile = path.basename(filePath)
    const command = new PutObjectCommand({
      Bucket: 'webhosting',
      Key: `__build/${PROJECT_ID}/${file}`,
      Body: createReadStream(filePath),
      ContentType: mime.lookup(filePath) || "text/plain",
    })
    const upload = await S3.send(command)
    //console.log(upload)
    const endTime = performance.now()
    if (upload['$metadata']?.httpStatusCode !== 200){
        process.stdout.write('Failed')
        throw Error(`Uploading ${baseFile} failed`)
    }
    const timeTakenSec = ((endTime - startTime) / 1000).toFixed(1)
    process.stdout.write(`Success (${timeTakenSec}s)`)
    console.log('')
  }
}
//uploadFile()

async function main() {
    console.log(
        await S3.send(
           new ListObjectsV2Command({ Bucket: 'webhosting' })
        )
    );
}

module.exports = {uploadFile}