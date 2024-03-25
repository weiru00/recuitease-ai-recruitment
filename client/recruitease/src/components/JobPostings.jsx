import React from "react";
import { useState, useEffect } from "react";
import DashNavbar from "./DashNavbar";
import { ApplicantSidebar, ApplicationForm } from "./applicant";
import { Sidebar, JobForm } from "./recruiter";
// import JobForm from "./recruiter/JobForm";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Button from "./Button";
import { apple, bitcoin, discord, vk } from "../assets";

const JobPostings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get("uid");
  const role = queryParams.get("role");

  const [isFormOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // 'create' or 'update'
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(false);

  const openCreateForm = () => {
    setFormMode("Create");
    setSelectedJob(null); // Ensure no job data is passed into the form for creation
    setFormOpen(true);
  };

  // const openUpdateForm = (job) => {
  //   setFormMode("Update");
  //   setSelectedJob(job); // Pass the selected job data into the form for editing
  //   setFormOpen(true);
  // };

  const closeForm = () => {
    setFormOpen(false);
  };

  const triggerUpdate = () => {
    setUpdateTrigger(!updateTrigger); // refresh the job listings
  };

  // useEffect(() => {
  //   fetch("api/joblistings")
  //     .then((res) => res.json())
  //     .then((data) => setJobs(data))
  //     .catch((error) => console.error("There was an error!", error));
  // }, [updateTrigger]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`api/joblistings?role=${role}&uid=${uid}`);
        const jobList = await response.json();
        setJobs(jobList);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
  }, [role, uid, updateTrigger]);

  // const handleJobAction = (job, action) => {
  //   if (action === "update") {
  //     setFormMode("Update");
  //     setSelectedJob(job);
  //     setFormOpen(true);
  //   } else if (action === "apply") {
  //     // Implement the apply logic here
  //     console.log(`Applying for job: ${job.id}`);
  //   }
  // };

  // const handleDeleteJob = (jobId) => {
  //   fetch(`/api/delete-job/${jobId}`, {
  //     method: "DELETE",
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       if (data.success) {
  //         alert("Job Deleted Successfully!");
  //         triggerUpdate(); // Refresh job listings after deletion
  //         closeForm();
  //       } else {
  //         alert("Failed to Delete Job");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //     });
  // };

  return (
    <div>
      <div className="antialiased bg-white dark:bg-gray-900">
        <DashNavbar />

        {role === "applicant" ? <ApplicantSidebar /> : <Sidebar />}
        <main className="p-2 md:px-10 md:ml-72 md:mr-24 sm:ml-48 sm:mr-24 h-auto pt-14">
          <div className="flex justify-between border-2 rounded-lg border-gray-100 bg-white dark:border-gray-600 h-auto mb-4 mx-6 px-5 py-4">
            <div className="flex items-center">
              {role === "recruiter" ? (
                <h5 className="text-xl font-bold dark:text-white">
                  Posted Jobs
                </h5>
              ) : (
                <h5 className="text-xl font-bold dark:text-white">
                  Browse All Jobs
                </h5>
              )}
            </div>
            {role === "recruiter" && (
              <div>
                <button
                  type="button"
                  className="focus:outline-none text-white bg-purple-600 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
                  onClick={openCreateForm}
                >
                  Create New Job
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-6 mx-6">
            {/* Filter and Seacrh Section */}
            <div className="col-span-2 border-2 rounded-lg border-gray-100 bg-white dark:border-gray-600 h-auto px-5 py-4">
              {/* Search bar */}
              <h6 className="text-md font-bold mb-2 dark:text-white">Search</h6>
              <form className="mx-auto mb-6">
                <label
                  htmlFor="default-search"
                  className="mb-2 text-sm font-bold text-gray-900 sr-only dark:text-white"
                >
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  </div>
                  <input
                    type="search"
                    id="default-search"
                    className="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                    placeholder="Search Job"
                    required
                  />
                </div>
              </form>

              {/* Job Type */}
              <h6 className="text-md font-bold mb-2 dark:text-white">
                Job Type
              </h6>
              <div className="flex items-center mb-2">
                <input
                  id="default-checkbox"
                  type="checkbox"
                  value="Full-Time"
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                ></input>
                <label
                  htmlFor="default-checkbox"
                  className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Full-Time
                </label>
              </div>
              <div className="flex items-center mb-6">
                <input
                  // checked
                  id="checked-checkbox"
                  type="checkbox"
                  value="Internship"
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                ></input>
                <label
                  htmlFor="checked-checkbox"
                  className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Internship
                </label>
              </div>

              {/* Salary Range */}
              <form className="mx-auto mb-6">
                <h6 className="text-md font-bold mb-2 dark:text-white">
                  Salary
                </h6>

                <label
                  htmlFor="salary"
                  className="text-md font-bold dark:text-white"
                ></label>
                <select
                  id="salary"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                >
                  <option defaultValue>Salary Range</option>
                  <option value="US">Below RM3,000</option>
                  <option value="CA">RM3,000 ~ RM5,999</option>
                  <option value="FR">RM6,000 ~ RM9,999</option>
                  <option value="DE">Above RM10,000</option>
                </select>
              </form>
            </div>

            {/* Jobs Section */}

            <div href="#" className="col-span-4 overflow-auto">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  className="col-span-1  bg-white dark:border-gray-600 h-auto min-h-20 mb-3"
                  // onClick={() => openUpdateForm(job)}
                  to={`/jobdescription?uid=${uid}&role=${role}&jobId=${job.id}`}
                >
                  <div className="grid grid-cols-10 bg-white border-2 border-gray-100 rounded-lg hover:border-purple-400 dark:bg-gray-800 dark:border-gray-700">
                    <div className="col-span-2 grid justify-items-center content-center">
                      <img className="rounded-t-lg" src={discord} alt="" />
                    </div>
                    <div className="px-4 py-3 col-span-8">
                      <a href="#">
                        <h5 className="mb-2 text-md font-bold tracking-tight text-gray-900 dark:text-white">
                          {job.title}
                        </h5>
                      </a>

                      <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                        <li>
                          <p className="text-black font-bold inline-block pr-8 py-2">
                            Meta
                          </p>
                          <p className="inline-block pr-8 py-2">{job.type}</p>
                          <p className="text-purple-600 inline-block pr-8 py-2">
                            RM5,000
                          </p>
                          <p className="inline-block pr-8 py-2">
                            {job.postedAt}
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Link>
              ))}
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
        // onDelete={handleDeleteJob}
      />
    </div>
  );
};

export default JobPostings;
