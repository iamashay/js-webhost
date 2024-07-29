
import { getDeployment } from "@/utils/serverside/projects";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DeploymentInfo } from "@/components/Deployment";

const statusDetails = [
  { status: "Initial", text: "The project is initiated.", color: "bg-blue-500" },
  { status: "Queue", text: "The project is queued in RabbitMQ.", color: "bg-yellow-500" },
  { status: "Building", text: "The project is being processed.", color: "bg-gray-500" },
  { status: "Built", text: "The project has been built. Deployment started.", color: "bg-teal-500" },
  { status: "Deploying", text: "The project is being uploaded to the web server.", color: "bg-purple-500" },
  { status: "Deployed", text: "The project has been successfully deployed.", color: "bg-green-500" },
  { status: "Stopped", text: "The deployment has been stopped.", color: "bg-red-500" },
  { status: "Error", text: "There was an error during deployment.", color: "bg-red-700" },
];

export default async function Deployment ({params}) {
  const {id} = params
  const deploymentData = await getDeployment(id)
  //console.log(deploymentData, id)

  return (
      <DeploymentInfo data={deploymentData} statusDetails={statusDetails} />
  );
};

