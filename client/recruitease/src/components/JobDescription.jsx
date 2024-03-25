import React from "react";
import { useState, useEffect } from "react";
import DashNavbar from "./DashNavbar";
import { ApplicantSidebar, ApplicationForm } from "./applicant";
import { Sidebar, JobForm } from "./recruiter";
// import JobForm from "./recruiter/JobForm";
import { useLocation, useNavigate } from "react-router-dom";
import { apple, bitcoin, discord, vk } from "../assets";

const JobDescription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get("uid");
  const role = queryParams.get("role");
  const jobId = queryParams.get("jobId");

  const [jobDetails, setJobDetails] = useState({});
  const [isFormOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("update"); // 'create' or 'update'
  const [selectedJob, setSelectedJob] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(false);

  const openUpdateForm = (job) => {
    setFormMode("Update");
    setSelectedJob(job); // Pass the selected job data into the form for editing
    setFormOpen(true);
  };

  const openApplicationForm = () => {
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
  };

  const triggerUpdate = () => {
    setUpdateTrigger(!updateTrigger); // refresh the job listings
  };

  // const handleDelete = () => {
  //   if (window.confirm("Are you sure you want to delete this job?")) {
  //     onDelete(jobId);
  //   }
  // };

  const handleDeleteJob = async () => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        const response = await fetch(`/api/delete-job/${jobId}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (!response.ok)
          throw new Error(data.error || "Failed to delete job.");

        alert("Job Deleted Successfully!");
        navigate(`/jobpostings?uid=${uid}&role=${role}`);

        // Redirect or perform another action after successful deletion
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to Delete Job");
      }
    }
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`/api/job-details/${jobId}`);
        const data = await response.json();
        setJobDetails(data);
      } catch (error) {
        console.error("Error fetching job details:", error);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const renderRequirements = (requirements) => {
    return requirements
      .split("\n")
      .map((req, index) => <li key={index}>{req}</li>);
  };
  return (
    <div>
      <div className="antialiased bg-white dark:bg-gray-900">
        <DashNavbar />

        {role === "applicant" ? <ApplicantSidebar /> : <Sidebar />}
        <main className="p-2 md:px-10 md:ml-72 md:mr-24 sm:ml-48 sm:mr-24 h-auto pt-14">
          <div className="flex justify-between bg-white dark:border-gray-600 h-auto mb-6 mx-6 px-5 py-4">
            <div className="flex items-center">
              <h5 className="text-4xl font-bold dark:text-white">
                {jobDetails.title}
              </h5>
            </div>
            {role === "recruiter" ? (
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  className="inline-flex items-center text-white bg-purple-600 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-purple-500 dark:hover:bg-purple-600 dark:focus:ring-purple-900"
                  onClick={() => openUpdateForm(jobDetails)}
                >
                  <svg
                    aria-hidden="true"
                    className="mr-1 -ml-1 w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
                    <path
                      fillRule="evenodd"
                      d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Edit Job
                </button>
                <button
                  type="button"
                  className="inline-flex items-center text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900"
                  onClick={handleDeleteJob}
                >
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 mr-1.5 -ml-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Delete
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  className="focus:outline-none text-white bg-purple-600 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
                  onClick={() => openApplicationForm(jobDetails)}
                >
                  Apply Job
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-6 mb-6 mx-6">
            <div className="h-auto p-1">
              <ul className="flex flex-wrap items-center justify-between text-gray-500 font-normal  dark:text-white px-3">
                <li>
                  <div className="flex items-center mb-2">
                    <svg
                      className="w-6 h-6 me21 dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      />
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M17.8 13.938h-.011a7 7 0 1 0-11.464.144h-.016l.14.171c.1.127.2.251.3.371L12 21l5.13-6.248c.194-.209.374-.429.54-.659l.13-.155Z"
                      />
                    </svg>
                    <a className="me-4 text-md md:me-6 ">Mode</a>
                  </div>
                  <a className="me-4 pl-2 text-gray-900 font-semibold text-lg md:me-6 ">
                    {jobDetails.jobMode}
                  </a>
                </li>
                <li>
                  <div className="flex items-center mb-2">
                    <svg
                      className="w-6 h-6 me-2 dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>

                    <a className="me-4 text-md md:me-6">Type</a>
                  </div>
                  <a className="me-4 pl-1 text-gray-900 font-semibold text-lg md:me-6 ">
                    {jobDetails.type}
                  </a>
                </li>
                <li>
                  <div className="flex items-center mb-2">
                    <svg
                      className="w-6 h-6 me-2 dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M8 7H5a2 2 0 0 0-2 2v4m5-6h8M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m0 0h3a2 2 0 0 1 2 2v4m0 0v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6m18 0s-4 2-9 2-9-2-9-2m9-2h.01"
                      />
                    </svg>
                    <a className="me-4 text-md md:me-6">Qualification</a>
                  </div>{" "}
                  <a className="me-4 pl-1 text-gray-900 font-semibold text-lg md:me-6 ">
                    {jobDetails.qualification}
                  </a>
                </li>
                <li>
                  <div className="flex items-center mb-2">
                    <svg
                      className="w-6 h-6 me-2 dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.5"
                        d="M8 7V6a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1M3 18v-7a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                      />
                    </svg>
                    <a className="me-4 text-md md:me-6">Salary</a>
                  </div>{" "}
                  <a className="me-4 pl-1 text-gray-900 font-semibold text-lg md:me-6 ">
                    RM{jobDetails.salary}
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex justify-between bg-white dark:border-gray-600 h-auto mx-6 pt-4">
              <div className="flex items-center">
                <h5 className="text-3xl font-bold dark:text-white">
                  Job Description
                </h5>
              </div>
              <div className="flex items-center">
                <h5 className="text-md font-semibold dark:text-white">
                  Posted at:&nbsp;
                </h5>
                <h5 className="text-md font-normal text-gray-500 dark:text-white">
                  {jobDetails.postedAt}
                </h5>
              </div>
            </div>
            <div className="flex h-auto mx-6">
              <h5 className="text-lg font-normal text-gray-900 dark:text-white">
                {jobDetails.desc}
              </h5>
            </div>
            <div className="flex justify-between bg-white dark:border-gray-600 h-auto mx-6 ">
              <div className="flex items-center">
                <h5 className="text-2xl font-bold dark:text-white">
                  Requirements
                </h5>
              </div>
            </div>
            <div className="flex h-auto mx-6">
              <ul className="list-disc pl-5 mt-2 text-lg font-normal text-gray-900 dark:text-white">
                {jobDetails.req && renderRequirements(jobDetails.req)}
              </ul>
            </div>
          </div>
        </main>
      </div>
      {role === "recruiter" ? (
        <JobForm
          isOpen={isFormOpen}
          isClose={() => {
            closeForm();
            triggerUpdate(); // Call triggerUpdate after closing the form to refresh the job listings
          }}
          mode={formMode}
          jobData={selectedJob}
          // onDelete={handleDeleteJob}
        />
      ) : (
        <ApplicationForm
          isOpen={isFormOpen}
          isClose={() => {
            closeForm();
          }}
        />
      )}
    </div>
  );
};

export default JobDescription;
