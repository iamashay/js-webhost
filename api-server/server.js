const express = require('express')
const {queueClient} = require('./queue/queueClient')
const app = express()
require('dotenv').config()
const z = require("zod");

const {BUILDQUEUE, MAX_GIT_SIZE} = process.env

let conn, gitProducerChannel

(async () => {
 conn = await queueClient()
 gitProducerChannel = await conn.createChannel()
})()

const port = process.env.PORT || 3000

app.use(express.json());

const buildSchema = z.object({
    gitURL: z.string()
                .includes('github', {message: 'Not a valid github URL'})
                .trim().url({message: "Not a valid URL"})
})


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

app.post('/build', async (req, res) => {
    try {    
        const body = await buildSchema.parseAsync(req.body) 
        const {gitURL} = body
        const [userName, repoName] = getUserRepoName(gitURL)
        //console.log(userName, repoName)
        const getDetails = await getGitDetails(userName, repoName)
        if (getDetails?.size > MAX_GIT_SIZE) throw Error("Repo is too large!")
        // console.log(getDetails)
        await gitProducerChannel.assertQueue(BUILDQUEUE)
        await gitProducerChannel.sendToQueue(BUILDQUEUE, Buffer.from(gitURL));
        res.json(body)
    } catch (e) {
        res.status(400).json({error: e.message})
    }
})

app.listen(port, console.log('Server Started on port ' +port))