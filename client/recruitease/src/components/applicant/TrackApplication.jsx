import React from "react";
import { useState, useEffect } from "react";
import ApplicantSidebar from "./ApplicantSidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { track } from "../../assets";
import StepIndicator from "../StepIndicator";

const AccordionItem = ({ application }) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentStatus = application.status;
  const prevStatus = application.prevStatus;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        className="items-center justify-between w-full p-5 font-medium text-left text-gray-800 dark:text-white bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-gray-700 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-between px-3 py-1">
          <span className="text-black font-semibold">
            {application.jobTitle}
          </span>
          <svg
            className={`w-4 h-4 transform transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
        <ul className="flex flex-wrap text-sm font-medium text-center justify-between px-3 text-gray-500 dark:text-gray-400">
          <li>
            <p className="inline-block pr-8 py-2">{application.companyName}</p>
            <p className="inline-block pr-8 py-2">{application.jobMode}</p>
            <p className="text-purple-600 inline-block pr-8 py-2">
              RM{application.salary}
            </p>
          </li>
          <li>
            <p className=" text-gray-400 font-normal inline-block pr-8 py-2">
              Applied At:{" "}
              {new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "long",
                day: "2-digit",
              }).format(new Date(application.appliedAt))}
            </p>
          </li>
        </ul>
      </button>

      {isOpen && (
        <div className="p-5">
          <StepIndicator
            currentStatus={currentStatus}
            prevStatus={prevStatus}
          />
          {/* You can add more detailed content here */}
        </div>
      )}
    </div>
  );
};

const TrackApplication = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get("uid");
  const role = queryParams.get("role");

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/track-applications?uid=${uid}&role=${role}`
        );
        if (!response.ok) {
          throw new Error("Something went wrong!");
        }
        const data = await response.json();
        setApplications(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (uid) {
      fetchApplications();
    }
  }, [uid]);

  if (isLoading)
    return (
      <div className="text-center font-body">
        <div role="status">
          <svg
            aria-hidden="true"
            className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  const activeApplications = applications.filter(
    (app) =>
      app.status !== "Reject" &&
      app.status !== "Reject Sent" &&
      app.status !== "Offered"
  );
  const pastApplications = applications.filter(
    (app) =>
      app.status === "Reject" ||
      app.status === "Reject Sent" ||
      app.status === "Offered"
  );

  return (
    <div className="font-body antialiased bg-white dark:bg-gray-900">
      {/* <DashNavbar /> */}

      <ApplicantSidebar />

      <main className="p-4 md:ml-72 md:mr-24 sm:ml-48 sm:mr-24 h-auto pt-14">
        <div className="flex justify-between border-2 rounded-lg border-gray-100 bg-[url('assets/bg.png')] dark:border-gray-600 h-48 mb-4 mx-6 px-10 py-6 z-40">
          <div className="items-center ">
            <h5 className="text-2xl font-bold dark:text-white mb-9 mt-3">
              My Applications
            </h5>
            <div>
              <span
                id="badge-dismiss-purple"
                className="inline-flex items-centerpy-1 me-2 text-md font-medium text-gray-500 bg-purple-100 rounded dark:bg-purple-900 dark:text-purple-300"
              >
                View and track all the jobs you have applied for! 🗃️
              </span>
            </div>
          </div>
          <img className="flex z-[5] h-60" src={track}></img>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-8 mb-6 mx-6">
          {/* <div className="border-2 rounded-lg border-gray-100 dark:border-gray-600 h-auto">
            {applications.length > 0 ? (
              applications.map((application) => (
                <AccordionItem key={application.id} application={application} />
              ))
            ) : (
              <p>No applications found.</p>
            )}
          </div> */}
          {/* Section for Active Applications */}
          <section>
            <h5 className="text-lg font-semibold text-purple-700 dark:text-white px-8 py-2 rounded-lg bg-purple-50">
              Ongoing Applications
            </h5>
            <div className="border-2 rounded-lg border-gray-100 dark:border-gray-600 h-auto">
              {activeApplications.length > 0 ? (
                activeApplications.map((application) => (
                  <AccordionItem
                    key={application.id}
                    application={application}
                  />
                ))
              ) : (
                <p className="border-1 rounded-lg border-gray-100 dark:border-gray-600 h-auto p-6">
                  No active applications found.
                </p>
              )}
            </div>
          </section>

          {/* Section for Past Applications */}
          <section className="mt-8">
            <h5 className="text-lg font-semibold text-gray-700 dark:text-white px-8 py-2 rounded-lg bg-gray-50">
              Past Applications
            </h5>
            <div className="border-2 rounded-lg border-gray-100 dark:border-gray-600 h-auto">
              {pastApplications.length > 0 ? (
                pastApplications.map((application) => (
                  <AccordionItem
                    key={application.id}
                    application={application}
                  />
                ))
              ) : (
                <p className="border-1 rounded-lg border-gray-100 dark:border-gray-600 h-auto p-6">
                  No past applications found.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TrackApplication;
