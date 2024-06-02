import React from "react";
import "flowbite";
import { useState, useEffect } from "react";
import DashNavbar from "../DashNavbar";
import Sidebar from "./Sidebar";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { appliedjob } from "../../assets";
import FunnelChart from "../charts/FunnelChart";
import PieChart from "../charts/PieChart";
import DonutChart from "../charts/DonutChart";
import BarChart from "../charts/BarChart";
import RadialChart from "../charts/RadialChart";

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
  const [jobsCounts, setJobsCounts] = useState([]);
  const [hiresCounts, setHiresCounts] = useState([]);
  const [applicantsCounts, setApplicantsCounts] = useState([]);

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
          setJobsCounts(data.jobsCounts);
          setHiresCounts(data.hiresCounts);
          setApplicantsCounts(data.applicantsCounts);
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
    <div className="antialiased bg-gray-50 dark:bg-gray-900 font-body">
      {/* <DashNavbar /> */}

      <Sidebar />

      <main className="p-4 md:ml-72 md:mr-24 sm:ml-48 sm:mr-24 h-auto pt-14">
        {/* <div className="flex justify-between border-2 rounded-lg border-gray-100 bg-[url('assets/bg.png')]  h-48 mb-4 mx-6 px-10 py-6 z-40">
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
        </div> */}
        <div className="mb-6 mx-6">
          <h5 className="text-2xl font-semibold text-gray-500">
            {/* Welcome Back,{" "} */}
            <span className="text-purple-700 font-semibold">Dashboard</span>
          </h5>
        </div>
        {/* <div className="bg-white border-2 border-gray-100 rounded-2xl dark:bg-gray-600 h-auto px-10 py-6 mb-6 mx-6 mt-4"> */}
        {/* <div className="flex items-center">
            <h5 className="text-xl font-semibold dark:text-white">
              Your Stats
            </h5>
          </div> */}
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-6 mb-6 mx-6 mt-4">
          <div className="flex justify-between border-2 bg-white border-gray-100 rounded-2xl  h-auto py-5 px-6">
            <div className="flex flex-col items-left justify-center px-3">
              <dt className="mb-2 text-4xl md:text-4xl font-bold text-purple-700">
                {jobsCounts}
              </dt>
              <dd className="font-medium text-gray-400 dark:text-gray-400">
                Jobs Posted
              </dd>
            </div>
            <img src={appliedjob} alt="job icon" />
          </div>
          <div className="flex justify-between border-2 bg-white border-gray-100 rounded-2xl  h-auto py-5 px-6">
            <div className="flex flex-col items-left justify-center px-3">
              <dt className="mb-2 text-4xl md:text-4xl font-bold text-purple-700">
                {hiresCounts}
              </dt>
              <dd className="font-medium text-gray-400 dark:text-gray-400">
                Hires Made
              </dd>
            </div>
            <img src={appliedjob} alt="job icon" />
          </div>
          <div className="flex justify-between border-2 bg-white border-gray-100 rounded-2xl  h-auto py-5 px-6">
            <div className="flex flex-col items-left justify-center px-3">
              <dt className="mb-2 text-4xl md:text-4xl font-bold text-purple-700">
                {applicantsCounts}
              </dt>
              <dd className="font-medium text-gray-400 dark:text-gray-400">
                Total Applicants
              </dd>
            </div>
            <img src={appliedjob} alt="job icon" />
          </div>
        </div>
        <div className="grid grid-cols-5 grid-rows-4 gap-6 mb-6 mx-6">
          <div className="col-span-3 row-span-4 border-2 rounded-lg border-gray-100 dark:border-gray-600 h-auto">
            <BarChart title="Application Distribution" chartData={statusData} />
            {/* <BarChart chartData={statusData} /> */}
          </div>
          {/* <div className="col-span-1 border-2 rounded-lg border-gray-100 dark:border-gray-600 h-auto"></div> */}
          <div className="col-span-2 row-span-2 border-2 rounded-lg border-gray-100 dark:border-gray-600 h-auto">
            {/* <h1>My Sales Data</h1> */}
            {/* <BarChart /> */}
            <DonutChart
              title="Gender Distribution"
              chartData={genderData}
              // labels={raceData.name}
            />
          </div>

          <div className="col-span-2 row-span-2 border-2 rounded-lg border-gray-100 dark:border-gray-600 h-auto">
            <PieChart
              title="Race Distribution"
              chartData={raceData}
              // labels={raceData.name}
            />
          </div>
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
