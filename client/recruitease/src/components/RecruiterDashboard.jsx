import React from "react";
import "flowbite";
import { useState, useEffect } from "react";
import DashNavbar from "./DashNavbar";
import Sidebar from "./Sidebar";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const RecruiterDashboard = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate("/login");
      }
    });

    // Clean up the observer when the component unmounts.
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      fetch(`/api/user-data?uid=${userId}`)
        .then((response) => response.json())
        .then((data) => {
          setUserData(data);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [userId]);

  if (!userData) {
    return (
      <div class="text-center">
        <div role="status">
          <svg
            aria-hidden="true"
            class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="antialiased bg-gray-50 dark:bg-gray-900">
      <DashNavbar />

      <Sidebar />

      <main className="p-4 md:ml-72 md:mr-24 sm:ml-48 sm:mr-24 h-auto pt-14">
        <div className="flex justify-between border-2 rounded-lg border-gray-100 bg-white dark:border-gray-600 h-auto mb-4 mx-6 px-8 py-6">
          <div className="flex items-center">
            <h5 className="text-xl font-bold dark:text-white">
              Welcome Back, {userId}
            </h5>
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

const getCurrentUserId = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    return user.uid;
  } else {
    return null;
  }
};

export default RecruiterDashboard;
