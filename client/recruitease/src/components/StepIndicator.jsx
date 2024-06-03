import React from "react";

const StepIndicator = ({ currentStatus, prevStatus }) => {
  const steps = [
    {
      name: "Applied",
      status: "Applied",
      icon: (isActiveOrCompleted) => (
        <svg
          className={`w-3.5 h-3.5 ${
            isActiveOrCompleted ? "text-purple-600" : "text-gray-500"
          }`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 16 12"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M1 5.917 5.724 10.5 15 1.5"
          />
        </svg>
      ),
    },
    {
      name: "Review",
      status: "Review",
      icon: (isActiveOrCompleted) => (
        <svg
          className={`w-3.5 h-3.5 ${
            isActiveOrCompleted ? "text-purple-600" : "text-gray-500"
          }`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 18 20"
        >
          <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
        </svg>
      ),
    },
    {
      name: "Interview",
      status: "Interview",
      icon: (isActiveOrCompleted) => (
        <svg
          className={`w-3.5 h-3.5 ${
            isActiveOrCompleted ? "text-purple-600" : "text-gray-500"
          }`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.3"
            d="M7 9h5m3 0h2M7 12h2m3 0h5M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-6.616a1 1 0 0 0-.67.257l-2.88 2.592A.5.5 0 0 1 8 18.477V17a1 1 0 0 0-1-1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
          />
        </svg>
      ),
    },
    {
      name: "Offered",
      status: "Offered",
      icon: (isActiveOrCompleted) => (
        <svg
          className={`w-3.5 h-3.5 ${
            isActiveOrCompleted ? "text-purple-600" : "text-gray-500"
          }`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 18 20"
        >
          <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2ZM7 2h4v3H7V2Zm5.7 8.289-3.975 3.857a1 1 0 0 1-1.393 0L5.3 12.182a1.002 1.002 0 1 1 1.4-1.436l1.328 1.289 3.28-3.181a1 1 0 1 1 1.392 1.435Z" />
        </svg>
      ),
    },
    {
      name: "Rejected",
      status: "Reject",
      icon: (isActiveOrCompleted) => (
        <svg
          className="w-6 h-6 text-purple-500 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z"
            clipRule="evenodd"
          />
        </svg>
      ),
      conditionallyRender: true,
    },
  ];

  // Determine the index of the current status in the steps array
  let currentStatusIndex = steps.findIndex(
    (step) => step.status === currentStatus
  );
  const isRejected = currentStatus === "Reject";
  const rejectionIndex = isRejected
    ? steps.findIndex((step) => step.status === prevStatus)
    : null;

  if (currentStatus === "Forwarded") {
    currentStatusIndex = steps.findIndex((step) => step.status === "Review");
  }

  if (
    currentStatus === "Schedule Interview" ||
    currentStatus === "Reschedule" ||
    currentStatus === "Cancel Interview"
  ) {
    currentStatusIndex = steps.findIndex((step) => step.status === "Interview");
  }

  if (currentStatus === "Accept") {
    currentStatusIndex = steps.findIndex((step) => step.status === "Interview");
  }

  return (
    <ol className="flex justify-center space-x-auto font-body">
      {steps.map((step, index) => {
        // Determine if the step is active or completed
        // const isActiveOrCompleted =
        //   index <= currentStatusIndex ||
        //   (isRejected && step.status === "Reject");

        // // If the current status is "Reject", only show the "Rejected" step
        // if (isRejected && step.status !== "Reject") {
        //   return null;
        // }

        // For all other statuses, hide the "Rejected" step
        if (!isRejected && step.conditionallyRender) {
          return null;
        }

        const isActiveOrCompleted = isRejected
          ? index <= rejectionIndex || step.status === "Reject"
          : index <= currentStatusIndex;

        // Skip rendering future steps after the rejection step if rejected.
        if (isRejected && index > rejectionIndex && step.status !== "Reject") {
          return null;
        }

        return (
          <li key={step.name} className="flex items-center">
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-full text-white ${
                isActiveOrCompleted ? "bg-purple-200" : "bg-gray-200"
              } ring-4 ring-white`}
            >
              {step.icon(isActiveOrCompleted)}
            </span>
            <div
              className={`ml-1 ${
                isActiveOrCompleted ? "text-gray-900" : "text-gray-400"
              }`}
            >
              <h3 className="text-sm font-medium">{step.name}</h3>
            </div>
            {index < steps.length - 2 && (
              <div
                className={`my-2 ml-1 w-10 h-1 ${
                  isActiveOrCompleted && step.status !== "Reject"
                    ? "bg-purple-200 text-purple-500"
                    : "bg-gray-200"
                }`}
              ></div>
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default StepIndicator;
