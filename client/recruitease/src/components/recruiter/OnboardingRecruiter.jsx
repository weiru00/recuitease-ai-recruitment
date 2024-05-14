import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../../assets";

const OnboardingRecruiter = () => {
  const [companyLogo, setCompanyLogo] = useState(null); // Assuming you'll handle file uploads
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get("uid");

  const handleLogoChange = (event) => {
    // Assuming you're handling file uploads for the logo
    const file = event.target.files[0];
    setCompanyLogo(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // const userData = {
    //   companyName,
    //   website,
    //   companySize,
    //   companyDescription,
    //   firstName,
    //   lastName,
    // };
    const formData = new FormData();
    formData.append("uid", uid);
    formData.append("companyName", companyName);
    formData.append("website", website);
    formData.append("companySize", companySize);
    formData.append("companyDescription", companyDescription);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);

    if (companyLogo) formData.append("companyLogo", companyLogo);

    try {
      const response = await fetch("/api/update-company", {
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
                <h2 className="block mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  Company Information
                </h2>
              </div>
              <div className="grid gap-6 mb-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="logo"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Company Logo
                  </label>
                  <div>
                    <input
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                      aria-describedby="file_input_help"
                      id="file_input"
                      type="file"
                      onChange={handleLogoChange}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="company_name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5"
                    placeholder="ABC Corp."
                    required={true}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="website"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="website"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                    placeholder="flowbite.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <div className="max-w-sm mx-auto">
                    <label
                      htmlFor="sizes"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Company Size
                    </label>
                    <select
                      id="sizes"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                    >
                      <option defaultValue>Choose a company size</option>
                      <option value="small">Below 10 Employees</option>
                      <option value="medium">11-50 Employees</option>
                      <option value="big">51-100 Employees</option>
                      <option value="huge">100+ Employees</option>
                    </select>
                  </div>
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="description"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Company description
                  </label>
                  <textarea
                    id="description"
                    rows="4"
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                    placeholder="Write company description here..."
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="grid gap-6 mb-6 md:grid-cols-2">
                <div className="col-span-2">
                  <label className="block text-lg font-bold text-gray-900 dark:text-white">
                    Personal Information
                  </label>
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
