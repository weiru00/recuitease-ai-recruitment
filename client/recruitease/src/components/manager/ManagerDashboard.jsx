import React from "react";
import { useState, useEffect } from "react";
import Sidebar from "../admin/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { appliedjob, option, user } from "../../assets";
import StatusModal from "../StatusModal";
import { Tooltip } from "react-tooltip";
import DeletionModal from "../DeletionModal";
import SuccessfulModal from "../SuccessfulModal";
import NoResult from "../NoResult";
import InterviewForm from "./InterviewForm";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get("uid");

  const [applicationID, setApplicationID] = useState(null);
  const [applications, setApplications] = useState([]);
  // const [numberOfManagers, setNumberOfManagers] = useState(0);
  // const [numberOfHRs, setNumberOfHRs] = useState(0);
  const [selectedApp, setSelectedApp] = useState([]);
  const [status, setStatus] = useState([]);
  const [desc, setDesc] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const closeStatusModal = () => setShowStatusModal(false);

  const openStatusModal = (applicationID, newStatus) => {
    setShowStatusModal(true);
    setSelectedApp(applicationID);
    setStatus(newStatus);
  };

  const openInterviewForm = (applicationID) => {
    setShowInterviewForm(true);
    setSelectedApp(applicationID);
  };

  const closeInterviewForm = () => setShowInterviewForm(false);

  const openSuccessModal = (desc) => {
    setShowSuccessModal(true);
    setDesc(desc);
  };

  // const handleConfirmDelete = async () => {
  //   closeDeleteModal();
  //   handleDeleteUser();
  //   openSuccessModal("deleted");
  // };

  const handleConfirmStatus = async () => {
    closeStatusModal();
    handleUpdateStatus(selectedApp, status);
    openSuccessModal("updated");
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

  // useEffect(() => {
  //   const auth = getAuth();
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       setApplicationID(user.uid);
  //     } else {
  //       navigate("/login");
  //     }
  //   });

  //   return () => unsubscribe();
  // }, [navigate]);

  useEffect(() => {
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

    fetchApplications();
  }, [uid]);

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
      if (response.ok) {
        // fetchUsers(); // Refresh user list upon successful update
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

  const pendingApps = applications.filter((app) => app.status === "Forwarded");

  const hiredApps = applications.filter((app) => app.status === "Onboard");

  const interviewApps = applications.filter(
    (app) => app.status === "Interview"
  );

  // const approvedUsers = filteredUsers.filter(
  //   (newuser) => newuser.register_status === "approved" && newuser.uid !== uid
  // );

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
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-6 mb-6 mx-6 mt-4">
          <div className="flex justify-between border-2 border-gray-100 rounded-2xl dark:border-gray-600 h-auto py-5 px-6">
            <div className="flex flex-col items-left justify-center px-3">
              <dt className="mb-2 text-4xl md:text-4xl font-bold text-purple-700">
                {/* {numberOfManagers} */}
              </dt>
              <dd className="font-medium text-gray-400 dark:text-gray-400">
                Managers
              </dd>
            </div>
            <img src={appliedjob} alt="job icon" />
          </div>
          <div className="flex justify-between border-2 border-gray-100 rounded-2xl dark:border-gray-600 h-auto py-5 px-6">
            <div className="flex flex-col items-left justify-center px-3">
              <dt className="mb-2 text-4xl md:text-4xl font-bold text-purple-700">
                {/* {numberOfHRs} */}
              </dt>
              <dd className="font-medium text-gray-400 dark:text-gray-400">
                HR/Recruiters
              </dd>
            </div>
            <img src={appliedjob} alt="job icon" />
          </div>
          <div className="flex justify-between border-2 border-gray-100 rounded-2xl dark:border-gray-600 h-auto py-5 px-6">
            <div className="flex flex-col items-left justify-center px-3">
              <dt className="mb-2 text-4xl md:text-4xl font-bold text-purple-700">
                {/* {approvedUsers.length} */}
              </dt>
              <dd className="font-medium text-gray-400 dark:text-gray-400">
                Total Users
              </dd>
            </div>
            <img src={appliedjob} alt="job icon" />
          </div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-1 lg:grid-cols-4 gap-6 mb-6 mx-6 mt-4">
          {/* <div className="col-span-4 justify-between border-2 border-gray-100 rounded-2xl h-auto py-4 px-6">
            <h5 className="text-md font-medium text-purple-700 px-3 py-1.5 rounded-lg bg-purple-50">
              Applicants
            </h5>

            <div className="flex flex-col items-left justify-center px-1">
              <ul role="list" className="divide-y divide-purple-100">
                {applications.length > 0 ? (
                  applications.map((app) => (
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
                                app.resume
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
              </ul>
            </div>
          </div> */}
          {/* <div className="justify-center border-gray-100 rounded-2xl max-h-48 z-50">
            <img src={dashboard2} alt="job icon" className="z-40" />
          </div> */}

          {/* Pending Applicants */}
          <div className="col-span-4 border-2 border-gray-100 rounded-2xl h-auto p-4">
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
                                        app.applicationID
                                        // "Interview"
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
                                        "Onboard"
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
                                    Hire
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

          {/* Interview applicants */}
          <div className="col-span-2 border-2 border-gray-100 rounded-2xl h-auto p-4">
            <div className="flex justify-between mb-4">
              <h5 className="pl-3 text-purple-700 font-semibold text-lg content-center">
                Pending Interviews ({interviewApps.length})
              </h5>
            </div>

            <div className="relative">
              <table className="w-full text-sm text-left text-gray-500 rounded-xl">
                {interviewApps.length > 0 ? (
                  interviewApps.map((app) => (
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
                                      openInterviewForm(app.applicationID)
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
                                        "Onboard"
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
                                    Hire
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

          {/* Hired Applicants */}
          <div className="col-span-2 border-2 border-gray-100 rounded-2xl h-auto p-4">
            <div className="flex justify-between mb-4">
              <h5 className="pl-3 text-purple-700 font-semibold text-lg content-center">
                Hires ({hiredApps.length})
              </h5>
            </div>

            <div className="flex flex-col items-left justify-center px-3">
              <ul role="list" className="divide-y divide-purple-200">
                {hiredApps.length > 0 ? (
                  hiredApps.map((app) => (
                    <li
                      key={app.applicationID}
                      className="flex justify-between gap-x-6 py-4"
                    >
                      <div className="flex min-w-0 gap-x-4">
                        <img
                          className="h-12 w-12 flex-none rounded-full bg-gray-50"
                          src={app.applicantPic || user}
                          alt="Profile Picture"
                        />
                        <div className="min-w-0 flex-auto">
                          <p className="text-md font-semibold leading-6 text-gray-900">
                            {app.applicantFName} {app.applicantLName}
                          </p>
                          <p className="mt-1 truncate text-sm leading-5 text-gray-500">
                            {app.email} | {app.jobTitle}
                          </p>
                        </div>
                      </div>
                      <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                        <div className="mt-1 flex items-center gap-x-1.5">
                          <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          </div>
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
                          <Tooltip id="resume-tooltip" />
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <NoResult desc={"No pending users"} />
                )}
              </ul>
            </div>

            {/* <div className="relative">
              <table className="w-full text-sm text-left text-gray-500 rounded-xl">
                {hiredApps.length > 0 ? (
                  hiredApps.map((app) => (
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
                        <td className="py-4 px-4 text-purple-500 text-md font-bold me-2">
                          {app.score}%
                        </td>
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
                      </tr>
                    </tbody>
                  ))
                ) : (
                  <NoResult desc={"No user"} />
                )}
              </table>
            </div> */}
          </div>
        </div>
      </main>
      {showStatusModal && (
        <StatusModal
          onCloseModal={closeStatusModal}
          onConfirm={handleConfirmStatus}
          status={status}
        />
      )}
      {showInterviewForm && (
        <InterviewForm
          onCloseModal={closeInterviewForm}
          applicationID={selectedApp}
          // onConfirm={handleConfirmDelete}
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
