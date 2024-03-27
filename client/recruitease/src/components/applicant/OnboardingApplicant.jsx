import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../../assets";

const OnboardingApplicant = () => {
  const [profilePic, setprofilePic] = useState(null); // Assuming you'll handle file uploads
  const [gender, setGender] = useState("");
  const [race, setRace] = useState("");
  const [resume, setResume] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get("uid");

  const handleLogoChange = (event) => {
    // Assuming you're handling file uploads for the logo
    const file = event.target.files[0];
    setprofilePic(file);
  };

  const handleResumeChange = (event) => {
    // Assuming you're handling file uploads for the resume
    const file = event.target.files[0];
    setResume(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("uid", uid);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("gender", gender);
    formData.append("race", race);
    if (profilePic) formData.append("profilePic", profilePic);
    // if (resume) formData.append("resume", resume);

    try {
      const response = await fetch("/api/update-user", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        console.log("User data updated successfully");
        navigate("/onboarding-successful");
      } else {
        console.error("Failed to update user data");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  return (
    <div>
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
              <div className="grid gap-6 mb-6 md:grid-cols-2">
                <div className="col-span-2">
                  <label className="block text-lg font-bold text-gray-900 dark:text-white">
                    Upload Resume
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-center w-full">
                <label
                  for="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF Only
                    </p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    onChange={handleResumeChange}
                  />
                </label>
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

export default OnboardingApplicant;
