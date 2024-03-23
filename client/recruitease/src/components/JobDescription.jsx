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

  const handleDeleteJob = (jobId) => {
    fetch(`/api/delete-job/${jobId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Job Deleted Successfully!");
          triggerUpdate(); // Refresh job listings after deletion
          closeForm();
        } else {
          alert("Failed to Delete Job");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
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
              <div>
                <button
                  type="button"
                  className="focus:outline-none text-white bg-purple-600 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
                  onClick={() => openUpdateForm(jobDetails)}
                >
                  Edit Job
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
