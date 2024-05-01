import {
    S3Client,
    ListBucketsCommand,
    ListObjectsV2Command,
    GetObjectCommand,
    PutObjectCommand
} from "@aws-sdk/client-s3"
import fsp  from 'fs/promises'
import {createReadStream} from 'fs'
import path from 'path'
import mime from "mime-types"


const {ACCOUNT_ID, ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUILD_PATH } = process.env

const S3 = new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
});

export async function uploadFiles({projectId, slug}) {
  const buildLocation = path.join(BUILD_PATH, projectId, "dist")
  console.log(buildLocation)
  const getFolderContents = await fsp.readdir(buildLocation, {recursive: true})
  // console.log(getFolderContents)
  for (let file of getFolderContents) {
    const filePath = path.join(buildLocation, file)
    //console.log(await fsp.lstat(filePath))
    const fileStat = await fsp.lstat(filePath)
    if (fileStat.isDirectory()) continue
    file = file.replaceAll("\\", "/")
    process.stdout.write(`Uploading ${file}: `)
    const startTime = performance.now()
    const baseFile = path.basename(filePath)
    const command = new PutObjectCommand({
      Bucket: 'webhosting',
      Key: `__build/${slug}/${file}`,
      Body: createReadStream(filePath),
      ContentType: mime.lookup(filePath) || "text/plain",
    })
    const upload = await S3.send(command)
    //console.log(upload)
    const endTime = performance.now()
    if (upload['$metadata']?.httpStatusCode !== 200){
        process.stdout.write('Failed')
        throw Error(`${projectId} : Uploading ${baseFile} failed`)
    }
    const timeTakenSec = ((endTime - startTime) / 1000).toFixed(1)
    process.stdout.write(`Success (${timeTakenSec}s)`)
    console.log('')
  }
  console.log(`${projectId} : Successfully uploaded!`)
}
//uploadFile()

async function main() {
    console.log(
        await S3.send(
           new ListObjectsV2Command({ Bucket: 'webhosting' })
        )
    );
}

