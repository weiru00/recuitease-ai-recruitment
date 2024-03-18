import React from "react";
import "flowbite";
import { useState, useEffect } from "react";
import DashNavbar from "./DashNavbar";
import Sidebar from "./Sidebar";
import { Link } from "react-router-dom";

import Button from "./Button";

const Dashboard = () => {
  return (
    <div className="antialiased bg-gray-50 dark:bg-gray-900">
      <DashNavbar />

      <Sidebar />

      <main className="p-4 md:ml-72 md:mr-24 sm:ml-48 sm:mr-24 h-auto pt-14">
        <div className="flex justify-between border-2 rounded-lg border-gray-100 bg-white dark:border-gray-600 h-auto mb-4 mx-6 px-8 py-6">
          <div className="flex items-center">
            <h5 className="text-xl font-bold dark:text-white">Welcome Back!</h5>
          </div>
          <div>
            <span
              id="badge-dismiss-purple"
              className="inline-flex items-center px-2 py-1 me-2 text-sm font-medium text-purple-800 bg-purple-100 rounded dark:bg-purple-900 dark:text-purple-300"
            >
              Great Hiring Day!
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
        </div>
        <div className="bg-white rounded-lg dark:bg-gray-600 h-auto px-10 py-6 mb-6 mx-6">
          <div className="flex items-center">
            <h5 className="text-xl font-bold dark:text-white">Your Stats</h5>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-6 mb-6 mt-4">
            <div className="border-2 border-gray-100 rounded-lg dark:border-gray-600 h-auto p-5">
              <div className="flex flex-col items-center justify-center">
                <dt className="mb-2 text-3xl md:text-4xl font-extrabold">2</dt>
                <dd className="font-medium text-gray-500 dark:text-gray-400">
                  Active Jobs
                </dd>
                <Link
                  to="/talents"
                  className="inline-flex items-center justify-center text-center bg-white text-purple-600 text-md font-medium w-1/2 mt-5 me-2 px-2.5 py-1 rounded-md dark:bg-gray-700 dark:text-purple-400 border-2 border-purple-600 hover:bg-purple-500 hover:text-white group"
                >
                  <svg
                    className="w-6 h-6 me-2 text-purple-600 group-hover:text-white"
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
                  Edit Status
                </Link>
              </div>
            </div>
            <div className="border-2 border-gray-100 rounded-lg dark:border-gray-600 h-auto p-5">
              <div className="flex flex-col items-center justify-center">
                <dt className="mb-2 text-3xl md:text-4xl font-extrabold">2</dt>
                <dd className="font-medium text-gray-500 dark:text-gray-400">
                  Total Jobs Posted
                </dd>

                <Link
                  to="/jobpostings"
                  className="inline-flex items-center justify-center text-center bg-white text-purple-600 text-md font-medium w-1/2 mt-5 me-2 px-2.5 py-1 rounded-md dark:bg-gray-700 dark:text-purple-400 border-2 border-purple-600 hover:bg-purple-500 hover:text-white group"
                >
                  <svg
                    className="w-6 h-6 me-2 text-purple-600 group-hover:text-white"
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
                      d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778"
                    />
                  </svg>
                  Manage Jobs
                </Link>
              </div>
            </div>
            <div className="border-2 border-gray-100 rounded-lg dark:border-gray-600 h-auto p-5">
              <div className="flex flex-col items-center justify-center">
                <dt className="mb-2 text-3xl md:text-4xl font-extrabold">2</dt>
                <dd className="font-medium text-gray-500 dark:text-gray-400">
                  Hires Made
                </dd>
                <Link
                  to="/talents"
                  className="inline-flex items-center justify-center text-center bg-white text-purple-600 text-md font-medium w-1/2 mt-5 me-2 px-2.5 py-1 rounded-md dark:bg-gray-700 dark:text-purple-400 border-2 border-purple-600 hover:bg-purple-500 hover:text-white group"
                >
                  <svg
                    className="w-6 h-6 me-2 text-purple-600 group-hover:text-white"
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
                      d="M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2m-2.236-4a3 3 0 1 0 0-4M3 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                  Find Talents
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 mb-6 mx-6">
          <div className="border-2 rounded-lg border-gray-100 dark:border-gray-600 h-48 md:h-72"></div>
          <div className="border-2 rounded-lg border-gray-100 dark:border-gray-600 h-48 md:h-72"></div>
          <div className="border-2 rounded-lg border-gray-100 dark:border-gray-600 h-48 md:h-72"></div>
          <div className="border-2 rounded-lg border-gray-100 dark:border-gray-600 h-48 md:h-72"></div>
        </div>
        <div className="border-2 rounded-lg border-gray-100 dark:border-gray-600 h-96 mb-6 mx-6"></div>
        <div className="grid grid-cols-2 gap-6 mx-6">
          <div className="border-2 rounded-lg border-gray-100 dark:border-gray-600 h-48 md:h-72"></div>
          <div className="border-2 rounded-lg border-gray-100 dark:border-gray-600 h-48 md:h-72"></div>
          <div className="border-2 rounded-lg border-gray-100 dark:border-gray-600 h-48 md:h-72"></div>
          <div className="border-2 rounded-lg border-gray-100 dark:border-gray-600 h-48 md:h-72"></div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
