import React from "react";
import { useState, useEffect } from "react";
import DashNavbar from "../DashNavbar";
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
        <div className="flex justify-between px-3 py-2">
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
        <ul className="flex flex-wrap text-sm font-medium text-center justify-between pt-1 px-3 text-gray-500 dark:text-gray-400">
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
  const currentStatus = applications.status;

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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const activeApplications = applications.filter(
    (app) => app.currentStatus !== "Reject"
  );
  const pastApplications = applications.filter(
    (app) => app.currentStatus === "Reject"
  );

  return (
    <div className="antialiased bg-white dark:bg-gray-900">
      <DashNavbar />

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
            <h5 className="text-xl font-bold dark:text-white mb-4 px-8">
              Active Applications
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
            <h5 className="text-xl font-bold dark:text-white mb-4 px-8">
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
