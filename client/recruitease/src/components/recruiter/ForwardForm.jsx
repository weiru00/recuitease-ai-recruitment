import React, { useState, useEffect } from "react";
// import SuccessfulModal from "../SuccessfulModal";
import { useLocation } from "react-router-dom";
import {
  getFirestore,
  collection,
  getDoc,
  getDocs,
  query,
  where,
  doc,
} from "firebase/firestore";
import SuccessfulModal from "../SuccessfulModal";
import styles from "../../style";

const ForwardForm = ({ onCloseModal, applicationID }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get("uid");

  const db = getFirestore();

  const [managers, setManagers] = useState([]);
  const [managerID, setManagerID] = useState("");
  const [feedbackHR, setFeedbackHR] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showForwardForm, setShowForwardForm] = useState(true);

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    // setShowForwardForm(false);
  };

  const handleCloseForm = () => {
    setShowForwardForm(false);
  };

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userCompanyID = userDoc.data().companyID;

          const q = query(
            collection(db, "users"),
            where("companyID", "==", userCompanyID),
            where("role", "==", "manager")
          );

          const querySnapshot = await getDocs(q);
          const managers = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            f_name: doc.data().firstName,
            l_name: doc.data().lastName,
            email: doc.data().email,
          }));

          setManagers(managers);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };

    fetchManagers();
  }, [uid]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("applicationID", applicationID);
    formData.append("managerID", managerID);
    formData.append("feedbackHR", feedbackHR);

    try {
      const response = await fetch("/api/forward-application", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        onCloseModal;
        setShowSuccessModal(true);
        console.log("Application forwarded successfully");
      } else {
        console.error("Failed to forward application");
      }
    } catch (error) {
      console.error("Error forwarding data:", error);
    }
  };

  return (
    <React.Fragment>
      {/* Overlay */}
      {showForwardForm && (
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
                        Shortlist Candidate
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
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 mb-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="type"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Direct To
                          </label>
                          <select
                            id="manager"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                            value={managerID}
                            onChange={(e) => setManagerID(e.target.value)}
                            required={true}
                          >
                            <option defaultValue>Select a manager</option>
                            {managers.map((manager) => (
                              <option key={manager.id} value={manager.id}>
                                {manager.f_name} {manager.l_name}&#10; (
                                {manager.email})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2 mb-3">
                          <label
                            htmlFor="feedback"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Feedback
                          </label>
                          <textarea
                            id="feedback"
                            rows="6"
                            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                            placeholder="Write some notes about this candidate here"
                            value={feedbackHR}
                            onChange={(e) => setFeedbackHR(e.target.value)}
                          ></textarea>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {/* <Button text={mode} size="small" type="submit" /> */}
                        <button
                          type="submit"
                          className="inline-flex items-center text-white bg-purple-600 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-purple-500 dark:hover:bg-purple-600 dark:focus:ring-purple-900"
                        >
                          <svg
                            aria-hidden="true"
                            className="mr-1 -ml-1 w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
                            <path
                              fillRule="evenodd"
                              d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                          Forward
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <SuccessfulModal
          onCloseModal={handleCloseModal}
          onCloseForm={handleCloseForm}
          title={`Application Forwarded!`}
          desc={`The applicant has been successfully directed.`}
        />
      )}
    </React.Fragment>
  );
};

export default ForwardForm;
