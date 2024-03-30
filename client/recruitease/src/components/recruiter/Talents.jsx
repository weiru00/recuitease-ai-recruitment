import React from "react";
import DashNavbar from "../DashNavbar";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { user, option, talents } from "../../assets";

const Talents = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const recruiterID = queryParams.get("uid");

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  const [showDropdown, setShowDropdown] = useState({});
  const toggleDropdown = (appId) => {
    setShowDropdown((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }));
  };

  const topTalents = applications
    .filter((app) => app.score > 9)
    .sort((a, b) => b.score - a.score);

  const topTalentIds = topTalents.map((app) => app.applicationID);

  const sortedByTimeApplications = applications
    .filter((app) => !topTalentIds.includes(app.applicationID)) // Exclude top talents
    .sort((a, b) => new Date(a.appliedAt) - new Date(b.appliedAt));

  // const sortedApplications = applications.sort((a, b) => b.score - a.score);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/get-applications?recruiterID=${recruiterID}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setApplications(data.applications);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [recruiterID]);

  const updateApplicationStatus = (applicationId, resumeUrl) => {
    setApplications((prevApplications) =>
      prevApplications.map((application) =>
        application.id === applicationId
          ? { ...application, status: "Review" }
          : application
      )
    );
    window.open(resumeUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="text-center">
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
  }

  return (
    <div className="antialiased bg-white dark:bg-gray-900">
      <DashNavbar />

      <Sidebar />
      <main className="p-2 md:px-10 md:ml-72 md:mr-24 sm:ml-48 sm:mr-24 h-auto pt-14">
        {/* <div className="flex justify-between border-2 rounded-lg border-gray-100 bg-white dark:border-gray-600 h-auto mb-4 mx-6 px-5 py-4">
          <div className="flex items-center">
            <h5 className="text-xl font-bold dark:text-white">Find Talents</h5>
          </div>
          <div>
            <span
              id="badge-dismiss-purple"
              className="inline-flex items-center px-2 py-1 me-2 text-sm font-medium text-purple-800 bg-purple-100 rounded dark:bg-purple-900 dark:text-purple-300"
            >
              AI-featured Similarity Score
              <a>
                <svg
                  className="w-5 h-5 ml-2 text-purple-700 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M15.03 9.684h3.965c.322 0 .64.08.925.232.286.153.532.374.717.645a2.109 2.109 0 0 1 .242 1.883l-2.36 7.201c-.288.814-.48 1.355-1.884 1.355-2.072 0-4.276-.677-6.157-1.256-.472-.145-.924-.284-1.348-.404h-.115V9.478a25.485 25.485 0 0 0 4.238-5.514 1.8 1.8 0 0 1 .901-.83 1.74 1.74 0 0 1 1.21-.048c.396.13.736.397.96.757.225.36.32.788.269 1.211l-1.562 4.63ZM4.177 10H7v8a2 2 0 1 1-4 0v-6.823C3 10.527 3.527 10 4.176 10Z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </span>
          </div>
        </div> */}
        <div className="flex justify-between border-2 rounded-lg border-gray-100 bg-[url('assets/bg.png')] dark:border-gray-600 h-48 mb-8 mx-6 px-10 py-6 z-40">
          <div className="items-center ">
            <h5 className="text-2xl font-bold dark:text-white mb-6 mt-3">
              Find Talents
            </h5>
            <div>
              <span
                id="badge-dismiss-purple"
                className="inline-flex items-center py-2 me-2 text-md font-medium text-gray-500 bg-purple-100 rounded dark:bg-purple-900 dark:text-purple-300"
              >
                Search for the best fit from all fields! ✨
              </span>
            </div>
          </div>
          <img className="flex z-[5] h-60" src={talents}></img>
        </div>
        {/* Top Talents */}
        <div className="grid grid-cols-1 justify-between border-2 rounded-lg border-gray-100 bg-white dark:border-gray-600 h-auto mb-4 mx-6 mt-14 px-5 py-4">
          <div className="flex items-center">
            <h5 className="text-lg font-semibold dark:text-white">
              Top Talents
            </h5>
          </div>
          <form className="flex items-center max-w-sm">
            <label htmlFor="simple-search" className="sr-only">
              Search
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 18 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="simple-search"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                placeholder="Search job name..."
                required
              />
            </div>
            <button
              type="submit"
              className="p-2.5 ms-2 text-sm font-medium text-white bg-purple-600 rounded-lg border border-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800"
            >
              <svg
                className="w-4 h-4"
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
              <span className="sr-only">Search</span>
            </button>
          </form>
          <div href="#" className="col-span-4">
            {topTalents.map((app) => (
              <div
                key={app.applicationID}
                className="col-span-1 border-2 rounded-lg border-gray-100 bg-white dark:border-gray-600 h-auto min-h-20 mt-4"
              >
                <div className="grid grid-cols-10 bg-white border border-gray-100 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <div className="col-span-2 grid justify-items-center content-center">
                    <img
                      className="mx-auto mb-2 w-14 h-14 rounded-full border-4 border-purple-600"
                      src={app.applicantPic || user}
                      alt="Profile Pic"
                    ></img>
                  </div>
                  <div className="px-2 py-3 col-span-6">
                    <a href="#">
                      <h5 className="mb-1 text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                        {app.applicantFName}
                      </h5>
                    </a>

                    <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                      <li>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium me-5 px-2 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                          {app.jobTitle}
                        </span>

                        <p className="inline-block pr-8 py-2 text-xs">
                          {new Intl.DateTimeFormat("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "2-digit",
                          }).format(new Date(app.appliedAt))}
                        </p>
                      </li>
                    </ul>
                  </div>
                  <div className="col-span-2 grid justify-items-center content-center">
                    <span className="bg-purple-100 text-purple-600 text-md font-bold me-2 px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
                      {app.score}%
                    </span>
                  </div>
                  <div className="flex col-span-10 justify-items-center content-center mx-20 mb-4 space-x-2">
                    <button
                      onClick={() =>
                        updateApplicationStatus(app.applicationID, app.resume)
                      }
                      // onClick={() => window.open(app.resume, "_blank")}
                      // to="/talents"
                      className="inline-flex items-center justify-center text-center bg-purple-50 text-purple-600 text-sm font-medium w-full py-1 rounded-md dark:bg-gray-700 border-2 border-purple-400 hover:bg-purple-100 hover:text-purple-600 group"
                    >
                      <svg
                        className="w-5 h-5 me-2 text-purple-600"
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
                          strokeWidth="2"
                          d="M10 3v4a1 1 0 0 1-1 1H5m4 6 2 2 4-4m4-8v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1Z"
                        />
                      </svg>
                      View Resume
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDropdown(app.applicationID)}
                      // data-dropdown-toggle="apps-dropdown"
                      className="relative p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                    >
                      <span className="sr-only">View status</span>
                      {/* <!-- Icon --> */}
                      <img src={option} className="h-6" alt="icon" />
                      <div
                        className={`${
                          showDropdown[app.applicationID]
                            ? "opacity-100 visible"
                            : "opacity-0 invisible"
                        } absolute my-4 w-56 text-base list-none bg-white divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600 rounded-xl transition-opacity duration-300`}
                        style={{
                          top: showDropdown[app.applicationID]?.top || 0,
                          left: showDropdown[app.applicationID]?.left || 0,
                          zIndex: 9999,
                        }}
                        id="dropdown"
                      >
                        <div className="py-3 px-4">
                          <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                            Edit Hiring Status
                          </span>
                        </div>
                        {/* Dropdown menu items */}
                        <ul
                          className="py-1 text-gray-700 dark:text-gray-300"
                          aria-labelledby="dropdown"
                        >
                          <li>
                            <a
                              href="#"
                              className="flex py-2 px-4 text-sm hover:bg-purple-100 dark:hover:bg-purple-600 dark:text-gray-400 dark:hover:text-white"
                            >
                              <svg
                                className="w-5 h-5 me-2 text-gray-800 dark:text-white"
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
                                  strokeWidth="1.2"
                                  d="M7.556 8.5h8m-8 3.5H12m7.111-7H4.89a.896.896 0 0 0-.629.256.868.868 0 0 0-.26.619v9.25c0 .232.094.455.26.619A.896.896 0 0 0 4.89 16H9l3 4 3-4h4.111a.896.896 0 0 0 .629-.256.868.868 0 0 0 .26-.619v-9.25a.868.868 0 0 0-.26-.619.896.896 0 0 0-.63-.256Z"
                                />
                              </svg>
                              Schedule Interview
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="flex py-2 px-4 text-sm hover:bg-purple-100 dark:hover:bg-purple-600 dark:hover:text-white"
                            >
                              <svg
                                className="w-5 h-5 me-2 text-purple-600 dark:text-white"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Hire
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="flex py-2 px-4 text-sm hover:bg-purple-100 dark:hover:bg-purple-600 dark:hover:text-white"
                            >
                              <svg
                                className="w-5 h-5 me-2 text-red-700 dark:text-white"
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
                                  strokeWidth="1.2"
                                  d="M6 18 17.94 6M18 18 6.06 6"
                                />
                              </svg>
                              Decline
                            </a>
                          </li>
                        </ul>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Talents */}
        <div className="grid grid-cols-1 justify-between border-2 rounded-lg border-gray-100 bg-white dark:border-gray-600 h-auto mb-4 mx-6 px-5 py-4">
          <div className="flex items-center">
            <h5 className="text-lg font-semibold dark:text-white">
              Browse All Talents
            </h5>
          </div>
          <form className="flex items-center max-w-sm">
            <label htmlFor="simple-search" className="sr-only">
              Search
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 18 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="simple-search"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                placeholder="Search job name..."
                required
              />
            </div>
            <button
              type="submit"
              className="p-2.5 ms-2 text-sm font-medium text-white bg-purple-600 rounded-lg border border-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800"
            >
              <svg
                className="w-4 h-4"
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
              <span className="sr-only">Search</span>
            </button>
          </form>
          <div href="#" className="col-span-4">
            {sortedByTimeApplications.map((app) => (
              <div
                key={app.applicationID}
                className="col-span-1 border-2 rounded-lg border-gray-100 bg-white dark:border-gray-600  h-auto min-h-20 mt-4"
                // onClick={() => openUpdateForm(job)}
              >
                <div className="grid grid-cols-10 bg-white border border-gray-100 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <div className="col-span-2 grid justify-items-center content-center">
                    {app.applicantPic ? (
                      <img
                        className="mx-auto mb-2 w-14 h-14 rounded-full border-4 border-purple-600"
                        src={app.applicantPic}
                        alt="Profile Pic"
                      />
                    ) : (
                      <img
                        className="mx-auto mb-2 w-14 h-14 rounded-full border-4 border-purple-600"
                        src={user}
                        alt="Profile Pic"
                      ></img>
                    )}
                  </div>
                  <div className="px-2 py-3 col-span-6">
                    <a href="#">
                      <h5 className="mb-1 text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                        {app.applicantFName}
                      </h5>
                    </a>

                    <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                      <li>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium me-5 px-2 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                          {app.jobTitle}
                        </span>

                        <p className="inline-block pr-8 py-2 text-xs">
                          {new Intl.DateTimeFormat("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "2-digit",
                          }).format(new Date(app.appliedAt))}
                        </p>
                      </li>
                    </ul>
                  </div>
                  <div className="col-span-2 grid justify-items-center content-center">
                    <span className="bg-purple-100 text-purple-600 text-md font-bold me-2 px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
                      {app.score}%
                    </span>
                  </div>
                  <div className="flex col-span-10 justify-items-center content-center mx-20 mb-4 space-x-2">
                    <button
                      onClick={() =>
                        updateApplicationStatus(app.applicationID, app.resume)
                      }
                      className="inline-flex items-center justify-center text-center bg-purple-50 text-purple-600 text-sm font-medium w-full py-1 rounded-md dark:bg-gray-700 border-2 border-purple-400 hover:bg-purple-100 hover:text-purple-600 group"
                    >
                      <svg
                        className="w-5 h-5 me-2 text-purple-600"
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
                          strokeWidth="2"
                          d="M10 3v4a1 1 0 0 1-1 1H5m4 6 2 2 4-4m4-8v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1Z"
                        />
                      </svg>
                      View Resume
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDropdown(app.applicationID)}
                      data-dropdown-toggle="apps-dropdown"
                      className="relative p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                    >
                      <span className="sr-only">View Status</span>
                      {/* <!-- Icon --> */}
                      <img src={option} className="h-6" alt="icon" />
                      <div
                        className={`${
                          showDropdown[app.applicationID]
                            ? "opacity-100 visible"
                            : "opacity-0 invisible"
                        } absolute my-4 w-56 text-base list-none bg-white divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600 rounded-xl transition-opacity duration-300`}
                        style={{
                          top: showDropdown[app.applicationID]?.top || 0,
                          left: showDropdown[app.applicationID]?.left || 0,
                          zIndex: 9999,
                        }}
                        id="dropdown"
                      >
                        <div className="py-3 px-4">
                          <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                            Edit Hiring Status
                          </span>
                        </div>
                        {/* Dropdown menu items */}
                        <ul
                          className="py-1 text-gray-700 dark:text-gray-300"
                          aria-labelledby="dropdown"
                        >
                          <li>
                            <a
                              href="#"
                              className="flex py-2 px-4 text-sm hover:bg-purple-100 dark:hover:bg-purple-600 dark:text-gray-400 dark:hover:text-white"
                            >
                              <svg
                                className="w-5 h-5 me-2 text-gray-800 dark:text-white"
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
                                  strokeWidth="1.2"
                                  d="M7.556 8.5h8m-8 3.5H12m7.111-7H4.89a.896.896 0 0 0-.629.256.868.868 0 0 0-.26.619v9.25c0 .232.094.455.26.619A.896.896 0 0 0 4.89 16H9l3 4 3-4h4.111a.896.896 0 0 0 .629-.256.868.868 0 0 0 .26-.619v-9.25a.868.868 0 0 0-.26-.619.896.896 0 0 0-.63-.256Z"
                                />
                              </svg>
                              Schedule Interview
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="flex py-2 px-4 text-sm hover:bg-purple-100 dark:hover:bg-purple-600 dark:hover:text-white"
                            >
                              <svg
                                className="w-5 h-5 me-2 text-purple-600 dark:text-white"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Hire
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="flex py-2 px-4 text-sm hover:bg-purple-100 dark:hover:bg-purple-600 dark:hover:text-white"
                            >
                              <svg
                                className="w-5 h-5 me-2 text-red-700 dark:text-white"
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
                                  strokeWidth="1.2"
                                  d="M6 18 17.94 6M18 18 6.06 6"
                                />
                              </svg>
                              Decline
                            </a>
                          </li>
                        </ul>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Talents;
