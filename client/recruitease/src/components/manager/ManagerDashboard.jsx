import React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import Sidebar from "../admin/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { admin, option, user } from "../../assets";
import StatusModal from "../StatusModal";
import { Tooltip } from "react-tooltip";
import SuccessfulModal from "../SuccessfulModal";
import NoResult from "../NoResult";
import InterviewForm from "./InterviewForm";
import CancelInterviewModal from "../CancelInterviewModal";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get("uid");

  const [applicationID, setApplicationID] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState([]);
  const [status, setStatus] = useState([]);
  const [desc, setDesc] = useState([]);
  const [showDropdown, setShowDropdown] = useState({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState("");
  const [showEditInterviewForm, setShowEditInterviewForm] = useState(false);
  const [showCancelInterviewModal, setShowCancelInterviewModal] =
    useState(false);
  const [completedInterviews, setCompletedInterviews] = useState([]);
  const [pendingInterviews, setPendingInterviews] = useState([]);

  const closeStatusModal = () => setShowStatusModal(false);

  const openStatusModal = (applicationID, newStatus, desc) => {
    setShowStatusModal(true);
    setSelectedApp(applicationID);
    setStatus(newStatus);
    setDesc(desc);
  };

  const openInterviewForm = (applicationID, newStatus) => {
    setEditMode(false);
    setShowInterviewForm(true);
    setSelectedApp(applicationID);
    setStatus(newStatus);
  };

  const closeInterviewForm = () => setShowInterviewForm(false);

  const openEditInterviewForm = (applicationID, app, newStatus) => {
    setEditMode(true);
    setShowEditInterviewForm(true);
    setSelectedApp(applicationID);
    setSelectedInterview(app);
    setStatus(newStatus);
  };

  const closeEditInterviewForm = () => setShowEditInterviewForm(false);

  const openSuccessModal = (desc) => {
    setShowSuccessModal(true);
    setDesc(desc);
  };

  const openCancelInterviewModal = (applicationID, newStatus) => {
    setShowCancelInterviewModal(true);
    setSelectedApp(applicationID);
    setStatus(newStatus);
  };

  const closeCancelInterviewModal = () => setShowCancelInterviewModal(false);

  const handleConfirmStatus = async () => {
    closeStatusModal();
    // closeCancelInterviewModal();
    handleUpdateStatus(selectedApp, status);
    openSuccessModal("updated");
  };

  const handleConfirmCancel = async () => {
    closeCancelInterviewModal();
    handleUpdateStatus(selectedApp, status);
    openSuccessModal("cancel");
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  const toggleDropdown = (appId) => {
    setShowDropdown((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }));
  };

  const viewResumeAndUpdateStatus = (resumeUrl) => {
    // Open the resume in a new tab
    window.open(resumeUrl, "_blank");
  };

  const fetchApplications = async () => {
    try {
      // setLoading(true);
      const response = await fetch(
        `/api/get-forwarded-applications?uid=${uid}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  useEffect(() => {
    fetchApplications();

    const now = new Date();
    const currentDateTime = new Date(
      `${format(now, "yyyy-MM-dd")}T${format(now, "HH:mm")}`
    );

    const completed = [];
    const pending = [];

    applications.forEach((app) => {
      const meetingDateTime = new Date(`${app.meetingDate}T${app.meetingTime}`);
      const differenceInMilliseconds = meetingDateTime - currentDateTime;

      if (differenceInMilliseconds < 0) {
        completed.push(app);
      } else {
        pending.push(app);
      }
    });

    setCompletedInterviews(completed);
    setPendingInterviews(pending);
  }, [uid, applications]);

  const handleUpdateStatus = async (applicationID, newStatus) => {
    try {
      const response = await fetch(`api/update-application-status?uid=${uid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ applicationID, status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        console.log("update successful");
        fetchApplications();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Failed to update application status:", error.message);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "Review":
        return "bg-yellow-100 text-yellow-800 border-yellow-400";
      case "Accept":
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

  const pendingApps = applications.filter(
    (app) => app.status === "Forwarded" || app.status === "Cancel Interview"
  );

  const pendingInterviewApps = pendingInterviews.filter(
    (app) => app.status === "Interview" || app.status === "Reschedule"
  );

  const completedInterviewApps = completedInterviews.filter(
    (app) => app.status === "Interview" || app.status === "Reschedule"
  );

  // if (!userData) {
  //   return (
  //     <div className="text-center">
  //       <div role="status">
  //         <svg
  //           aria-hidden="true"
  //           className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
  //           viewBox="0 0 100 101"
  //           fill="none"
  //           xmlns="http://www.w3.org/2000/svg"
  //         >
  //           <path
  //             d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
  //             fill="currentColor"
  //           />
  //           <path
  //             d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
  //             fill="currentFill"
  //           />
  //         </svg>
  //         <span className="sr-only">Loading...</span>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="font-body antialiased bg-white dark:bg-gray-900">
      <Sidebar />

      <main className="p-4 md:ml-72 md:mr-24 sm:ml-48 sm:mr-24 h-auto pt-14">
        <div className="mb-6 mx-6">
          <h5 className="text-2xl font-semibold text-gray-500">
            <span className="text-purple-700 font-semibold">Dashboard</span>
          </h5>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-1 lg:grid-cols-4 gap-6 mb-6 mx-6 mt-4">
          {/* Pending Applicants */}
          <div className="col-span-3 border-2 border-gray-100 rounded-2xl h-auto p-4">
            <div className="flex justify-between mb-4">
              <h5 className="pl-3 text-purple-700 font-semibold text-lg content-center">
                Pending Applicants ({pendingApps.length})
              </h5>
            </div>

            <div className="relative">
              <table className="w-full text-sm text-left text-gray-500 rounded-xl">
                <thead className="text-md text-purple-700 uppercase bg-purple-100  dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="py-3 px-6 "></th>
                    <th scope="col" className="pl-2 pr-6 px-6 ">
                      Name
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Applied Position
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Status
                    </th>
                    <th scope="col" className="py-3 px-4">
                      Score
                    </th>
                    <th scope="col" className="py-3 px-3">
                      HR Feedback
                    </th>
                    {/* <th scope="col" className="py-3 px-3">
                          Status
                        </th> */}
                    <th scope="col" className="py-3 px-3">
                      Action
                    </th>
                    <th scope="col" className="py-3 px-3"></th>
                  </tr>
                </thead>
                {pendingApps.length > 0 ? (
                  pendingApps.map((app) => (
                    <tbody>
                      <tr
                        key={app.applicationID}
                        className="bg-white hover:bg-gray-50"
                      >
                        <td className="py-2 pl-4 pr-1">
                          <img
                            className="h-10 w-10 flex-none rounded-full bg-gray-50"
                            src={app.applicantPic || user}
                            alt="Profile Picture"
                          />
                        </td>
                        <td className="py-4 pl-2 pr-6">
                          {app.applicantFName} {app.applicantLName}
                        </td>
                        <td className="py-4 px-6">{app.jobTitle}</td>
                        <td className="py-4 px-6">{app.status}</td>
                        <td className="py-4 px-4 text-purple-500 text-md font-bold me-2">
                          {app.score}%
                        </td>
                        <td className="py-4 px-3 max-w-96">{app.feedbackHR}</td>
                        {/* <td className="py-4 px-3">{app.status}</td> */}
                        <td className="py-4 px-3">
                          <button
                            onClick={() =>
                              viewResumeAndUpdateStatus(app.resume)
                            }
                            data-tooltip-id="resume-tooltip"
                            data-tooltip-content="View Resume" // onClick={() => window.open(app.resume, "_blank")}
                            // to="/talents"
                            className="inline-flex items-center justify-center text-center bg-purple-100 text-purple-600 text-sm font-medium w-auto p-1.5 rounded-xl hover:bg-purple-200 hover:text-purple-600 group"
                          >
                            <svg
                              className="w-5 h-6 me-2 ml-2 text-purple-600"
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
                          <Tooltip id="resume-tooltip" />
                        </td>
                        <td className="py-4 px-3">
                          <button
                            type="button"
                            onClick={() => toggleDropdown(app.applicationID)}
                            className="relative p-1.5 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
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
                                      openInterviewForm(
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
                                    Schedule Interview
                                  </a>
                                </li>
                                <li>
                                  <a
                                    onClick={() =>
                                      openStatusModal(
                                        app.applicationID,
                                        "Accept",
                                        "Are you sure to ACCEPT this applicant? This will be reverted to the recruiter."
                                      )
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
                                    Accept
                                  </a>
                                </li>
                                <li>
                                  <a
                                    onClick={() =>
                                      openStatusModal(
                                        app.applicationID,
                                        "Reject",
                                        "Are you sure to REJECT this applicant? This will be reverted to the recruiter."
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
                                    Reject
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  ))
                ) : (
                  <NoResult desc={"No user"} />
                )}
              </table>
            </div>
          </div>

          <div className="col-span-1 border-2 border-gray-100 z-40 bg-purple-600 bg-opacity-95 rounded-2xl h-auto p-4">
            <img className="z-[50] h-auto mb-2" src={admin}></img>
            <h1 className="text-white font-bold text-3xl text-center">
              Admin .
            </h1>
          </div>
          {/* Pending Interview applicants */}
          <div className="col-span-2  border-gray-100 rounded-2xl h-auto border-2 px-3 py-5">
            <div className="flex justify-between mb-4">
              <h5 className="pl-3 text-purple-700 font-semibold text-lg content-center">
                Upcoming Interviews ({pendingInterviewApps.length})
              </h5>
            </div>

            <div className="flex flex-col items-left justify-center px-3">
              <ul
                role="list"
                className="grid grid-cols-1 divide-y gap-y-4 divide-purple-200 gap-x-4"
              >
                {pendingInterviewApps.length > 0 ? (
                  pendingInterviewApps.map((app) => (
                    <li
                      key={app.applicationID}
                      className="flex justify-between  py-4 items-center shadow-md rounded-xl px-3 bg-white"
                    >
                      <div className="flex min-w-0 gap-x-4 items-center ">
                        <img
                          className="h-14 w-14 flex-none rounded-full bg-gray-50"
                          src={app.applicantPic || user}
                          alt="Profile Picture"
                        />
                        <div className="min-w-0 flex-auto">
                          <p className="text-md font-semibold leading-6 text-gray-900">
                            {app.applicantFName} {app.applicantLName}
                          </p>
                          <p className="mt-0.5 mb-1 truncate text-sm leading-5 text-gray-500">
                            {app.email} | {app.jobTitle}
                          </p>
                          <span className="inline-flex mt-1 truncate text-sm leading-5 text-purple-600">
                            <svg
                              className="w-[20px] h-[20px] me-1 text-purple-600 dark:text-white"
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
                                strokeWidth="1"
                                d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                              />
                            </svg>
                            {app.meetingDate} {app.meetingTime}
                          </span>
                        </div>
                      </div>
                      <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end ">
                        <div className="mt-1 flex items-center gap-x-1.5">
                          <a
                            href={app.meetingLink}
                            data-tooltip-id="link-tooltip"
                            data-tooltip-content="Meeting Link" // onClick={() => window.open(app.resume, "_blank")}
                            className="inline-flex items-center justify-center text-center bg-purple-600 text-purple-600 text-sm font-medium w-auto p-1.5 rounded-xl hover:bg-purple-700 hover:text-purple-600 group"
                          >
                            <svg
                              className="w-5 h-6 me-2 ml-2 text-white"
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
                                d="M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m-.321-4.49a3.39 3.39 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961"
                              />
                            </svg>
                          </a>
                          <button
                            onClick={() =>
                              viewResumeAndUpdateStatus(app.resume)
                            }
                            data-tooltip-id="resume-tooltip"
                            data-tooltip-content="View Resume" // onClick={() => window.open(app.resume, "_blank")}
                            className="inline-flex items-center justify-center text-center bg-purple-100 text-purple-600 text-sm font-medium w-auto p-1.5 rounded-xl hover:bg-purple-200 hover:text-purple-600 group"
                          >
                            <svg
                              className="w-5 h-6 me-2 ml-2 text-purple-600"
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
                          <td className="py-4 px-3">
                            <button
                              type="button"
                              onClick={() => toggleDropdown(app.applicationID)}
                              className="relative p-1.5 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
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
                                  top:
                                    showDropdown[app.applicationID]?.top || 0,
                                  left:
                                    showDropdown[app.applicationID]?.left || 0,
                                  zIndex: 9999,
                                }}
                                id="dropdown"
                              >
                                {/* <div className="py-3 px-4 bg-purple-50">
                                  <span className="block text-sm font-semibold text-gray-900 ">
                                    Select Hiring Status
                                  </span>
                                </div> */}
                                <ul
                                  className="py-1 text-gray-700 dark:text-gray-300"
                                  aria-labelledby="dropdown"
                                >
                                  <li>
                                    <a
                                      onClick={() =>
                                        openEditInterviewForm(
                                          app.applicationID,
                                          app,
                                          "Reschedule"
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
                                      Reschedule Interview
                                    </a>
                                  </li>
                                  <li>
                                    <a
                                      onClick={() =>
                                        openCancelInterviewModal(
                                          app.applicationID,
                                          "Cancel Interview"
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
                                      Cancel Interview
                                    </a>
                                  </li>
                                </ul>
                              </div>
                            </button>
                          </td>
                          <Tooltip id="resume-tooltip" />
                          <Tooltip id="link-tooltip" />
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <NoResult desc={"No pending users"} />
                )}
              </ul>
            </div>
          </div>

          {/* Completed interview */}
          <div className="col-span-2  border-gray-100 rounded-2xl h-auto border-2 px-3 py-5">
            <div className="flex justify-between mb-4">
              <h5 className="pl-3 text-purple-700 font-semibold text-lg content-center">
                Completed Interviews ({completedInterviewApps.length})
              </h5>
            </div>

            <div className="flex flex-col items-left justify-between px-3">
              <ul
                role="list"
                className="grid grid-cols-1 divide-y gap-y-4 divide-purple-200 gap-x-4"
              >
                {completedInterviewApps.length > 0 ? (
                  completedInterviewApps.map((app) => (
                    <li
                      key={app.applicationID}
                      className="flex justify-between  py-4 items-center shadow-md rounded-xl  px-3 bg-purple-50 bg-opacity-75"
                    >
                      <div className="flex min-w-0 gap-x-4 items-center ">
                        <img
                          className="h-14 w-14 flex-none rounded-full bg-gray-50"
                          src={app.applicantPic || user}
                          alt="Profile Picture"
                        />
                        <div className="min-w-0 flex-auto">
                          <p className="text-md font-semibold leading-6 text-gray-900">
                            {app.applicantFName} {app.applicantLName}
                          </p>
                          <p className="mt-0.5 mb-1 truncate text-sm leading-5 text-gray-500">
                            {app.email} | {app.jobTitle}
                          </p>
                          <span className="inline-flex mt-1 truncate text-sm leading-5 text-gray-600">
                            <svg
                              className="w-[20px] h-[20px] me-1 text-gray-600 dark:text-white"
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
                                strokeWidth="1"
                                d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                              />
                            </svg>
                            {app.meetingDate} {app.meetingTime}
                          </span>
                        </div>
                      </div>
                      <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end ">
                        <div className="mt-1 flex items-center gap-x-1.5">
                          <button
                            onClick={() =>
                              openStatusModal(
                                app.applicationID,
                                "Accept",
                                "Are you sure to ACCEPT this applicant? This will be reverted to the recruiter."
                              )
                            }
                            className="inline-flex items-center justify-center text-center bg-purple-600 text-white text-sm font-medium w-auto py-2 px-3 rounded-xl hover:bg-purple-700 group"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              openStatusModal(
                                app.applicationID,
                                "Decline",
                                "Are you sure to REJECT this applicant? This will be reverted to the recruiter."
                              )
                            }
                            className="inline-flex items-center justify-center text-center bg-white text-gray-600 text-sm font-medium w-auto py-2 px-3 mr-2 rounded-xl hover:bg-gray-200 group"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <NoResult desc={"No pending users"} />
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>
      {showStatusModal && (
        <StatusModal
          onCloseModal={closeStatusModal}
          onConfirm={handleConfirmStatus}
          status={status}
          desc={desc}
        />
      )}
      {showCancelInterviewModal && (
        <CancelInterviewModal
          onCloseModal={closeCancelInterviewModal}
          onConfirm={handleConfirmCancel}
        />
      )}
      {showInterviewForm && (
        <InterviewForm
          onCloseModal={closeInterviewForm}
          applicationID={selectedApp}
          editMode={editMode}
          existingData={selectedInterview}
          status={status}
          fetchApplications={fetchApplications}
        />
      )}
      {showEditInterviewForm && (
        <InterviewForm
          onCloseModal={closeEditInterviewForm}
          applicationID={selectedApp}
          editMode={editMode}
          existingData={selectedInterview}
          status={status}
          fetchApplications={fetchApplications}
        />
      )}
      {showSuccessModal && (
        <SuccessfulModal
          onCloseModal={handleCloseModal}
          onCloseForm={() => {
            isClose();
          }}
          title={`User ${desc}`}
          desc={`This user has been successfully ${desc}. An update email will be sent to this user.`}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;
