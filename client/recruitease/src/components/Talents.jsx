import React from "react";
import DashNavbar from "./DashNavbar";
import Sidebar from "./Sidebar";

const Talents = () => {
  return (
    <div className="antialiased bg-white dark:bg-gray-900">
      <DashNavbar />

      <Sidebar />
      <main className="p-2 md:px-10 md:ml-72 md:mr-24 sm:ml-48 sm:mr-24 h-auto pt-14">
        <div className="flex justify-between border-2 rounded-lg border-gray-100 bg-white dark:border-gray-600 h-auto mb-4 mx-6 px-5 py-4">
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
        </div>
        {/* Top Talents */}
        <div className="grid grid-cols-1 justify-between border-2 rounded-lg border-gray-100 bg-white dark:border-gray-600 h-auto mb-4 mx-6 px-5 py-4">
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
          <div href="#" className="col-span-4 overflow-auto">
            {/* {jobs.map((job) => ( */}
            <div
              // key={job.id}
              className="col-span-1 border-2 rounded-lg border-gray-100 bg-white dark:border-gray-600 hover:border-purple-400 h-auto min-h-20 mt-4"
              // onClick={() => openUpdateForm(job)}
            >
              <div className="grid grid-cols-10 bg-white border border-gray-100 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                <div className="col-span-2 grid justify-items-center content-center">
                  <img
                    className="mx-auto mb-2 w-14 h-14 rounded-full border-4 border-purple-600"
                    src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/bonnie-green.png"
                    alt="Bonnie Avatar"
                  ></img>
                </div>
                <div className="px-2 py-3 col-span-6">
                  <a href="#">
                    <h5 className="mb-1 text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                      {/* {job.title} */}
                      Jennie Law
                    </h5>
                  </a>

                  <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                    <li>
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium me-5 px-2 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                        Data Engineer
                      </span>

                      <p className="inline-block pr-8 py-2 text-xs">
                        8/12/2023
                      </p>
                    </li>
                  </ul>
                </div>
                <div className="col-span-2 grid justify-items-center content-center">
                  <span className="bg-purple-100 text-purple-600 text-md font-bold me-2 px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
                    90%
                  </span>
                </div>
              </div>
            </div>
            {/* ))} */}
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
          <div href="#" className="col-span-4 overflow-auto">
            {/* {jobs.map((job) => ( */}
            <div
              // key={job.id}
              className="col-span-1 border-2 rounded-lg border-gray-100 bg-white dark:border-gray-600 hover:border-purple-400 h-auto min-h-20 mt-4"
              // onClick={() => openUpdateForm(job)}
            >
              <div className="grid grid-cols-10 bg-white border border-gray-100 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                <div className="col-span-2 grid justify-items-center content-center">
                  <img
                    className="mx-auto mb-2 w-14 h-14 rounded-full border-4 border-purple-600"
                    src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/bonnie-green.png"
                    alt="Bonnie Avatar"
                  ></img>
                </div>
                <div className="px-2 py-3 col-span-6">
                  <a href="#">
                    <h5 className="mb-1 text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                      {/* {job.title} */}
                      Jennie Law
                    </h5>
                  </a>

                  <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                    <li>
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium me-5 px-2 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                        Data Engineer
                      </span>

                      <p className="inline-block pr-8 py-2 text-xs">
                        8/12/2023
                      </p>
                    </li>
                  </ul>
                </div>
                <div className="col-span-2 grid justify-items-center content-center">
                  <span className="bg-purple-100 text-purple-600 text-md font-bold me-2 px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
                    60%
                  </span>
                </div>
              </div>
            </div>
            {/* ))} */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Talents;
