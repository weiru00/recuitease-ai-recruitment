import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../../assets";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const OnboardingRecruiter = () => {
  const [profilePic, setprofilePic] = useState(null);
  const [companyList, setCompanyList] = useState([]);
  const [companyID, setCompanyID] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [gender, setGender] = useState("");
  const [race, setRace] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get("uid");
  const role = queryParams.get("role");

  const db = getFirestore();

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    setprofilePic(file);
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      const querySnapshot = await getDocs(collection(db, "company"));
      const companies = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().companyName,
      }));
      setCompanyList(companies);
    };

    fetchCompanies();
  }, [db]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("uid", uid);
    formData.append("role", role);
    formData.append("companyID", companyID);
    formData.append("position", position);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("gender", gender);
    formData.append("race", race);
    if (profilePic) formData.append("profilePic", profilePic);

    try {
      const response = await fetch("/api/update-user", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        console.log("User data updated successfully");
        navigate(`/onboarding-successful?role=${role}`);
      } else {
        console.error("Failed to update user data");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  return (
    <div className="font-body">
      <section className="flex h-screen w-full items-center justify-center bg-purple-50 px-36">
        <div className="flex w-full max-w-screen-xl rounded-lg bg-white p-8 shadow-lg">
          <div className="mr-8 flex w-1/3 flex-col rounded-lg bg-purple-100 px-8 py-10 text-white">
            <div className="flex items-center space-x-3">
              <span className="text-2xl text-purple-600 font-bold">
                RecruitEase
              </span>
            </div>

            <div className="mt-6 flex flex-col space-y-4">
              <img src={login} />
            </div>
          </div>
          <div className="flex w-2/3 flex-col">
            <div className="mb-9 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="rounded-full bg-purple-600 text-white px-4 py-1 text-md font-semibold">
                  1
                </div>
                <span className="text-md text-purple-600 font-medium">
                  Type
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="rounded-full bg-purple-600 px-4 py-1 text-md font-semibold text-white">
                  2
                </div>
                <span className="text-md font-medium text-purple-600">
                  Account Info
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="rounded-full bg-gray-200 px-4 py-1 text-md font-semibold text-gray-700">
                  3
                </div>
                <span className="text-md font-medium">Confirmation</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h2 className="block text-lg font-bold text-gray-900 dark:text-white">
                  Company Information
                </h2>
              </div>
              <div className="grid gap-6 mb-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="companyName"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Company Name
                  </label>
                  <select
                    id="companyName"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                    value={companyID}
                    onChange={(e) => setCompanyID(e.target.value)}
                    required={true}
                  >
                    <option defaultValue>Select a company</option>
                    {companyList.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="position"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Position
                  </label>
                  <input
                    type="text"
                    id="position"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                    placeholder="E.g: Hiring Manager"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    // required={true}
                  />
                </div>
              </div>
              <div className="mb-6">
                <h2 className="block mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  Personal Information
                </h2>
              </div>
              <div className="grid gap-6 mb-6 md:grid-cols-2">
                <div className="col-span-2">
                  <label
                    htmlFor="logo"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Profile Picture
                  </label>
                  <div>
                    <input
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                      aria-describedby="file_input_help"
                      id="file_input"
                      type="file"
                      accept=".jpg, .png"
                      onChange={handleLogoChange}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="first_name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    First name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={true}
                  />
                </div>
                <div>
                  <label
                    htmlFor="last_name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Last name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={true}
                  />
                </div>
                <div>
                  <div className="max-w-sm mx-auto">
                    <label
                      htmlFor="gender"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Gender
                    </label>
                    <select
                      id="gender"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option defaultValue>Choose your gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div className="max-w-sm mx-auto">
                    <label
                      htmlFor="race"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Race
                    </label>
                    <select
                      id="race"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                      value={race}
                      onChange={(e) => setRace(e.target.value)}
                    >
                      <option defaultValue>Choose your race</option>
                      <option value="malay">Malay</option>
                      <option value="chinese">Chinese</option>
                      <option value="indian">Indian</option>
                      <option value="others">Others</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-12 flex w-full items-center rounded-lg bg-purple-600 px-4 py-3 text-center justify-center hover:bg-purple-800"
              >
                <span className="text-md text-white font-medium">Submit</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OnboardingRecruiter;
