import React from "react";
import { useState, useEffect } from "react";
import DashNavbar from "./DashNavbar";
import { ApplicantSidebar } from "./applicant";
import { Sidebar, JobForm } from "./recruiter";
// import JobForm from "./recruiter/JobForm";
import { useLocation } from "react-router-dom";
import Button from "./Button";
import { apple, bitcoin, discord, vk } from "../assets";

const JobDescription = () => {
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
  return (
    <div>
      <div className="antialiased bg-white dark:bg-gray-900">
        <DashNavbar />

        {role === "applicant" ? <ApplicantSidebar /> : <Sidebar />}
        <main className="p-2 md:px-10 md:ml-72 md:mr-24 sm:ml-48 sm:mr-24 h-auto pt-14">
          <div className="flex justify-between  rounded-lg border-gray-100 bg-white dark:border-gray-600 h-auto mb-4 mx-6 px-5 py-4">
            <div className="flex items-center">
              <h5 className="text-3xl font-bold dark:text-white">
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
                  onClick={() => openUpdateForm(jobDetails)}
                >
                  Apply Job
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-6 mx-6">
            {/* Jobs Section */}

            <div href="#" className="col-span-4 overflow-auto">
              <div className="col-span-1 border-2 rounded-lg border-gray-100 bg-white dark:border-gray-600 hover:border-purple-400 h-auto min-h-20 mb-3">
                <div className="grid grid-cols-10 bg-white border border-gray-100 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <div className="col-span-2 grid justify-items-center content-center">
                    <img className="rounded-t-lg" src={discord} alt="" />
                  </div>

                  <div className="px-4 py-3 col-span-8">
                    <a href="#">
                      <h5 className="mb-2 text-md font-bold tracking-tight text-gray-900 dark:text-white">
                        {jobDetails.title}
                      </h5>
                    </a>

                    <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                      <li>
                        <p className="text-black font-bold inline-block pr-8 py-2">
                          Meta
                        </p>
                        <p className="inline-block pr-8 py-2">
                          {jobDetails.type}
                        </p>
                        <p className="text-purple-600 inline-block pr-8 py-2">
                          RM5,000
                        </p>
                        <p className="inline-block pr-8 py-2">
                          {jobDetails.postedAt}
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <JobForm
        isOpen={isFormOpen}
        isClose={() => {
          closeForm();
          triggerUpdate(); // Call triggerUpdate after closing the form to refresh the job listings
        }}
        mode={formMode}
        jobData={selectedJob}
        onDelete={handleDeleteJob}
      />
    </div>
  );
};

export default JobDescription;
