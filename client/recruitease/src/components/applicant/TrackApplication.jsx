import React from "react";
import { useState, useEffect } from "react";
import DashNavbar from "../DashNavbar";
import ApplicantSidebar from "./ApplicantSidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { track } from "../../assets";
import styles from "../../style";
import "flowbite";

const TrackApplication = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get("uid");
  const role = queryParams.get("role");

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/track-applications?uid=${uid}&role=${role}`
        );
        if (!response.ok) {
          throw new Error("Something went wrong!");
        }
        const data = await response.json();
        setApplications(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (uid) {
      fetchApplications();
    }
  }, [uid]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="antialiased bg-white dark:bg-gray-900">
      <DashNavbar />

      <ApplicantSidebar />

      <main className="p-4 md:ml-72 md:mr-24 sm:ml-48 sm:mr-24 h-auto pt-14">
        <div className="flex justify-between border-2 rounded-lg border-gray-100 bg-[url('assets/bg.png')] dark:border-gray-600 h-48 mb-4 mx-6 px-10 py-6 z-40">
          <div className="items-center ">
            <h5 className="text-2xl font-bold dark:text-white mb-9 mt-3">
              My Applications
            </h5>
            <div>
              <span
                id="badge-dismiss-purple"
                className="inline-flex items-centerpy-1 me-2 text-md font-medium text-gray-500 bg-purple-100 rounded dark:bg-purple-900 dark:text-purple-300"
              >
                View and track all the jobs you have applied for! 🗃️
              </span>
            </div>
          </div>
          <img className="flex z-[5] h-60" src={track}></img>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-8 mb-6 mx-6">
          <div className="border-2 rounded-lg border-gray-100 dark:border-gray-600 h-auto">
            {applications.length > 0 ? (
              applications.map((application) => (
                <div id="accordion-collapse" data-accordion="collapse">
                  <h2 id="accordion-collapse-heading-1">
                    <button
                      type="button"
                      class="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                      data-accordion-target="#accordion-collapse-body-1"
                      aria-expanded="true"
                      aria-controls="accordion-collapse-body-1"
                    >
                      <span>{application.companyName}</span>
                      <svg
                        data-accordion-icon
                        class="w-3 h-3 rotate-180 shrink-0"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 5 5 1 1 5"
                        />
                      </svg>
                    </button>
                  </h2>
                  <div
                    id="accordion-collapse-body-1"
                    class="hidden"
                    aria-labelledby="accordion-collapse-heading-1"
                  >
                    <div class="p-5 border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                      <p class="mb-2 text-gray-500 dark:text-gray-400">
                        Flowbite is an open-source library of interactive
                        components built on top of Tailwind CSS including
                        buttons, dropdowns, modals, navbars, and more.
                      </p>
                      <p class="text-gray-500 dark:text-gray-400">
                        Check out this guide to learn how to{" "}
                        <a
                          href="/docs/getting-started/introduction/"
                          class="text-blue-600 dark:text-blue-500 hover:underline"
                        >
                          get started
                        </a>{" "}
                        and start developing websites even faster with
                        components on top of Tailwind CSS.
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No applications found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrackApplication;
