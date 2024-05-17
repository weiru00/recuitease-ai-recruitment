import { useState } from "react";
import { login } from "../assets";
import { useNavigate, useLocation } from "react-router-dom";

const Onboarding = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get("uid");

  const updateUserRole = async (role) => {
    try {
      const response = await fetch("/api/update-user-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: uid,
          userData: { role: role },
        }),
      });
      const data = await response.json();
      if (data.success) {
        console.log("User role updated successfully");
        // Proceed with navigation after successful update
        navigate(`/onboarding-${role}?uid=${uid}&role=${role}`);
      } else {
        console.error("Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleSubmit = () => {
    if (
      selectedRole === "admin" ||
      selectedRole === "recruiter" ||
      selectedRole === "manager"
    ) {
      updateUserRole(selectedRole);
    }
  };

  // const handleSubmit = () => {
  //   // Check the role and navigate to the corresponding form
  //   if (selectedRole === "applicant") {
  //     navigate("/onboarding-applicant");
  //   } else if (selectedRole === "recruiter") {
  //     navigate("/onboarding-recruiter");
  //   }
  // };
  return (
    <div className="font-body">
      <section className="flex h-screen w-full items-center justify-center bg-purple-50 px-36">
        <div className="flex w-full max-w-screen-xl rounded-lg bg-white p-8 shadow-lg">
          <div className="mr-8 flex w-1/3 flex-col rounded-lg bg-purple-100 px-8 py-10 text-white">
            <div className="flex items-center space-x-3">
              {/* <FlagIcon className="h-8 w-8" /> */}
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
                <div className="rounded-full bg-gray-200 px-4 py-1 text-md font-semibold text-gray-700">
                  1
                </div>
                <span className="text-md font-medium">Account Type</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="rounded-full bg-gray-200 px-4 py-1 text-md font-semibold text-gray-700">
                  2
                </div>
                <span className="text-md font-medium">Account Info</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="rounded-full bg-gray-200 px-4 py-1 text-md font-semibold text-gray-700">
                  3
                </div>
                <span className="text-md font-medium">Confirmation</span>
              </div>
            </div>
            <div className="flex flex-col space-y-6">
              <h2 className="text-3xl font-bold">Tell us about yourself</h2>
              <p className="text-lg font-semibold text-gray-600">
                What is your profession?
                {/* Type of account: */}
              </p>
              <div className="flex flex-col">
                <button
                  onClick={() => setSelectedRole("admin")}
                  className="flex w-full items-center mb-6 justify-between rounded-lg border-2 border-gray-300 px-4 py-3 text-left hover:border-2 hover:border-purple-600 focus:border-purple-600 focus:ring-4 focus:outline-none focus:ring-purple-300"
                >
                  <span className="text-lg font-medium text-gray-600">
                    Admin
                    {/* Applicant */}
                  </span>
                  {/* <ChevronRightIcon className="h-6 w-6" /> */}
                </button>
                <button
                  onClick={() => setSelectedRole("recruiter")}
                  className="flex w-full items-center mb-6 justify-between rounded-lg border-2 border-gray-300 px-4 py-3 text-left hover:border-2 hover:border-purple-600 focus:border-purple-600 focus:ring-4 focus:outline-none focus:ring-purple-300"
                >
                  <span className="text-lg font-medium text-gray-600">
                    Recruiter/HR
                  </span>
                </button>
                <button
                  onClick={() => setSelectedRole("manager")}
                  className="flex w-full items-center justify-between rounded-lg border-2 border-gray-300 px-4 py-3 text-left hover:border-2 hover:border-purple-600 focus:border-purple-600 focus:ring-4 focus:outline-none focus:ring-purple-300"
                >
                  <span className="text-lg font-medium text-gray-600">
                    Manager
                  </span>
                </button>
                {/* <a className="text-sm ml-2 me-2 text-gray-400">
                  *Please register as an Admin if your company has not yet been
                  registered.
                </a> */}
              </div>
              <div className="flex items-center ">
                <a className="text-md me-2 text-gray-600">
                  Already have an account?
                </a>
                <a
                  className="text-md text-purple-600 hover:text-purple-800"
                  href="#"
                >
                  Login here.
                </a>
                {/* <Button className="bg-blue-600 px-6 py-2 text-white">Next: Account Info</Button> */}
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="mt-12 flex w-full items-center rounded-lg bg-purple-600 px-4 py-3 text-center justify-center hover:bg-purple-800"
            >
              <span className="text-md text-white font-medium">
                Next: Account Info
              </span>
              {/* <ChevronRightIcon className="h-6 w-6" /> */}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Onboarding;
