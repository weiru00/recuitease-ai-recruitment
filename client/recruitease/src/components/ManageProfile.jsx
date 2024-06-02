import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "./admin/Sidebar";
import RecruiterSidebar from "./recruiter/Sidebar";
import ApplicantSidebar from "./applicant/ApplicantSidebar";
import SuccessfulModal from "./SuccessfulModal";

const ManageProfile = () => {
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [imageVersion, setImageVersion] = useState(Date.now());

  const [position, setPosition] = useState("");
  const [gender, setGender] = useState("");
  const [race, setRace] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState("");

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
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`/api/user-info?uid=${uid}`);
        const data = await response.json();
        if (response.ok) {
          setFirstName(data.user_info.firstName);
          setLastName(data.user_info.lastName);
          setGender(data.user_info.gender);
          setRace(data.user_info.race);
          setPosition(data.user_info.position);
          setProfilePicUrl(data.user_info.profilePicUrl);

          if (data.company_info) {
            setCompanyName(data.company_info.companyName);
            setWebsite(data.company_info.website);
            setCompanySize(data.company_info.companySize);
            setCompanyDescription(data.company_info.companyDescription);
            setCompanyLogoUrl(data.company_info.companyLogoUrl);
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
    const file = event.target.files[0];
    setCompanyLogo(file);
  };

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    setProfilePic(file);
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
    formData.append("position", position);
    formData.append("gender", gender);
    formData.append("race", race);

    if (profilePic) formData.append("profilePic", profilePic);
    if (companyLogo) formData.append("companyLogo", companyLogo);

    try {
      const response = await fetch("/api/update-profile", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setImageVersion(Date.now());
        if (data.profilePicUrl)
          setProfilePicUrl(`${data.profilePicUrl}?v=${imageVersion}`);
        if (data.companyLogoUrl)
          setCompanyLogoUrl(`${data.companyLogoUrl}?v=${imageVersion}`);
        openSuccessModal();
      } else {
        console.error("Failed to update user data");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  return (
    <div className="font-body antialiased bg-white dark:bg-gray-900">
      {(role == "admin" || role == "manager") && <AdminSidebar />}
      {role == "recruiter" && <RecruiterSidebar />}
      {role == "applicant" && <ApplicantSidebar />}

      <main className="p-4 md:ml-72 md:mr-24 sm:ml-48 sm:mr-24 h-auto pt-14">
        <div className="mb-6 mx-6">
          <h5 className="text-2xl font-semibold text-gray-500 mb-6">
            <span className="text-purple-700 font-semibold">
              Manage Profile
            </span>
          </h5>

          {role == "admin" && (
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
                    {/* {companyLogoUrl && (
                      <img
                        src={`${companyLogoUrl}?v=${imageVersion}`}
                        alt="Company Logo"
                        className="mb-3 w-20 h-20 object-cover rounded-full"
                      />
                    )}
                    <p className="text-xs font-medium text-purple-700 my-2">
                      ** The changes will be reflected on the Sidebar
                      afterwards.
                    </p> */}
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
          )}

          {(role == "recruiter" ||
            role == "manager" ||
            role == "applicant") && (
            <form onSubmit={handleSubmit}>
              {(role == "recruiter" || role == "manager") && (
                <div>
                  <div className="mb-6">
                    <h2 className="block text-lg font-bold text-gray-900 dark:text-white">
                      Company Information
                    </h2>
                  </div>
                  <div className="grid gap-6 mb-6 md:grid-cols-2">
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
                </div>
              )}

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
                    {/* {profilePicUrl && (
                      <img
                        src={`${profilePicUrl}?v=${imageVersion}`}
                        alt="Profile Picture"
                        className="mb-3 w-20 h-20 object-cover rounded-full"
                      />
                    )}
                    <p className="text-xs font-medium text-purple-700 my-2">
                      ** The changes will be reflected on the Sidebar
                      afterwards.
                    </p> */}
                    <input
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                      aria-describedby="file_input_help"
                      id="file_input"
                      type="file"
                      accept=".jpg, .png"
                      onChange={handleProfilePicChange}
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
                  <div>
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
                  <div>
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
                <span className="text-md text-white font-medium">
                  Update Profile
                </span>
              </button>
            </form>
          )}
        </div>
      </main>
      {showSuccessModal && (
        <SuccessfulModal
          onCloseModal={handleCloseModal}
          onCloseForm={() => {
            isClose();
          }}
          title={`Profile Updated`}
          desc={`Your profile has been successfully updated.`}
        />
      )}
    </div>
  );
};

export default ManageProfile;
