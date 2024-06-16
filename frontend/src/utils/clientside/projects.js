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