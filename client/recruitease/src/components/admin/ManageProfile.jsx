import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import SuccessfulModal from "../SuccessfulModal";
import { login } from "../../assets";

const ManageProfile = () => {
  const [companyLogo, setCompanyLogo] = useState(null); // Assuming you'll handle file uploads
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [imageVersion, setImageVersion] = useState(Date.now());

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get("uid");
  const role = queryParams.get("role");

  const openSuccessModal = () => {
    setShowSuccessModal(true);
  };
  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  useEffect(() => {
    // Fetch the user's existing profile information
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`/api/user-info?uid=${uid}`);
        const data = await response.json();
        if (response.ok) {
          setFirstName(data.user_info.firstName);
          setLastName(data.user_info.lastName);
          if (data.company_info) {
            // Check if there is company data
            setCompanyName(data.company_info.companyName);
            setWebsite(data.company_info.website);
            setCompanySize(data.company_info.companySize);
            setCompanyDescription(data.company_info.companyDescription);
          }
        } else {
          throw new Error("Failed to fetch profile data");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [uid]);

  const handleLogoChange = (event) => {
    // Assuming you're handling file uploads for the logo
    const file = event.target.files[0];
    setCompanyLogo(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("uid", uid);
    formData.append("role", role);
    formData.append("companyName", companyName);
    formData.append("website", website);
    formData.append("companySize", companySize);
    formData.append("companyDescription", companyDescription);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);

    if (companyLogo) formData.append("companyLogo", companyLogo);

    try {
      const response = await fetch("/api/update-profile", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        openSuccessModal();
        navigate(`/manage-profile?uid=${uid}&role=${role}`);
      } else {
        console.error("Failed to update user data");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  return (
    <div className="font-body antialiased bg-white dark:bg-gray-900">
      <Sidebar />

      <main className="p-4 md:ml-72 md:mr-24 sm:ml-48 sm:mr-24 h-auto pt-14">
        <div className="mb-6 mx-6">
          <h5 className="text-2xl font-semibold text-gray-500 mb-6">
            <span className="text-purple-700 font-semibold">
              Manage Profile
            </span>
          </h5>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h2 className="block text-lg font-bold text-gray-900 dark:text-white">
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
              onClick={openSuccessModal}
              className="mt-12 flex w-full items-center rounded-lg bg-purple-600 px-4 py-3 text-center justify-center hover:bg-purple-800"
            >
              <span className="text-md text-white font-medium">
                Update Profile
              </span>
            </button>
          </form>
        </div>
      </main>
      {showSuccessModal && (
        <SuccessfulModal
          onCloseModal={handleCloseModal}
          onCloseForm={() => {
            isClose();
          }}
          title={`Profile Updated`}
          desc={`Your profile has been successfully.`}
        />
      )}
    </div>
  );
};

export default ManageProfile;
