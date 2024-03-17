import React, { useState } from "react";
import Button from "./Button";
import styles from "../style";

const JobForm = ({ isOpen, isClose }) => {
  if (!isOpen) return null;

  const initialState = {
    title: "",
    desc: "",
    type: "",
    qualitifcation: "",
    recruiterID: "",
    postedAt: "",
  };

  const [job, setJob] = useState(initialState);

  const handleSubmit = (event) => {
    event.preventDefault();

    const jobData = {
      title: job.title,
      desc: job.desc,
      type: job.type,
      qualitifcation: job.qualitifcation,
      recruiterID: job.recruiterID,
      postedAt: job.postedAt,
    };

    fetch("/api/create-job", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Job Created Successfully!");
          // Reset form
          setJob(initialState);
        } else {
          alert("Failed to Create Job: " + data.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  return (
    <React.Fragment>
      {/* Overlay */}
      <div className="animation-fade-in fixed inset-0 bg-black bg-opacity-40 z-40"></div>
      <div
        tabIndex="-1"
        aria-hidden="true"
        className="overflow-y-auto overflow-x-hidden fixed right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full"
        style={{ top: "5rem" }}
      >
        <div className={` ${styles.paddingX} ${styles.flexCenter}`}>
          <div className="xl:max-w-[1000px] w-8/12">
            <div>
              {/* <!-- Modal content --> */}
              <div className="animation-sliding-img-down-3 relative p-8 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-8">
                {/* <!-- Modal header --> */}
                <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Add New Job
                  </h3>
                  <button
                    onClick={isClose}
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
                        htmlFor="title"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Job Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                        placeholder="E.g: Software Engineer"
                        required={true}
                        value={job.title}
                        onChange={(e) =>
                          setJob({ ...job, title: e.target.value })
                        }
                      ></input>
                    </div>
                    <div>
                      <label
                        htmlFor="qualification"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Qualification
                      </label>
                      <input
                        type="text"
                        name="qualification"
                        id="qualification"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                        placeholder="E.g: 2 years experience"
                        required=""
                        value={job.qualitifcation}
                        onChange={(e) =>
                          setJob({ ...job, qualitifcation: e.target.value })
                        }
                      ></input>
                    </div>
                    <div>
                      <label
                        htmlFor="salary"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Salary Range
                      </label>
                      <input
                        type="number"
                        name="salary"
                        id="salary"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                        placeholder="$2999"
                        required=""
                      ></input>
                    </div>
                    <div>
                      <label
                        htmlFor="type"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Type
                      </label>
                      <select
                        id="type"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                        value={job.type}
                        onChange={(e) =>
                          setJob({ ...job, type: e.target.value })
                        }
                      >
                        <option defaultValue="">Select Job Type</option>
                        <option value="Full-Time">Full-Time</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 mb-3">
                      <label
                        htmlFor="description"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        rows="4"
                        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                        placeholder="Write job description here"
                        value={job.desc}
                        onChange={(e) =>
                          setJob({ ...job, desc: e.target.value })
                        }
                      ></textarea>
                    </div>
                  </div>
                  <Button text="Create Job" size="small" type="submit" />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default JobForm;
