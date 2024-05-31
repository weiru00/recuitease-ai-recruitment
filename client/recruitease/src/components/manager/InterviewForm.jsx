import React, { useState, useEffect } from "react";
// import SuccessfulModal from "../SuccessfulModal";
import SuccessfulModal from "../SuccessfulModal";
import { useLocation } from "react-router-dom";
import styles from "../../style";

const InterviewForm = ({ onCloseModal, applicationID }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get("uid");

  const [meetingLink, setMeetingLink] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [recipient, setRecipient] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("Interview");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleOpenModal = () => {
    setShowSuccessModal(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  const handlePreview = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/preview_email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        applicationID,
        status,
        meeting_link: meetingLink,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
      }),
    });
    const data = await response.json();
    setEmailContent(data.email_content);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const response = await fetch(`api/update-application-status?uid=${uid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        applicationID,
        status,
        meetingLink,
        meetingDate,
        meetingTime,
      }),
    });
    const data = await response.json();
    if (data.success) {
      onCloseModal;
      setShowSuccessModal(true);
      console.log("Interview Scheduled successfully");
    } else {
      console.error("Failed to schedule interview");
    }
    setMessage(data.message);
  };

  return (
    <React.Fragment>
      {/* Overlay */}
      <div>
        <div className="animation-fade-in fixed inset-0 bg-black bg-opacity-40 z-40"></div>

        <div
          tabIndex="-1"
          aria-hidden="true"
          className="font-body overflow-y-auto overflow-x-hidden fixed right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full"
          style={{ top: "2rem" }}
        >
          <div className={` ${styles.paddingX} ${styles.flexCenter}`}>
            <div className="xl:max-w-[1000px] w-8/12">
              <div>
                {/* <!-- Modal content --> */}
                <div className="animation-sliding-img-down-3 relative p-8 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-8">
                  {/* <!-- Modal header --> */}
                  <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Schedule Interview
                    </h3>
                    <button
                      onClick={onCloseModal}
                      className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                      data-modal-toggle="defaultModal"
                    >
                      <svg
                        aria-hidden="true"
                        className="w-5 h-5"
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
                      <span className="sr-only">Close modal</span>
                    </button>
                  </div>
                  {/* <!-- Modal body --> */}
                  <form onSubmit={handlePreview}>
                    {status === "Interview" && (
                      <>
                        <div className="grid gap-4 mb-4 grid-cols-2">
                          <div className="col-span-2">
                            <label
                              htmlFor="meetingLink"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Meeting Link
                            </label>
                            <input
                              type="text"
                              id="meetingLink"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5"
                              placeholder="E.g: Google Meet Link, Microsoft Teams etc."
                              required={true}
                              value={meetingLink}
                              onChange={(e) => setMeetingLink(e.target.value)}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="meetingDate"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Meeting Date
                            </label>
                            <input
                              type="date"
                              id="meetingDate"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5"
                              value={meetingDate}
                              onChange={(e) => setMeetingDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="meetingTime"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Meeting Time
                            </label>
                            <input
                              type="time"
                              id="meetingTime"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5"
                              value={meetingTime}
                              onChange={(e) => setMeetingTime(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <button
                            type="submit"
                            className="my-2 inline-flex items-center text-gray-600 bg-gray-100 border-2 border-gray-300 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-xl text-sm px-4 py-2.5 text-center dark:bg-purple-500 dark:hover:bg-purple-600 dark:focus:ring-purple-900"
                          >
                            Email Preview
                            <svg
                              className="w-5 h-5 text-gray-600 ml-2 dark:text-white"
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
                                d="M12 19V5m0 14-4-4m4 4 4-4"
                              />
                            </svg>
                          </button>
                          {/* <form onSubmit={handleSend}>
                            <button
                              type="submit"
                              className="my-2 inline-flex items-center text-white bg-purple-600 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-xl text-sm px-4 py-2.5 text-center dark:bg-purple-500 dark:hover:bg-purple-600 dark:focus:ring-purple-900"
                            >
                              <svg
                                className="w-5 h-5 text-white me-2 dark:text-white"
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
                              Send Email
                            </button>
                          </form> */}
                        </div>
                      </>
                    )}
                  </form>
                  {emailContent && (
                    <div>
                      <h2 className="text-purple-700 font-semibold px-2 py-2">
                        Email Preview
                      </h2>
                      <div>
                        <div
                          className=" bg-purple-50 border-2 p-2 rounded-xl border-purple-100 email-preview"
                          dangerouslySetInnerHTML={{ __html: emailContent }}
                        />
                        <form onSubmit={handleSend}>
                          <button
                            type="submit"
                            className="my-3 inline-flex items-center text-white bg-purple-600 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-xl text-sm px-4 py-2.5 text-center dark:bg-purple-500 dark:hover:bg-purple-600 dark:focus:ring-purple-900"
                          >
                            <svg
                              className="w-5 h-5 text-white me-2 dark:text-white"
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
                            Send Email
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                  {/* {message && <p>{message}</p>} */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <SuccessfulModal
          onCloseModal={handleCloseModal}
          onCloseForm={onCloseModal}
          title={`Email Sent`}
          desc={`The email is sent with interview details.`}
        />
      )}
    </React.Fragment>
  );
};

export default InterviewForm;
