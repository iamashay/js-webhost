'use client'
import Link from "next/link"
import DeploymentLog from "./DeploymentLog"
import { useEffect, useState } from "react"
import { getDeployment } from "@/utils/clientside/projects"
import toast from "react-hot-toast"
import StatusInfo from "./StatusInfo"

const refreshDeploymentData = async ({setDeploymentData, deploymentData, setRefresh}) => {
    setRefresh(true)
    const loadingMsg = toast.loading('Refreshing')
    try {
        if (['Error', 'Deployed'].includes(deploymentData?.status)) {
            toast.dismiss()
            toast.success('No update needed.')
            return
        }
        const newDeploymentData = await getDeployment(deploymentData.id)
        setDeploymentData(newDeploymentData)
        toast.dismiss(loadingMsg)
        toast.success('Done')
    } catch (e) {
        toast.error("Error occured when refreshing the page!")
        toast.dismiss()
    } finally {
        setRefresh(false)
    }
}

export function DeploymentInfo({data, statusDetails}) {

    const [deploymentData, setDeploymentData] = useState(data);
    const [refresh, setRefresh] = useState(false)
    const createdAt = new Date(deploymentData?.createdAt)?.toLocaleDateString()



    return (
        <div className="p-4 flex flex-col">
            <h1 className="text-2xl font-bold mb-4">Deployment Information</h1>
            <button className="btn bg-yellow-500 px-6 py-2 m-4 inline-block self-end" href="projects/new" disabled={refresh} onClick={() => refreshDeploymentData({setDeploymentData, deploymentData, setRefresh})}>Refresh</button>
            <div className="border p-4 rounded-md mb-4">
                <p><span className="font-semibold">Deployment ID:</span> {deploymentData?.id}</p>
                <p suppressHydrationWarning><span className="font-semibold">Deployment Date:</span> {createdAt}</p>
                <p className="flex items-center"><span className="font-semibold">Deployment Status:</span><StatusInfo currentStatus={deploymentData?.status} statusDetails={statusDetails} /> </p>
            </div>
            <DeploymentLog deploymentData={deploymentData} />
        </div>
    )
}