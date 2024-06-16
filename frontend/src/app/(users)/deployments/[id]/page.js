import { getDeployment } from "@/utils/serverside/projects";
import { Suspense } from "react";
import dynamic from "next/dynamic";
const DeploymentLog = dynamic(() => import("@/components/DeploymentLog"), {ssr: false}) ;

export default async function Deployment ({params}) {
  const {id} = params
  const deploymentData = await getDeployment(id)
  const createdAt = new Date(deploymentData.createdAt)?.toLocaleDateString()
  console.log(deploymentData, id)
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Deployment Information</h1>
      <div className="border p-4 rounded-md mb-4">
        <p><span className="font-semibold">Deployment ID:</span> {deploymentData.id}</p>
        <p><span className="font-semibold">Deployment Date:</span> {createdAt}</p>
        <p><span className="font-semibold">Deployment Status:</span> {deploymentData.status}</p>
      </div>
      <DeploymentLog deploymentId={id} />    
    </div>
  );
};

