import React from "react";
import { useState, useEffect } from "react";
import DashNavbar from "./DashNavbar";
import { ApplicantSidebar, ApplicationForm } from "./applicant";
import { Sidebar, JobForm } from "./recruiter";
// import JobForm from "./recruiter/JobForm";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Button from "./Button";
import { apple, dashboard, discord, user } from "../assets";

const JobPostings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get("uid");
  const role = queryParams.get("role");

  const [isFormOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // 'create' or 'update'
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]); // All jobs
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const [resume, setResume] = useState(null);
  const [matchedJobs, setMatchedJobs] = useState([]); // Holds matched jobs after resume upload
  const [viewMatchedJobs, setViewMatchedJobs] = useState(false); // Flag to toggle view

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

  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResume(file);
      setFileName(file.name);
    }
  };

  const removeFile = () => {
    setResume(null);
    setFileName("");
  };

  const fetchMatchingJobs = async () => {
    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("applicantID", uid);

    try {
      const response = await fetch("/api/match-jobs", {
        method: "POST",
        body: formData,
      });

      const matchingJobs = await response.json();
      setMatchedJobs(matchingJobs); // Update matched jobs
      setViewMatchedJobs(true); // Automatically switch to viewing matched jobs
    } catch (error) {
      console.error("Error fetching matching jobs:", error);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetchMatchingJobs();
  };

  return (
    <div>
      <div className="antialiased bg-white dark:bg-gray-900">
        <DashNavbar />

        {role === "applicant" ? <ApplicantSidebar /> : <Sidebar />}
        <main className="p-2 md:px-10 md:ml-72 md:mr-24 sm:ml-48 sm:mr-24 h-auto pt-14">
          {role === "applicant" ? (
            <div className="flex justify-between border-2 rounded-lg border-gray-100 bg-[url('assets/bg.png')] dark:border-gray-600 h-auto mb-4 mx-6 px-10 py-6 z-30">
              <div className="items-center ">
                <h5 className="text-2xl font-bold dark:text-white mb-6 mt-3">
                  Browse Jobs
                </h5>
                <div>
                  <span
                    id="badge-dismiss-purple"
                    className="inline-flex items-center py-2 me-2 text-md font-medium text-gray-500 bg-purple-100 rounded dark:bg-purple-900 dark:text-purple-300"
                  >
                    Upload your resume and let us find your perfect job match
                    instantly! ✨
                  </span>
                </div>
              </div>
              <div className="bg-white shadow-md rounded-lg p-6 w-1/3 h-auto">
                <form onSubmit={handleSubmit}>
                  <div className="h-full items-center justify-center w-full">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-auto border-2 border-purple-200 border-dashed rounded-xl cursor-pointer bg-white dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-purple-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-4 text-purple-600 dark:text-gray-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        <p className="text-center mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF only
                        </p>
                      </div>
                      <input
                        id="dropzone-file"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileChange}
                        required={true}
                      />
                    </label>
                    {fileName && (
                      <div className="mt-4 flex justify-between items-center bg-gray-100 p-2 rounded-md">
                        <span className="text-sm font-medium text-gray-900">
                          {fileName}
                        </span>
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700"
                          onClick={removeFile}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="mt-3 flex w-full items-center rounded-lg bg-purple-600 px-4 py-1 text-center justify-center hover:bg-purple-800"
                  >
                    <span className="text-md text-white font-medium">
                      Submit
                    </span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            // Recruiter's view
            <div className="flex justify-between border-2 rounded-lg border-gray-100 bg-[url('assets/bg.png')] dark:border-gray-600 h-48 mb-4 mx-6 px-10 py-6 z-40">
              <div className="items-center ">
                <h5 className="text-3xl font-bold dark:text-white mb-6 mt-3">
                  Posted Jobs
                </h5>
                <div>
                  <button
                    type="button"
                    className="focus:outline-none text-white bg-purple-600 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
                    onClick={openCreateForm}
                  >
                    Create New Job
                  </button>
                </div>
              </div>
              <img className="flex z-[5] h-60" src={dashboard}></img>
            </div>
          )}
          {/* <div className="flex justify-between border-2 rounded-lg border-gray-100 bg-white dark:border-gray-600 h-auto mb-4 mx-6 px-5 py-4">
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
          </div> */}

          <div className="grid grid-cols-6 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-6 mx-6 pt-6">
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
              {role === "applicant" && (
                <button onClick={() => setViewMatchedJobs(!viewMatchedJobs)}>
                  {viewMatchedJobs ? "View All Jobs" : "View Matched Jobs"}
                </button>
              )}
              {/* new */}
              <div>
                {viewMatchedJobs
                  ? matchedJobs.map(([job, score]) => (
                      <Link
                        key={job.id}
                        className="col-span-1  bg-white dark:border-gray-600 h-auto min-h-20 mb-3"
                        // onClick={() => openUpdateForm(job)}
                        to={`/jobdescription?uid=${uid}&role=${role}&jobId=${job.id}`}
                      >
                        <div className="grid grid-cols-10 bg-white border-2 border-gray-100 rounded-lg hover:border-purple-400 dark:bg-gray-800 dark:border-gray-700">
                          <div className="col-span-2 grid justify-items-center content-center">
                            <img
                              className="rounded-t-lg"
                              src="{job.companyLogoUrl} || {user}"
                              alt="logo"
                            />
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
                                <p className="inline-block pr-8 py-2">
                                  {job.type}
                                </p>
                                <p className="text-purple-600 inline-block pr-8 py-2">
                                  RM5,000
                                </p>
                                <p className="inline-block pr-8 py-2">
                                  {job.postedAt}
                                </p>
                              </li>
                            </ul>
                          </div>
                          <div className="col-span-2 grid justify-items-center content-center">
                            <span className="bg-purple-100 text-purple-600 text-md font-bold me-2 px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
                              {score.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  : jobs.map((job) => (
                      <div className="py-1">
                        <Link
                          key={job.id}
                          className="col-span-1 bg-white dark:border-gray-600 h-auto min-h-20 my-3"
                          // onClick={() => openUpdateForm(job)}
                          to={`/jobdescription?uid=${uid}&role=${role}&jobId=${job.id}`}
                        >
                          <div className="grid grid-cols-10 bg-white border-2 border-gray-100 rounded-lg hover:border-purple-400 dark:bg-gray-800 dark:border-gray-700">
                            <div className="col-span-2 grid justify-items-center content-center">
                              <img
                                className="mx-auto my-3 w-16 h-16 rounded-full"
                                src={job.companyLogoUrl}
                                alt="Logo"
                              />
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
                                    {job.companyName}
                                  </p>
                                  <p className="inline-block pr-8 py-2">
                                    {job.type}
                                  </p>
                                  <p className="text-purple-600 inline-block pr-8 py-2">
                                    RM{job.salary}
                                  </p>
                                  <p className="inline-block pr-8 py-2">
                                    {job.postedAt}
                                  </p>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
              </div>
              {/* ori below */}
              {/* {(viewMatchedJobs ? matchedJobs : jobs).map(([job, score]) => (
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
                    <div className="col-span-2 grid justify-items-center content-center">
                      <span className="bg-purple-100 text-purple-600 text-md font-bold me-2 px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
                        {score.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </Link>
              ))} */}
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
