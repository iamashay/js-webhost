import toast from "react-hot-toast"
const API_URL = process.env.NEXT_PUBLIC_API_URL


export const getDeploymentLog = async (deploymentId) => { //client side only
    const deploymentLog = await fetch(`${API_URL}/deployments/${deploymentId}/log`, {
        headers: {
            'Accept': 'application/json',
        },
        credentials: 'include'
    })
    return await deploymentLog.json()
}

export const deployProject = async ({ projectId, setLoading, router }) => {
    //setLoading(false)
    const loadingMsg = toast.loading("Deploying project...")
    try {
        const deploy = await fetch(`${API_URL}/projects/deploy`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ projectId }),
            credentials: 'include'
        })
        if (deploy.status !== 200) throw new Error(deploy.error || "Unable to deploy")
        toast.dismiss(loadingMsg)
        toast.success("Project deployed!")
        window.location.reload()
    } catch (e) {
        toast.dismiss(loadingMsg)
        toast.error(e?.message || "Some error occured while deploying project!")
    } finally {
        // setLoading(false)
        toast.dismiss(loadingMsg)
    }
}