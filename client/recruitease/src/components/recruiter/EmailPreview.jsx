import React, { useState } from "react";

const EmailPreview = ({
  //   isOpen,
  onClose,
  onSendEmail,
  emailContent,
  subject,
  applicantEmail,
}) => {
  const [meetingLink, setMeetingLink] = useState("");

  const handleSendEmail = () => {
    onSendEmail(meetingLink);
  };

  const handleAttachmentChange = (event) => {
    setAttachments(event.target.files);
  };

  return (
    <div>
      <div
        className="font-body animation-sliding-img-down-3 fixed inset-0 bg-gray-600 bg-opacity-50 z-[60] overflow-y-auto h-full w-full"
        id="my-modal"
      >
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl bg-white">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-xl text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            data-modal-toggle="successModal"
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
          <form onSubmit={handleSendEmail}>
            <h2>Email Preview</h2>
            <p>
              <strong>To:</strong> {applicantEmail}
            </p>
            <p>
              <strong>Subject:</strong> {subject}
            </p>
            <div dangerouslySetInnerHTML={{ __html: emailContent }}></div>
            <label>
              Meeting Link:
              <input
                type="text"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </label>
            <div>
              <label>Attachments:</label>
              <input type="file" multiple onChange={handleAttachmentChange} />
            </div>
            <button
              className="py-2 px-4 text-sm font-medium text-center text-white bg-purple-600 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 rounded-xl"
              type="submit"
            >
              Send Email
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </form>
          {/* <div className="flex justify-center items-center space-x-4">
          <button
            data-modal-toggle="deleteModal"
            type="button"
            onClick={onClose}
            className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-xl border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
          >
            No, cancel
          </button>
          <button
            type="submit"
            onClick={onConfirm}
            className="py-2 px-4 text-sm font-medium text-center text-white bg-purple-600 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 rounded-xl"
          >
            Yes
          </button>
        </div> */}
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;
