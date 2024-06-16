'use client'

import { getDeploymentLog } from "@/utils/clientside/projects"
import { useEffect, useState } from "react";

const formatLog = (log) => {
    const infoKeyword = 'info:';
    const errorKeyword = 'error:';
  
    if (log.startsWith(infoKeyword)) {
      return (
        <span key={log} className="text-yellow-500 font-bold">
          {infoKeyword}
          <span className="text-white font-normal">{log.slice(infoKeyword.length)}</span>
        </span>
      );
    } else if (log.startsWith(errorKeyword)) {
      return (
        <span key={log} className="text-red-500 font-bold">
          {errorKeyword}
          <span className="text-white font-normal">{log.slice(errorKeyword.length)}</span>
        </span>
      );
    }
    return <span key={log} className="text-white">{log}</span>;
};

const LogDisplay = ({ logs }) => {
    return (
      <div className="p-4 bg-gray-800 rounded-lg shadow-md">
        <div className="whitespace-pre-wrap overflow-auto max-h-96 p-2">
          {logs.split('\n').map((log, index) => (
            <div key={index}>
              {formatLog(log)}
            </div>
          ))}
        </div>
      </div>
    );
  };

export default async function DeploymentLog ({deploymentId}) {

    const [deploymentLog, setDeploymentLog] = useState()
    useEffect(() => {
        ( async () => {
            const deploymentLog = await getDeploymentLog(deploymentId)
            setDeploymentLog(deploymentLog)
        })()
    }, [])
    if (!deploymentLog) return <p className="w-full text-center ">Fething logs</p>
    if (!deploymentLog?.outputLog) return <p className="w-full text-center ">No logs for this deployment!</p>
    return (
    <section className="h-full">
        <p className="font-semibold mb-2">Deployment Log:</p>
        <LogDisplay logs={deploymentLog.outputLog} />
    </section>
    )
}