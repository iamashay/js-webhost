export default function StatusInfo({ statusDetails, currentStatus }) {

    // console.log(statusDetails)

    return (
        <span className="flex items-center">
            {statusDetails?.map((statusInfo) => {
                const { status, text, color } = statusInfo || { text: "No status information available.", color: "bg-gray-500" }
                if (currentStatus != status) return

                return (
                    <>
                        <span className={`${color} rounded-md p-1 m-1 text-sm text-white `}>{status}</span> ( {text} )
                    </>
                )
            })}
        </span>


    );
}