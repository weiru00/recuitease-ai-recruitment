import React from "react";
import "flowbite";
import { useState, useEffect } from "react";
import DashNavbar from "../DashNavbar";
import Sidebar from "./Sidebar";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { dashboard } from "../../assets";
import FunnelChart from "../charts/FunnelChart";
import PieChart from "../charts/PieChart";
import DonutChart from "../charts/DonutChart";

const RecruiterDashboard = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const recruiterID = queryParams.get("uid");

  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [raceData, setRaceData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [statusData, setStatusData] = useState([]);

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
    // Fetch data from backend
    fetch(`/api/get-applications?recruiterID=${recruiterID}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const raceChartData = data.raceCounts.map((raceCount) => ({
            name: raceCount.race,
            data: raceCount.count,
          }));

          const genderChartData = data.genderCounts.map((genderCount) => ({
            name: genderCount.gender,
            data: genderCount.count,
          }));

          const statusChartData = data.statusCounts
            .filter((statusCount) => statusCount.status !== "Reject")
            .map((statusCount) => ({
              name: statusCount.status,
              data: statusCount.count,
            }));

          setRaceData(raceChartData);
          setGenderData(genderChartData);
          setStatusData(statusChartData);
        } else {
          console.error("Failed to fetch application data:", data.error);
        }
      })
      .catch((error) =>
        console.error("Error fetching application data:", error)
      );
  }, [recruiterID]);

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
      <div className="text-center">
        <div role="status">
          <svg
            aria-hidden="true"
            className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }
  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="antialiased bg-white dark:bg-gray-900 font-body">
      {/* <DashNavbar /> */}

      <Sidebar />

      <main className="p-4 md:ml-72 md:mr-24 sm:ml-48 sm:mr-24 h-auto pt-14">
        <div className="flex justify-between border-2 rounded-lg border-gray-100 bg-[url('assets/bg.png')] dark:border-gray-600 h-48 mb-4 mx-6 px-10 py-6 z-40">
          <div className="items-center ">
            <h5 className="text-2xl font-bold dark:text-white mb-6 mt-3">
              Welcome Back, {userData.firstName}
            </h5>
            <div>
              <span
                id="badge-dismiss-purple"
                className="inline-flex items-centerpy-1 me-2 text-md font-medium text-purple-800 bg-purple-100 rounded dark:bg-purple-900 dark:text-purple-300"
              >
                Land your dream job! ✨
              </span>
            </div>
          </div>
          <img className="flex z-[5] h-60" src={dashboard}></img>
        </div>
        <div className="bg-white border-2 border-gray-100 rounded-lg dark:bg-gray-600 h-auto px-10 py-6 mb-6 mx-6">
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
        <div className="grid grid-cols-3 gap-6 mb-6 mx-6">
          <div className="col-span-1 border-2 rounded-lg border-gray-100 dark:border-gray-600 h-48 md:h-72">
            {/* <h1>My Sales Data</h1> */}
            {/* <BarChart /> */}
            <DonutChart
              title="Gender Distribution"
              chartData={genderData}
              // labels={raceData.name}
            />
          </div>
          <div className="border-2 rounded-lg border-gray-100 dark:border-gray-600 h-48 md:h-72">
            <FunnelChart
              title="Application Distribution"
              chartData={statusData}
            />
          </div>
          <div className="border-2 rounded-lg border-gray-100 dark:border-gray-600 h-48 md:h-72">
            <PieChart
              title="Race Distribution"
              chartData={raceData}
              // labels={raceData.name}
            />
          </div>
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
