import React from "react";
import { useState, useEffect } from "react";
import Button from "../Button";
import Sidebar from "./Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { appliedjob, dashboard, user } from "../../assets";

const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get("uid");

  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate("/login");
      }
    });

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

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/get-company-users?uid=${uid}`);
      const data = await response.json();
      if (response.ok) {
        console.log(data);
        setUsers(data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [uid]);

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      const response = await fetch("/api/approve_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: userId, status: newStatus }),
      });
      const data = await response.json();
      if (response.ok) {
        fetchUsers(); // Refresh user list upon successful update
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Failed to update user status:", error.message);
    }
  };

  const handleDeleteUser = async (uid) => {
    try {
      const response = await fetch(`/api/delete-user?uid=${uid}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        fetchUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Failed to delete user:", error.message);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.firstName &&
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName &&
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email &&
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.position &&
        user.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  return (
    <div className="font-body antialiased bg-white dark:bg-gray-900">
      <Sidebar />

      <main className="p-4 md:ml-72 md:mr-24 sm:ml-48 sm:mr-24 h-auto pt-14">
        <div className="mb-6 mx-6">
          <h5 className="text-2xl font-semibold text-gray-500">
            <span className="text-purple-700 font-semibold">Dashboard</span>
          </h5>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-6 mb-6 mx-6 mt-4">
          <div className="flex justify-between border-2 border-gray-100 rounded-2xl dark:border-gray-600 h-auto py-5 px-6">
            <div className="flex flex-col items-left justify-center px-3">
              <dt className="mb-2 text-4xl md:text-4xl font-bold text-purple-700">
                {userData.number_of_applications}
              </dt>
              <dd className="font-medium text-gray-400 dark:text-gray-400">
                Managers
              </dd>
            </div>
            <img src={appliedjob} alt="job icon" />
          </div>
          <div className="flex justify-between border-2 border-gray-100 rounded-2xl dark:border-gray-600 h-auto py-5 px-6">
            <div className="flex flex-col items-left justify-center px-3">
              <dt className="mb-2 text-4xl md:text-4xl font-bold text-purple-700">
                {userData.number_of_offers}
              </dt>
              <dd className="font-medium text-gray-400 dark:text-gray-400">
                HR/Recruiters
              </dd>
            </div>
            <img src={appliedjob} alt="job icon" />
          </div>
          <div className="flex justify-between border-2 border-gray-100 rounded-2xl dark:border-gray-600 h-auto py-5 px-6">
            <div className="flex flex-col items-left justify-center px-3">
              <dt className="mb-2 text-4xl md:text-4xl font-bold text-purple-700">
                {userData.number_of_rejections}
              </dt>
              <dd className="font-medium text-gray-400 dark:text-gray-400">
                Total Users
              </dd>
            </div>
            <img src={appliedjob} alt="job icon" />
          </div>
          <div className="flex justify-between border-2 border-gray-100 rounded-2xl dark:border-gray-600 h-auto py-5 px-6">
            <div className="flex flex-col items-left justify-center px-3">
              <dt className="mb-2 text-4xl md:text-4xl font-bold text-purple-700">
                {userData.number_of_interviews}
              </dt>
              <dd className="font-medium text-gray-400 dark:text-gray-400">
                Users Deleted
              </dd>
            </div>
            <img src={appliedjob} alt="job icon" />
          </div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-1 lg:grid-cols-4 gap-6 mb-6 mx-6 mt-4">
          <div className="col-span-3 justify-between border-2 border-gray-100 rounded-2xl h-auto max-h-72 overflow-auto py-4 px-6">
            <h5 className="text-md font-medium text-purple-700 px-3 py-1.5 rounded-lg bg-purple-50">
              Pending Approvals
            </h5>

            <div className="flex flex-col items-left justify-center px-1">
              <ul role="list" className="divide-y divide-purple-100">
                {users
                  .filter((newuser) => newuser.register_status === "pending")
                  .map((newuser) => (
                    <li
                      key={newuser.email}
                      className="flex justify-between gap-x-6 py-4"
                    >
                      <div className="flex min-w-0 gap-x-4">
                        <img
                          className="h-12 w-12 flex-none rounded-full bg-gray-50"
                          src={newuser.profilePicUrl || user}
                          alt="Profile Picture"
                        />
                        <div className="min-w-0 flex-auto">
                          <p className="text-md font-semibold leading-6 text-gray-900">
                            {newuser.firstName} {newuser.lastName}
                          </p>
                          <p className="mt-1 truncate text-sm leading-5 text-gray-500">
                            {newuser.email} | {newuser.position}
                          </p>
                        </div>
                      </div>
                      <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                        {/* <p className="text-md leading-6 text-gray-900 mr-2">
                        {newuser.position}
                      </p> */}

                        <div className="mt-1 flex items-center gap-x-1.5">
                          <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          </div>
                          <button
                            className="text-xs text-white bg-purple-700 rounded-xl px-3 py-2 hover:bg-purple-800"
                            onClick={() =>
                              handleUpdateStatus(newuser.uid, "approved")
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="text-xs text-purple-700 bg-purple-100 rounded-xl px-3 py-2 hover:bg-purple-200"
                            onClick={() =>
                              handleUpdateStatus(newuser.uid, "decline")
                            }
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <div className="flex justify-between border-2 border-gray-100 rounded-2xl dark:border-gray-600 h-auto py-5 px-6">
            <div className="flex flex-col items-left justify-center px-3">
              <dt className="mb-2 text-4xl md:text-4xl font-bold text-purple-700">
                {userData.number_of_interviews}
              </dt>
              <dd className="font-medium text-gray-400 dark:text-gray-400">
                Users Deleted
              </dd>
            </div>
            <img src={appliedjob} alt="job icon" />
          </div>

          <div className="col-span-4 border-2 border-gray-100 rounded-2xl h-auto max-h-72 overflow-auto p-4">
            <div className="flex justify-between mb-4">
              <h5 className="pl-3 text-purple-700 font-semibold text-lg content-center">
                All Users
              </h5>

              <label htmlFor="simple-search" className="sr-only">
                Search
              </label>
              <div className="relative w-1/3">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="simple-search"
                  className="justify-center bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-700 focus:border-purple-700 block w-full pl-10 p-2"
                  placeholder="Search name, email, position..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto relative">
              <table className="w-full text-sm text-left text-gray-500 rounded-xl">
                <thead className="text-md text-purple-700 uppercase bg-purple-100  dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="py-3 px-6 "></th>
                    <th scope="col" className="pl-2 pr-6 px-6 ">
                      Name
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Email
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Position
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers
                    .filter(
                      (newuser) =>
                        newuser.register_status === "approved" &&
                        newuser.uid !== uid
                    )
                    .map((newuser) => (
                      <tr
                        key={newuser.uid}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="py-2 pl-4 pr-1">
                          {" "}
                          <img
                            className="h-10 w-10 flex-none rounded-full bg-gray-50"
                            src={newuser.profilePicUrl || user}
                            alt="Profile Picture"
                          />
                        </td>
                        <td className="py-4 pl-2 pr-6">
                          {newuser.firstName} {newuser.lastName}
                        </td>
                        <td className="py-4 px-6">{newuser.email}</td>
                        <td className="py-4 px-6">{newuser.position}</td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleDeleteUser(newuser.id)}
                            className="font-medium text-red-600 dark:text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplicantDashboard;
