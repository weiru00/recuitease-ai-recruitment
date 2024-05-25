import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import DashNavbar from "./DashNavbar";
import NoResult from "./NoResult";
import { ApplicantSidebar } from "./applicant";
import { Sidebar, JobForm } from "./recruiter";
import { dashboard, user } from "../assets";

const JobPostings = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get("uid");
  const role = queryParams.get("role");

  const [loading, setLoading] = useState(false);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // 'create' or 'update'
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]); // All jobs
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const [resume, setResume] = useState(null);
  const [matchedJobs, setMatchedJobs] = useState([]); // Holds matched jobs after resume upload
  const [predictedCategory, setPredictedCategory] = useState([]);
  const [viewMatchedJobs, setViewMatchedJobs] = useState(false); // Flag to toggle view
  const [searchQuery, setSearchQuery] = useState("");
  const [jobType, setJobType] = useState({
    FullTime: false,
    Internship: false,
  });
  const [salaryRange, setSalaryRange] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);

  const salaryRanges = [
    { label: "Below RM3,000", min: 0, max: 3000 },
    { label: "RM3,000 ~ RM5,999", min: 3000, max: 5999 },
    { label: "RM6,000 ~ RM9,999", min: 6000, max: 9999 },
    { label: "Above RM10,000", min: 10000, max: Infinity },
  ];

  const openCreateForm = () => {
    setFormMode("Create");
    setSelectedJob(null); // Ensure no job data is passed into the form for creation
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
  };

  const triggerUpdate = () => {
    setUpdateTrigger(!updateTrigger);
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
      setLoading(true);
      const response = await fetch("/api/match-jobs", {
        method: "POST",
        body: formData,
      });

      const matchingJobs = await response.json();
      setLoading(false);
      setMatchedJobs(matchingJobs.matched_jobs); // Update matched jobs
      setPredictedCategory(matchingJobs.predicted_category);
      setViewMatchedJobs(true); // Automatically switch to viewing matched jobs
    } catch (error) {
      console.error("Error fetching matching jobs:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(
          `/api/joblistings?role=${role}&uid=${uid}`
        );
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

  useEffect(() => {
    const filtered = jobs.filter((job) => {
      const searchMatch = job.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const jobTypeMatch =
        jobType[job.type.replace("-", "")] ||
        (!jobType.FullTime && !jobType.Internship);

      const selectedRange = salaryRanges.find(
        (range) => range.label === salaryRange
      );

      // Check if job's salary falls within the selected range
      const salaryMatch = selectedRange
        ? job.salary >= selectedRange.min && job.salary <= selectedRange.max
        : true;

      return searchMatch && jobTypeMatch && salaryMatch;
    });

    setFilteredJobs(filtered);
  }, [searchQuery, jobType, salaryRange, jobs]);

  useEffect(() => {
    // Filter jobs based on role or other criteria
    const filterJobs = () => {
      if (role === "applicant" && viewMatchedJobs) {
        // For applicants, filter matched jobs
        const matched = jobs.filter((job) => job.matchScore >= 80); // Assuming matchScore is a property indicating job match
        setFilteredJobs(matched);
      } else {
        // For recruiters or when viewing all jobs, show all jobs
        setFilteredJobs(jobs);
      }
    };

    filterJobs();
  }, [jobs, role, viewMatchedJobs]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleJobTypeChange = (e) => {
    const { value, checked } = e.target;
    setJobType((prev) => ({ ...prev, [value]: checked }));
  };

  const handleSalaryChange = (e) => {
    setSalaryRange(e.target.value);
  };

  return (
    <div className="font-body">
      <div className="antialiased bg-white dark:bg-gray-900">
        {/* <DashNavbar /> */}

        {role === "applicant" ? <ApplicantSidebar /> : <Sidebar />}
        <main className="p-2 md:px-10 md:ml-72 md:mr-24 sm:ml-48 sm:mr-24 h-auto pt-14">
          {role === "applicant" ? (
            <div className="flex justify-between border-2 rounded-xl border-gray-100 bg-[url('assets/bg.png')] dark:border-gray-600 h-auto mb-4 mx-6 px-10 py-6 z-30">
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
              <div className="bg-white shadow-md rounded-xl p-6 w-1/3 h-auto">
                {loading && (
                  <div role="status" className="text-center">
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
                )}
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
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="mt-3 flex w-full items-center rounded-xl bg-purple-600 px-4 py-1 text-center justify-center hover:bg-purple-800"
                  >
                    <span className="text-sm py-1 text-white font-medium">
                      Submit
                    </span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            // Recruiter's view
            <div className="flex justify-between border-2 rounded-xl border-gray-100 bg-[url('assets/bg.png')] dark:border-gray-600 h-48 mb-4 mx-6 px-10 py-6 z-40">
              <div className="items-center ">
                <h5 className="text-2xl font-bold dark:text-white mb-6 mt-3">
                  Posted Jobs
                </h5>
                <div>
                  <button
                    type="button"
                    className="focus:outline-none text-white bg-purple-600 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-xl text-sm px-5 py-2.5 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
                    onClick={openCreateForm}
                  >
                    Create New Job
                  </button>
                </div>
              </div>
              <img
                className="flex z-[5] h-60"
                src={dashboard}
                alt="Dashboard"
              ></img>
            </div>
          )}

          <div className="grid grid-cols-6 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-6 mx-6 pt-6">
            {/* Filter and Search Section */}
            <div className="col-span-2 border-2 rounded-xl border-gray-100 bg-white dark:border-gray-600 h-auto px-5 py-4">
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
                    className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-xl bg-white focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                    placeholder="Search Job"
                    value={searchQuery}
                    onChange={handleSearchChange}
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
                  value="FullTime"
                  checked={jobType.FullTime}
                  onChange={handleJobTypeChange}
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
                  id="checked-checkbox"
                  type="checkbox"
                  value="Internship"
                  checked={jobType.Internship}
                  onChange={handleJobTypeChange}
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
                  value={salaryRange}
                  onChange={handleSalaryChange}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                >
                  <option defaultValue>Salary Range</option>
                  {salaryRanges.map((range) => (
                    <option key={range.label} value={range.label}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </form>
            </div>

            {/* Jobs Section */}
            <div className="col-span-4 overflow-auto">
              {role === "applicant" && (
                <div className="items-center ">
                  {viewMatchedJobs ? (
                    <div className="mb-3 pl-2">
                      <h5 className="bg-purple-100 text-gray-500 text-md font-medium me-2 px-2.5 py-2 rounded-full ">
                        Recommended:{" "}
                        <span className="bg-purple-100 text-purple-600 font-bold me-2 pl-3">
                          {predictedCategory}
                        </span>{" "}
                      </h5>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              )}
              {role === "applicant" && (
                <div className="items-center rounded-xl border-purple-50 px-4 py-0.5 mb-1 ">
                  {viewMatchedJobs ? (
                    <div className="flex justify-between">
                      <h5 className="text-lg font-semibold text-purple-700 mb-1 mt-2">
                        Top Matching Jobs
                      </h5>
                      <button
                        className="text-sm font-normal text-purple-600 hover:underline"
                        onClick={() => setViewMatchedJobs(!viewMatchedJobs)}
                      >
                        {viewMatchedJobs
                          ? "View All Jobs"
                          : "View Matched Jobs"}
                      </button>
                    </div>
                  ) : (
                    <h5 className="text-lg font-semibold text-purple-700 mb-1 mt-2">
                      All Jobs
                    </h5>
                  )}
                </div>
              )}

              <div>
                {role === "applicant" ? (
                  viewMatchedJobs ? (
                    matchedJobs.length > 0 ? (
                      matchedJobs.map(([job, score]) => (
                        <Link
                          key={job.id}
                          className="col-span-1 bg-white dark:border-gray-600 h-auto min-h-20 mb-3"
                          to={`/jobdescription?uid=${uid}&role=${role}&jobId=${job.id}`}
                        >
                          <div className="grid grid-cols-10 bg-white border-2 border-gray-100 rounded-xl hover:border-purple-400 dark:bg-gray-800 dark:border-gray-700">
                            <div className="col-span-2 grid my-1 justify-items-center content-center">
                              <img
                                className="rounded-full w-14 h-14"
                                src={job.companyLogoUrl || user}
                                alt="logo"
                              />
                              <span className="bg-purple-100 text-purple-600 text-sm font-bold me-2 px-2.5 py-0.5 mb-2 rounded-full dark:bg-purple-900 dark:text-purple-300">
                                {score.toFixed(2)}%
                              </span>
                            </div>
                            <div className="px-4 py-3 col-span-8">
                              <a href="#">
                                <h5 className="mb-2 text-md font-semibold tracking-tight text-gray-900 dark:text-white">
                                  {job.title}
                                </h5>
                              </a>
                              <ul className="flex flex-wrap text-sm font-medium text-center justify-between text-gray-500 dark:text-gray-400">
                                <li>
                                  <p className="inline-block pr-8 py-2">
                                    {job.companyName}
                                  </p>
                                  <p className="inline-block pr-8 py-2">
                                    {job.type}
                                  </p>
                                  <p className="text-purple-600 inline-block pr-8 py-2">
                                    RM{job.salary}
                                  </p>
                                </li>
                                <li>
                                  <p className="text-gray-400 font-normal inline-block pr-8 py-2">
                                    Posted At: {job.postedAt}
                                  </p>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <NoResult
                        title={"No matched jobs found"}
                        desc={"Try to resubmit your resume."}
                      />
                    )
                  ) : filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                      <div className="py-1" key={job.id}>
                        <Link
                          className="col-span-1 bg-white dark:border-gray-600 h-auto min-h-20 my-3"
                          // onClick={() => openUpdateForm(job)}
                          to={`/jobdescription?uid=${uid}&role=${role}&jobId=${job.id}`}
                        >
                          <div className="grid grid-cols-10 bg-white border-2 border-gray-100 rounded-xl hover:border-purple-400 dark:bg-gray-800 dark:border-gray-700">
                            <div className="col-span-2 grid justify-items-center content-center">
                              <img
                                className="mx-auto my-3 w-16 h-16 rounded-full"
                                src={job.companyLogoUrl}
                                alt="Logo"
                              />
                            </div>
                            <div className="px-4 py-3 col-span-8">
                              <a href="#">
                                <h5 className="mb-2 text-md font-semibold tracking-tight text-gray-900 dark:text-white">
                                  {job.title}
                                </h5>
                              </a>

                              <ul className="flex flex-wrap text-sm font-medium text-center justify-between text-gray-500 dark:text-gray-400">
                                <li>
                                  <p className="inline-block pr-8 py-2">
                                    {job.companyName}
                                  </p>
                                  <p className="inline-block pr-8 py-2">
                                    {job.type}
                                  </p>
                                  <p className="text-purple-600 inline-block pr-8 py-2">
                                    RM{job.salary}
                                  </p>
                                </li>
                                <li>
                                  <p className="text-gray-400 font-normal inline-block pr-8 py-2">
                                    Posted At: {job.postedAt}
                                  </p>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <NoResult
                      title={"No result found"}
                      desc={"Try adjusting your search or filters."}
                    />
                  )
                ) : role === "recruiter" && jobs.length === 0 ? (
                  <NoResult
                    title={"No jobs created yet"}
                    desc={"Start by creating your first job listing."}
                  />
                ) : filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <div className="py-1" key={job.id}>
                      <Link
                        className="col-span-1 bg-white dark:border-gray-600 h-auto min-h-20 my-3"
                        // onClick={() => openUpdateForm(job)}
                        to={`/jobdescription?uid=${uid}&role=${role}&jobId=${job.id}`}
                      >
                        <div className="grid grid-cols-10 bg-white border-2 border-gray-100 rounded-xl hover:border-purple-400 dark:bg-gray-800 dark:border-gray-700">
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

                            <ul className="flex flex-wrap text-sm font-medium text-center justify-between text-gray-500 dark:text-gray-400">
                              <li>
                                <p className="inline-block pr-8 py-2">
                                  {job.companyName}
                                </p>
                                <p className="inline-block pr-8 py-2">
                                  {job.type}
                                </p>
                                <p className="text-purple-600 inline-block pr-8 py-2">
                                  RM{job.salary}
                                </p>
                              </li>
                              <li>
                                <p className="text-gray-400 font-normal inline-block pr-8 py-2">
                                  Posted At: {job.postedAt}
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <NoResult
                    title={"No result found"}
                    desc={"Try adjusting your search or filters."}
                  />
                )}
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
        // onDelete={handleDeleteJob}
      />
    </div>
  );
};

export default JobPostings;
