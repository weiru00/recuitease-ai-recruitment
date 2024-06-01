import React from "react";
import Sidebar from "./Sidebar";
import NoResult from "../NoResult";
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { user, option, talents } from "../../assets";
import StatusModal from "../StatusModal";
import ForwardForm from "./ForwardForm";
import { Tooltip } from "react-tooltip";
import OfferForm from "./OfferForm";

// import EmailPreview from "./EmailPreview";

const Talents = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const recruiterID = queryParams.get("uid");

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showForwardForm, setShowForwardForm] = useState(false);
  const [status, setStatus] = useState("");
  const [desc, setDesc] = useState("");
  const [applicationID, setApplicationID] = useState("");
  const [showDropdown, setShowDropdown] = useState({});
  const [searchQueryTopTalents, setSearchQueryTopTalents] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPendingTalents, setShowPendingTalents] = useState(true);
  const [showApprovedTalents, setShowApprovedTalents] = useState(false);
  const [showRejectedTalents, setShowRejectedTalents] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [emailContent, setEmailContent] = useState("");

  const openPendingTalents = () => {
    setShowApprovedTalents(false);
    setShowRejectedTalents(false);
    setShowPendingTalents(true);
  };

  const openApprovedTalents = () => {
    setShowPendingTalents(false);
    setShowRejectedTalents(false);
    setShowApprovedTalents(true);
  };

  const openRejectedTalents = () => {
    setShowPendingTalents(false);
    setShowApprovedTalents(false);
    setShowRejectedTalents(true);
  };

  const openOfferForm = (applicationID, newStatus) => {
    setShowOfferForm(true);
    setApplicationID(applicationID);
    setStatus(newStatus);
    // handlePreview();
  };

  const closeOfferForm = () => setShowOfferForm(false);

  const toggleDropdown = (appId) => {
    setShowDropdown((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }));
  };

  const closeStatusModal = () => setShowStatusModal(false);

  const openStatusModal = (applicationID, newStatus, desc) => {
    setShowStatusModal(true);
    setStatus(newStatus);
    setApplicationID(applicationID);
    setDesc(desc);
  };

  const closeForwardForm = () => setShowForwardForm(false);

  const openForwardForm = (applicationID) => {
    setShowForwardForm(true);
    setApplicationID(applicationID);
  };

  // const closeEmailPreview = () => setShowEmailPreview(false);

  // const openEmailPreview = (applicationID, status) => {
  //   setShowEmailPreview(true);
  //   setApplicationID(applicationID);
  //   setStatus(status);
  // };

  const handleConfirmStatus = async () => {
    closeStatusModal();
    handleStatusChange(applicationID, status);
  };

  const pendingTalents = applications.filter(
    (app) => app.status === "Review" || app.status === "Applied"
  );

  const hiredTalents = applications.filter((app) => app.status === "Accept");

  const rejectedTalents = applications.filter((app) => app.status === "Reject");

  const topTalents = pendingTalents
    .filter((app) => app.score > 60)
    .sort((a, b) => b.score - a.score);

  const topTalentIds = topTalents.map((app) => app.applicationID);

  const sortedByTimeApplications = pendingTalents
    .filter((app) => !topTalentIds.includes(app.applicationID)) // Exclude top talents
    .sort((a, b) => new Date(a.appliedAt) - new Date(b.appliedAt));

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

  useEffect(() => {
    fetchApplications();
  }, [recruiterID]);

  // const handlePreview = async (e) => {
  //   e.preventDefault();
  //   const response = await fetch("/api/preview_email", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       applicationID,
  //       status,
  //     }),
  //   });
  //   const data = await response.json();
  //   setEmailContent(data.email_content);
  // };

  const filterApplications = (apps, query) => {
    return apps.filter((app) =>
      app.jobTitle.toLowerCase().includes(query.toLowerCase())
    );
  };

  const filteredTopTalents = useMemo(() => {
    return filterApplications(topTalents, searchQueryTopTalents);
  }, [topTalents, searchQueryTopTalents]);

  const filteredSortedByTimeApplications = useMemo(() => {
    return filterApplications(sortedByTimeApplications, searchQuery);
  }, [sortedByTimeApplications, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchChangeTopTalents = (e) => {
    setSearchQueryTopTalents(e.target.value);
  };

  const viewResumeAndUpdateStatus = (applicationId, resumeUrl, status) => {
    // Open the resume in a new tab
    window.open(resumeUrl, "_blank");

    if (status === "Applied")
      updateApplicationStatus(applicationId, "Review")
        .then(() => {
          console.log(
            `Status updated to "Review" for application ${applicationId}`
          );
        })
        .catch((error) => {
          console.error("Failed to update application status:", error);
        });
  };

  const updateApplicationStatus = async (applicationID, newStatus) => {
    try {
      const response = await fetch(
        `api/update-application-status?uid=${recruiterID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ applicationID, status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update application status");
      }

      setApplications(
        applications.map((app) => {
          if (app.applicationID === applicationID) {
            // Store the current status as previousStatus before updating
            const updatedApp = {
              ...app,
              prevStatus: app.status, // Storing the current status as previousStatus
              status: newStatus, // Updating to the new status
            };
            return updatedApp;
          }
          return app;
        })
      );

      console.log("Status updated successfully:", data);
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const handleStatusChange = (applicationID, newStatus) => {
    updateApplicationStatus(applicationID, newStatus)
      .then(() => {
        console.log(
          `Status updated to ${newStatus} for application ${applicationID}`
        );
      })
      .catch((error) => {
        console.error("Failed to update application status:", error);
      });
  };

  if (loading) {
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
  }

  const getStatusStyles = (status) => {
    switch (status) {
      case "Review":
        return "bg-yellow-100 text-yellow-800 border-yellow-400";
      case "Onboard":
        return "bg-green-100 text-green-800 border-green-400";
      case "Reject":
        return "bg-red-100 text-red-800 border-red-400";
      case "Interview":
        return "bg-purple-100 text-purple-800 border-purple-400";
      default:
        return "hidden ";
    }
  };

  const ApplicationStatus = ({ status }) => {
    const statusStyles = getStatusStyles(status);
    return (
      <span
        className={`text-xs font-medium me-2 px-2.5 py-0.5 rounded border ${statusStyles}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="font-body antialiased bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="p-2 md:px-10 md:ml-72 md:mr-24 sm:ml-48 sm:mr-24 h-auto pt-8">
        {/* <div className="flex justify-between border-2 rounded-lg border-gray-100 bg-[url('assets/bg.png')] dark:border-gray-600 h-48 mb-8 mx-6 px-10 py-6 z-40">
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
        </div> */}

        <nav className="font-body border-gray-200">
          <div className="max-w-screen-xl flex justify-center flex-wrap items-center mx-auto px-4 ">
            <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1 ">
              <ul className="flex flex-row font-medium text-sm p-4 md:p-0 mt-4 space-x-8 rtl:space-x-reverse ">
                <li>
                  <a
                    href="#"
                    onClick={openPendingTalents}
                    className={`block px-3 py-1.5 text-gray-800 hover:text-purple-700 focus:bg-purple-600 focus:text-white rounded-2xl ${
                      showPendingTalents ? "bg-purple-600 text-white" : ""
                    }`}
                  >
                    Pending
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={openApprovedTalents}
                    className={`block px-3 py-1.5 text-gray-800 hover:text-purple-700 focus:bg-purple-600 focus:text-white rounded-2xl ${
                      showApprovedTalents ? "bg-purple-600 text-white" : ""
                    }`}
                  >
                    Approved
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={openRejectedTalents}
                    className={`block px-3 py-1.5 text-gray-800 hover:text-purple-700 focus:bg-purple-600 focus:text-white rounded-2xl ${
                      showRejectedTalents ? "bg-purple-600 text-white" : ""
                    }`}
                  >
                    Rejected
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Pending Section */}
        {showPendingTalents && (
          <div>
            {/* Top Talents */}
            <div className="grid grid-cols-1 rounded-xl border-gray-100 border-2  dark:border-gray-600 h-auto mb-4 mx-6 mt-10 px-6 py-6">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <h5 className="text-lg font-semibold text-purple-600">
                    Top Talents ({filteredTopTalents.length})
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
                      value={searchQueryTopTalents}
                      onChange={handleSearchChangeTopTalents}
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
              </div>
              <div href="#" className="grid grid-cols-3 space-x-6 mt-2">
                {filteredTopTalents.length > 0 ? (
                  filteredTopTalents.map((app) => (
                    <div
                      key={app.applicationID}
                      className="bg-white p-6 rounded-lg shadow-lg w-auto"
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          {app.applicantPic ? (
                            <img
                              className="w-12 h-12 rounded-full"
                              src={app.applicantPic}
                              alt="Profile"
                            />
                          ) : (
                            <img
                              className="mx-auto mb-2 w-14 h-14 rounded-full border-4 border-purple-600"
                              src={user}
                              alt="Profile Pic"
                            ></img>
                          )}
                          <div className="ml-4">
                            <h3 className="text-purple-600 text-md font-semibold">
                              {app.applicantFName} {app.applicantLName}
                            </h3>
                            <p className="text-gray-500 text-sm">
                              {new Intl.DateTimeFormat("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "2-digit",
                              }).format(new Date(app.appliedAt))}
                            </p>
                          </div>
                        </div>
                        <div className="col-span-2 grid justify-items-center content-center">
                          <span className="bg-purple-100 text-purple-600 text-md font-bold me-2 px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
                            {app.score}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-6">
                        <div className="flex items-center mb-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                          <h4 className="text-gray-500 font-normal text-sm me-2">
                            Job Applied:{" "}
                          </h4>
                          <h4 className="text-gray-800 font-medium text-sm">
                            {app.jobTitle}
                          </h4>
                        </div>
                        <div className="flex items-center mb-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                          <h4 className="text-gray-500 font-normal text-sm me-2">
                            Status:{" "}
                          </h4>
                          <h4 className="text-gray-800 font-medium text-sm">
                            {app.status}
                          </h4>
                        </div>
                        <div className="flex items-center mt-7 mb-2">
                          <div className="w-2 h-2 rounded-full bg-purple-600 mr-2"></div>
                          <h4 className="text-gray-800 font-medium text-sm">
                            {app.predicted_category}
                          </h4>

                          <div>
                            <p className="text-purple-500 bg-purple-100 font-medium ml-2 me-2 px-2 py-0.5 rounded-full text-xs">
                              AI-Recommended Job
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex border-t border-gray-300 pt-2">
                        <button
                          onClick={() =>
                            viewResumeAndUpdateStatus(
                              app.applicationID,
                              app.resume,
                              app.status
                            )
                          }
                          className="flex-1 inline-flex justify-center bg-white text-purple-600 py-1 text-sm border-r border-gray-300 hover:bg-purple-50 hover:rounded-xl"
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
                          VIEW RESUME
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleDropdown(app.applicationID)}
                          data-dropdown-toggle="apps-dropdown"
                          className="relative inline-flex flex-1 py-1 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 justify-center focus:ring-4 focus:ring-gray-300 hover:rounded-xl"
                        >
                          <img src={option} className="h-5 me-2" alt="icon" />
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
                            <div className="py-3 px-4 bg-purple-50">
                              <span className="block text-sm font-semibold text-gray-900 ">
                                Select Hiring Status
                              </span>
                            </div>
                            {/* Dropdown menu items */}
                            <ul
                              className="py-1 text-gray-700 dark:text-gray-300"
                              aria-labelledby="dropdown"
                            >
                              <li>
                                <a
                                  onClick={() =>
                                    openForwardForm(app.applicationID)
                                  }
                                  className="flex py-2 px-4 text-sm hover:bg-purple-100 dark:hover:bg-purple-600 dark:hover:text-white"
                                >
                                  <svg
                                    className="w-5 h-5 me-2 text-green-400 dark:text-white"
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
                                  Shortlist
                                </a>
                              </li>
                              <li>
                                <a
                                  onClick={() =>
                                    openStatusModal(
                                      app.applicationID,
                                      "Reject",
                                      "Are you sure to REJECT this applicant? This will trigger a rejection email to the applicant."
                                    )
                                  }
                                  className="flex py-2 px-4 text-sm hover:bg-purple-100 dark:hover:bg-purple-600 dark:hover:text-white"
                                >
                                  <svg
                                    className="w-5 h-5 me-2 text-red-500 dark:text-white"
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
                                  Decline
                                </a>
                              </li>
                            </ul>
                          </div>
                          SET STATUS
                        </button>
                      </div>
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

            {/* All Talents */}
            <div className="grid grid-cols-1 rounded-xl border-gray-100 border-2 dark:border-gray-600 h-auto mb-4 mx-6 mt-10 px-6 py-6">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <h5 className="text-lg font-semibold text-purple-600">
                    Other Talents ({filteredSortedByTimeApplications.length})
                  </h5>
                </div>
                <form className="flex items-center max-w-sm">
                  <label htmlFor="simple-search-alltalents" className="sr-only">
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
                      id="simple-search-alltalents"
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                      placeholder="Search job name..."
                      value={searchQuery}
                      onChange={handleSearchChange}
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
              </div>
              <div href="#" className="grid grid-cols-3 space-x-6 mt-2">
                {filteredSortedByTimeApplications.length > 0 ? (
                  filteredSortedByTimeApplications.map((app) => (
                    <div
                      key={app.applicationID}
                      className="bg-white p-6 rounded-lg shadow-lg w-auto"
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          {app.applicantPic ? (
                            <img
                              className="w-12 h-12 rounded-full"
                              src={app.applicantPic}
                              alt="Profile"
                            />
                          ) : (
                            <img
                              className="mx-auto mb-2 w-14 h-14 rounded-full border-4 border-purple-600"
                              src={user}
                              alt="Profile Pic"
                            ></img>
                          )}
                          <div className="ml-4">
                            <h3 className="text-purple-600 text-md font-semibold">
                              {app.applicantFName} {app.applicantLName}
                            </h3>
                            <p className="text-gray-500 text-sm">
                              {new Intl.DateTimeFormat("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "2-digit",
                              }).format(new Date(app.appliedAt))}
                            </p>
                          </div>
                        </div>
                        <div className="col-span-2 grid justify-items-center content-center">
                          <span className="bg-purple-100 text-purple-600 text-md font-bold me-2 px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
                            {app.score}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-6">
                        <div className="flex items-center mb-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                          <h4 className="text-gray-500 font-normal text-sm me-2">
                            Job Applied:{" "}
                          </h4>
                          <h4 className="text-gray-800 font-medium text-sm">
                            {app.jobTitle}
                          </h4>
                        </div>
                        <div className="flex items-center mb-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                          <h4 className="text-gray-500 font-normal text-sm me-2">
                            Status:{" "}
                          </h4>
                          <h4 className="text-gray-800 font-medium text-sm">
                            {app.status}
                          </h4>
                        </div>
                        <div className="flex items-center mt-7 mb-2">
                          <div className="w-2 h-2 rounded-full bg-purple-600 mr-2"></div>
                          <h4 className="text-gray-800 font-medium text-sm">
                            {app.predicted_category}
                          </h4>

                          <div>
                            <p className="text-purple-500 bg-purple-100 font-medium ml-2 me-2 px-2 py-0.5 rounded-full text-xs">
                              AI-Recommended Job
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex border-t border-gray-300 pt-2">
                        <button
                          onClick={() =>
                            viewResumeAndUpdateStatus(
                              app.applicationID,
                              app.resume,
                              app.status
                            )
                          }
                          className="flex-1 inline-flex justify-center bg-white text-purple-600 py-1 text-sm border-r border-gray-300 hover:bg-purple-50 hover:rounded-xl"
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
                          VIEW RESUME
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleDropdown(app.applicationID)}
                          data-dropdown-toggle="apps-dropdown"
                          className="relative inline-flex flex-1 py-1 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 justify-center focus:ring-4 focus:ring-gray-300 hover:rounded-xl"
                        >
                          {/* <span className="sr-only">View Status</span> */}
                          {/* <!-- Icon --> */}
                          <img src={option} className="h-5 me-2" alt="icon" />
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
                            <div className="py-3 px-4 bg-purple-50">
                              <span className="block text-sm font-semibold text-gray-900 ">
                                Select Hiring Status
                              </span>
                            </div>
                            {/* Dropdown menu items */}
                            <ul
                              className="py-1 text-gray-700 dark:text-gray-300"
                              aria-labelledby="dropdown"
                            >
                              <li>
                                <a
                                  onClick={() =>
                                    openForwardForm(app.applicationID)
                                  }
                                  className="flex py-2 px-4 text-sm hover:bg-purple-100 dark:hover:bg-purple-600 dark:hover:text-white"
                                >
                                  <svg
                                    className="w-5 h-5 me-2 text-green-400 dark:text-white"
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
                                  Shortlist
                                </a>
                              </li>
                              <li>
                                <a
                                  onClick={() =>
                                    openStatusModal(
                                      app.applicationID,
                                      "Reject",
                                      "Are you sure to REJECT this applicant? This will trigger a rejection email to the applicant."
                                    )
                                  }
                                  className="flex py-2 px-4 text-sm hover:bg-purple-100 dark:hover:bg-purple-600 dark:hover:text-white"
                                >
                                  <svg
                                    className="w-5 h-5 me-2 text-red-500 dark:text-white"
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
                                  Decline
                                </a>
                              </li>
                            </ul>
                          </div>
                          SET STATUS
                        </button>
                      </div>
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

            {/* OLD */}
            {/* <div className="grid grid-cols-1 justify-between rounded-lg border-gray-100 bg-white dark:border-gray-600 h-auto mb-4 mx-6 px-5 py-4">
              <div className="flex items-center">
                <h5 className="text-lg text-purple-600 font-semibold dark:text-white">
                  Other Talents ({filteredSortedByTimeApplications.length})
                </h5>
              </div>
              <form className="flex items-center max-w-sm">
                <label htmlFor="simple-search-alltalents" className="sr-only">
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
                    id="simple-search-alltalents"
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                    placeholder="Search job name..."
                    value={searchQuery}
                    onChange={handleSearchChange}
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
                {filteredSortedByTimeApplications.length > 0 ? (
                  filteredSortedByTimeApplications.map((app) => (
                    <div
                      key={app.applicationID}
                      className="col-span-1 border-2 rounded-lg border-gray-100 bg-white dark:border-gray-600  h-auto min-h-20 mt-4"
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
                          <div className="flex">
                            <h5 className="mb-1 text-lg font-semibold tracking-tight me-3 text-gray-900 dark:text-white">
                              {app.applicantFName}
                            </h5>
                            <div>
                              <ApplicationStatus status={app.status} />
                            </div>
                          </div>

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
                              viewResumeAndUpdateStatus(
                                app.applicationID,
                                app.resume,
                                app.status
                              )
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
                            <img src={option} className="h-6" alt="icon" />
                            <div
                              className={`${
                                showDropdown[app.applicationID]
                                  ? "opacity-100 visible"
                                  : "opacity-0 invisible"
                              } absolute my-4 w-56 text-base list-none bg-white divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600 rounded-xl transition-opacity duration-300`}
                              style={{
                                top: showDropdown[app.applicationID]?.top || 0,
                                left:
                                  showDropdown[app.applicationID]?.left || 0,
                                zIndex: 9999,
                              }}
                              id="dropdown"
                            >
                              <div className="py-3 px-4 bg-purple-50">
                                <span className="block text-sm font-semibold text-gray-900 ">
                                  Select Hiring Status
                                </span>
                              </div>
                              <ul
                                className="py-1 text-gray-700 dark:text-gray-300"
                                aria-labelledby="dropdown"
                              >
                                <li>
                                  <a
                                    onClick={() =>
                                      openForwardForm(app.applicationID)
                                    }
                                    className="flex py-2 px-4 text-sm hover:bg-purple-100 dark:hover:bg-purple-600 dark:hover:text-white"
                                  >
                                    <svg
                                      className="w-5 h-5 me-2 text-green-400 dark:text-white"
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
                                    Shortlist
                                  </a>
                                </li>
                                <li>
                                  <a
                                    onClick={() =>
                                      openStatusModal(
                                        app.applicationID,
                                        "Reject"
                                      )
                                    }
                                    className="flex py-2 px-4 text-sm hover:bg-purple-100 dark:hover:bg-purple-600 dark:hover:text-white"
                                  >
                                    <svg
                                      className="w-5 h-5 me-2 text-red-500 dark:text-white"
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
                                    Decline
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <NoResult
                    title={"No result found"}
                    desc={"Try adjusting your search or filters."}
                  />
                )}
              </div>
            </div> */}
            {/* END OF OLD */}
          </div>
        )}

        {/* Approved Section */}
        {showApprovedTalents && (
          <div className="grid grid-cols-1 rounded-xl border-gray-100 border-2  dark:border-gray-600 h-auto mb-4 mx-6 mt-10 px-6 py-6">
            <div className="flex justify-between">
              <div className="flex items-center">
                <h5 className="text-lg font-semibold text-purple-600">
                  Pending Offer Letters ({hiredTalents.length})
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
                    value={searchQueryTopTalents}
                    onChange={handleSearchChangeTopTalents}
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
            </div>
            <div href="#" className="grid grid-cols-3 space-x-6 mt-2">
              {hiredTalents.length > 0 ? (
                hiredTalents.map((app) => (
                  <div
                    key={app.applicationID}
                    className="bg-white p-6 rounded-lg shadow-lg w-auto"
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        {app.applicantPic ? (
                          <img
                            className="w-12 h-12 rounded-full"
                            src={app.applicantPic}
                            alt="Profile"
                          />
                        ) : (
                          <img
                            className="mx-auto mb-2 w-14 h-14 rounded-full border-4 border-purple-600"
                            src={user}
                            alt="Profile Pic"
                          ></img>
                        )}
                        <div className="ml-4">
                          <h3 className="text-purple-600 text-md font-semibold">
                            {app.applicantFName} {app.applicantLName}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            {new Intl.DateTimeFormat("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "2-digit",
                            }).format(new Date(app.appliedAt))}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-2 grid justify-items-center content-center">
                        <span className="bg-purple-100 text-purple-600 text-md font-bold me-2 px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
                          {app.score}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-6">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                        <h4 className="text-gray-500 font-normal text-sm me-2">
                          Job Applied:{" "}
                        </h4>
                        <h4 className="text-gray-800 font-medium text-sm">
                          {app.jobTitle}
                        </h4>
                      </div>
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                        <h4 className="text-gray-500 font-normal text-sm me-2">
                          Status:{" "}
                        </h4>
                        <h4 className="text-gray-800 font-medium text-sm">
                          {app.status}
                        </h4>
                      </div>
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                        <h4 className="text-gray-500 font-normal text-sm me-2">
                          Accepted by:{" "}
                        </h4>
                        <h4 className="text-gray-800 font-medium text-sm">
                          {app.managerFName} {app.managerLName} (
                          {app.managerPosition})
                        </h4>
                      </div>

                      <div className="flex items-center mt-7 mb-2">
                        <div className="w-2 h-2 rounded-full bg-purple-600 mr-2"></div>
                        <h4 className="text-gray-800 font-medium text-sm">
                          {app.predicted_category}
                        </h4>

                        <div>
                          <p className="text-purple-500 bg-purple-100 font-medium ml-2 me-2 px-2 py-0.5 rounded-full text-xs">
                            AI-Recommended Job
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex border-t border-gray-300 pt-2">
                      <button
                        onClick={() =>
                          viewResumeAndUpdateStatus(
                            app.applicationID,
                            app.resume,
                            app.status
                          )
                        }
                        data-tooltip-id="resume-tooltip"
                        data-tooltip-content="View Resume" // onClick={() => window.open(app.resume, "_blank")}
                        className="flex-1 inline-flex justify-center bg-white text-gray-600 py-1 text-sm border-r border-gray-300 hover:bg-gray-50 hover:rounded-xl"
                      >
                        <svg
                          className="w-5 h-5 me-2 text-gray-600"
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
                        VIEW RESUME
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openOfferForm(app.applicationID, app.status)
                        }
                        data-tooltip-id="email-tooltip"
                        data-tooltip-content="Prepare Offer Letter" // onClick={() => window.open(app.resume, "_blank")}
                        className="relative inline-flex flex-1 py-1 text-purple-600 rounded-lg hover:text-purple-900 hover:bg-purple-100 justify-center focus:ring-4 focus:ring-gray-300 hover:rounded-xl"
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
                            strokeWidth="2"
                            d="m3.5 5.5 7.893 6.036a1 1 0 0 0 1.214 0L20.5 5.5M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"
                          />
                        </svg>
                        OFFER LETTER
                      </button>
                    </div>
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
        )}

        {/* OLD */}
        {/* {showApprovedTalents && (
          <div>
            <div className="grid grid-cols-1 justify-between rounded-lg border-gray-100 bg-white dark:border-gray-600 h-auto mb-4 mx-6 mt-10 px-5 py-4">
              <div className="flex items-center">
                <h5 className="text-lg font-semibold text-purple-600">
                  Pending Offer letter ({hiredTalents.length})
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
                    value={searchQueryTopTalents}
                    onChange={handleSearchChangeTopTalents}
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
                {hiredTalents.length > 0 ? (
                  hiredTalents.map((app) => (
                    <div
                      key={app.applicationID}
                      className="col-span-1 border-2 rounded-lg border-gray-100 bg-white dark:border-gray-600 h-auto min-h-20 mt-2"
                    >
                      <div className="grid grid-cols-10 bg-white border border-gray-100 rounded-lg items-center">
                        <div className="col-span-2 grid justify-items-center content-center  my-1">
                          <img
                            className="mx-auto mb-2 w-14 h-14 rounded-full border-4 border-purple-600"
                            src={app.applicantPic || user}
                            alt="Profile Pic"
                          ></img>
                          <span className="bg-purple-100 text-purple-600 text-sm font-semibold me-2 px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
                            {app.score}%
                          </span>
                        </div>
                        <div className="px-2 py-3 col-span-6">
                          <div className="flex">
                            <h5 className="mb-1 text-lg font-semibold tracking-tight me-3 text-gray-900 dark:text-white">
                              {app.applicantFName}
                            </h5>
                            <div>
                              <ApplicationStatus status={app.status} />
                            </div>
                          </div>

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
                        <div className="flex justify-items-center content-center my-10 space-x-4 align-items-center">
                          <button
                            onClick={() =>
                              viewResumeAndUpdateStatus(
                                app.applicationID,
                                app.resume,
                                app.status
                              )
                            }
                            data-tooltip-id="resume-tooltip"
                            data-tooltip-content="View Resume" // onClick={() => window.open(app.resume, "_blank")}
                            className="inline-flex items-center justify-center text-center text-gray-700 text-sm font-medium p-2 rounded-xl bg-gray-100  hover:bg-gray-200 hover:text-gray-800 group"
                          >
                            <svg
                              className="w-6 h-6 text-gray-600"
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
                          </button>
                          <button
                            onClick={() =>
                              openOfferForm(app.applicationID, app.status)
                            }
                            data-tooltip-id="email-tooltip"
                            data-tooltip-content="Prepare Offer Letter" // onClick={() => window.open(app.resume, "_blank")}
                            className="inline-flex items-center justify-center text-center bg-purple-100 text-purple-600 text-sm font-medium p-2 rounded-xl hover:bg-purple-200 hover:text-purple-700 group"
                          >
                            <svg
                              className="w-6 h-6 text-purple-600"
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
                                strokeWidth="2"
                                d="m3.5 5.5 7.893 6.036a1 1 0 0 0 1.214 0L20.5 5.5M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"
                              />
                            </svg>

                          </button>
                          <Tooltip id="resume-tooltip" />
                          <Tooltip id="email-tooltip" />
                        </div>
                      </div>
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
        )} */}
        {/* END OF OLD */}

        {/* Rejected Section */}
        {showRejectedTalents && (
          <div className="grid grid-cols-1 rounded-xl border-gray-100 border-2  dark:border-gray-600 h-auto mb-4 mx-6 mt-10 px-6 py-6">
            <div className="flex justify-between">
              <div className="flex items-center">
                <h5 className="text-lg font-semibold text-purple-600">
                  Rejected Applicants ({rejectedTalents.length})
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
                    value={searchQueryTopTalents}
                    onChange={handleSearchChangeTopTalents}
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
            </div>
            <div href="#" className="grid grid-cols-3 space-x-6 mt-2">
              {rejectedTalents.length > 0 ? (
                rejectedTalents.map((app) => (
                  <div
                    key={app.applicationID}
                    className="bg-white p-6 rounded-lg shadow-lg w-auto"
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        {app.applicantPic ? (
                          <img
                            className="w-12 h-12 rounded-full"
                            src={app.applicantPic}
                            alt="Profile"
                          />
                        ) : (
                          <img
                            className="mx-auto mb-2 w-14 h-14 rounded-full border-4 border-purple-600"
                            src={user}
                            alt="Profile Pic"
                          ></img>
                        )}
                        <div className="ml-4">
                          <h3 className="text-purple-600 text-md font-semibold">
                            {app.applicantFName} {app.applicantLName}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            {new Intl.DateTimeFormat("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "2-digit",
                            }).format(new Date(app.appliedAt))}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-2 grid justify-items-center content-center">
                        <span className="bg-purple-100 text-purple-600 text-md font-bold me-2 px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
                          {app.score}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-6">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                        <h4 className="text-gray-500 font-normal text-sm me-2">
                          Job Applied:{" "}
                        </h4>
                        <h4 className="text-gray-800 font-medium text-sm">
                          {app.jobTitle}
                        </h4>
                      </div>
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                        <h4 className="text-gray-500 font-normal text-sm me-2">
                          Status:{" "}
                        </h4>
                        <h4 className="text-gray-800 font-medium text-sm">
                          {app.status}
                        </h4>
                      </div>
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                        <h4 className="text-gray-500 font-normal text-sm me-2">
                          Rejected by:{" "}
                        </h4>
                        <h4 className="text-gray-800 font-medium text-sm">
                          {app.managerFName} {app.managerLName} (
                          {app.managerPosition})
                        </h4>
                      </div>

                      <div className="flex items-center mt-7 mb-2">
                        <div className="w-2 h-2 rounded-full bg-purple-600 mr-2"></div>
                        <h4 className="text-gray-800 font-medium text-sm">
                          {app.predicted_category}
                        </h4>

                        <div>
                          <p className="text-purple-500 bg-purple-100 font-medium ml-2 me-2 px-2 py-0.5 rounded-full text-xs">
                            AI-Recommended Job
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex border-t border-gray-300 pt-2">
                      <button
                        onClick={() =>
                          viewResumeAndUpdateStatus(
                            app.applicationID,
                            app.resume,
                            app.status
                          )
                        }
                        data-tooltip-id="resume-tooltip"
                        data-tooltip-content="View Resume" // onClick={() => window.open(app.resume, "_blank")}
                        className="flex-1 inline-flex justify-center bg-white text-gray-600 py-1 text-sm border-r border-gray-300 hover:bg-gray-50 hover:rounded-xl"
                      >
                        <svg
                          className="w-5 h-5 me-2 text-gray-600"
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
                        VIEW RESUME
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleDropdown(app.applicationID)}
                        data-dropdown-toggle="apps-dropdown"
                        className="relative inline-flex flex-1 py-1 text-purple-500 rounded-lg hover:text-purple-900 hover:bg-purple-100 justify-center focus:ring-4 focus:ring-purple-300 hover:rounded-xl"
                      >
                        <img src={option} className="h-5 me-2" alt="icon" />
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
                          <div className="py-3 px-4 bg-purple-50">
                            <span className="block text-sm font-semibold text-gray-900 ">
                              Select Hiring Status
                            </span>
                          </div>
                          {/* Dropdown menu items */}
                          <ul
                            className="py-1 text-gray-700 dark:text-gray-300"
                            aria-labelledby="dropdown"
                          >
                            <li>
                              <a
                                onClick={() =>
                                  openForwardForm(app.applicationID)
                                }
                                className="flex py-2 px-4 text-sm hover:bg-purple-100 dark:hover:bg-purple-600 dark:hover:text-white"
                              >
                                <svg
                                  className="w-5 h-5 me-2 text-green-400 dark:text-white"
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
                                Shortlist
                              </a>
                            </li>
                            <li>
                              <a
                                onClick={() =>
                                  openStatusModal(
                                    app.applicationID,
                                    "Reject",
                                    "Are you sure to REJECT this applicant? This will trigger a rejection email to the applicant."
                                  )
                                }
                                className="flex py-2 px-4 text-sm hover:bg-purple-100 dark:hover:bg-purple-600 dark:hover:text-white"
                              >
                                <svg
                                  className="w-5 h-5 me-2 text-red-500 dark:text-white"
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
                                Decline
                              </a>
                            </li>
                          </ul>
                        </div>
                        SET STATUS
                      </button>
                    </div>
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
        )}

        {/* OLD */}
        {/* {showRejectedTalents && (
          <div>
            <div className="grid grid-cols-1 justify-between rounded-lg border-gray-100 bg-white dark:border-gray-600 h-auto mb-4 mx-6 mt-10 px-5 py-4">
              <div className="flex items-center">
                <h5 className="text-lg font-semibold text-purple-600">
                  Rejected Talents ({rejectedTalents.length})
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
                    value={searchQueryTopTalents}
                    onChange={handleSearchChangeTopTalents}
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
                {rejectedTalents.length > 0 ? (
                  rejectedTalents.map((app) => (
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
                          <div className="flex">
                            <h5 className="mb-1 text-lg font-semibold tracking-tight me-3 text-gray-900 dark:text-white">
                              {app.applicantFName}
                            </h5>
                            <div>
                              <ApplicationStatus status={app.status} />
                            </div>
                          </div>

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
                              viewResumeAndUpdateStatus(
                                app.applicationID,
                                app.resume,
                                app.status
                              )
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
                            className="relative p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                          >
                            <span className="sr-only">View status</span>
                            <img src={option} className="h-6" alt="icon" />
                            <div
                              className={`${
                                showDropdown[app.applicationID]
                                  ? "opacity-100 visible"
                                  : "opacity-0 invisible"
                              } absolute my-4 w-56 text-base list-none bg-white divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600 rounded-xl transition-opacity duration-300`}
                              style={{
                                top: showDropdown[app.applicationID]?.top || 0,
                                left:
                                  showDropdown[app.applicationID]?.left || 0,
                                zIndex: 9999,
                              }}
                              id="dropdown"
                            >
                              <div className="py-3 px-4 bg-purple-50">
                                <span className="block text-sm font-semibold text-gray-900 ">
                                  Select Hiring Status
                                </span>
                              </div>
                              <ul
                                className="py-1 text-gray-700 dark:text-gray-300"
                                aria-labelledby="dropdown"
                              >
                                <li>
                                  <a
                                    onClick={() =>
                                      openStatusModal(
                                        app.applicationID,
                                        "Interview"
                                      )
                                    }
                                    className="flex py-2 px-4 text-sm hover:bg-purple-100 dark:hover:bg-purple-600 dark:text-gray-400 dark:hover:text-white"
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
                                        d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Offer Letter
                                  </a>
                                </li>
                                <li>
                                  <a
                                    onClick={() =>
                                      openForwardForm(app.applicationID)
                                    }
                                    className="flex py-2 px-4 text-sm hover:bg-purple-100 dark:hover:bg-purple-600 dark:hover:text-white"
                                  >
                                    <svg
                                      className="w-5 h-5 me-2 text-green-400 dark:text-white"
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
                                    Shortlist
                                  </a>
                                </li>
                                <li>
                                  <a
                                    onClick={() =>
                                      openStatusModal(
                                        app.applicationID,
                                        "Reject"
                                      )
                                    }
                                    className="flex py-2 px-4 text-sm hover:bg-purple-100 dark:hover:bg-purple-600 dark:hover:text-white"
                                  >
                                    <svg
                                      className="w-5 h-5 me-2 text-red-500 dark:text-white"
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
                                    Decline
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </button>
                        </div>
                      </div>
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
        )} */}
        {/* END OF OLD */}
      </main>
      {showStatusModal && (
        <StatusModal
          onCloseModal={closeStatusModal}
          onConfirm={handleConfirmStatus}
          status={status}
          desc={desc}
        />
      )}
      {showForwardForm && (
        <ForwardForm
          onCloseModal={closeForwardForm}
          // onConfirm={handleConfirmStatus}
          applicationID={applicationID}
        />
      )}
      {showOfferForm && (
        <OfferForm
          onCloseModal={closeOfferForm}
          applicationID={applicationID}
          status={status}
          fetchApplications={fetchApplications}
        />
      )}
    </div>
  );
};

export default Talents;
