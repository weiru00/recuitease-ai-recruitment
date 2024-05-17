import { useLocation } from "react-router-dom";
import { login } from "../assets";
import { Link } from "react-router-dom";

const Onboarding = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get("role");

  return (
    <section className="font-body flex h-screen w-full items-center justify-center bg-purple-50 px-36">
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
              <span className="text-md text-purple-600 font-medium">Type</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="rounded-full bg-purple-600 text-white px-4 py-1 text-md font-semibold">
                2
              </div>
              <span className="text-md text-purple-600 font-medium">
                Account Info
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="rounded-full bg-purple-600 text-white px-4 py-1 text-md font-semibold">
                3
              </div>
              <span className="text-md text-purple-600 font-medium">
                Confirmation
              </span>
            </div>
          </div>
          {role === "admin" || role === "applicant" ? (
            <div>
              <div class="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900 p-2 flex items-center justify-center mt-8 mx-auto mb-3.5">
                <svg
                  aria-hidden="true"
                  class="w-8 h-8 text-green-500 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span class="sr-only">Success</span>
              </div>
              <div className="flex flex-col space-y-6 text-center">
                <h2 className="text-3xl font-bold">Successful</h2>
                {role === "admin" && (
                  <p className="text-lg font-normal text-gray-500">
                    Your company profile is all set! <br></br>You can log in to
                    your company account now.
                  </p>
                )}
                {role === "applicant" && (
                  <p className="text-lg font-normal text-gray-500">
                    Your profile is all set! <br></br>You can log in to your
                    account now.
                  </p>
                )}
              </div>
              <Link
                to="/login"
                className="mt-12 flex w-full items-center rounded-lg bg-purple-600 px-4 py-3 text-center justify-center hover:bg-purple-800"
              >
                <span className="text-md text-white font-medium">
                  Log in to your Account
                </span>
              </Link>
            </div>
          ) : null}

          {role === "recruiter" || role === "manager" ? (
            <div>
              <div class="w-24 h-24 rounded-full bg-yellow-100 dark:bg-green-900 p-2 flex items-center justify-center mt-8 mx-auto mb-3.5">
                <svg
                  aria-hidden="true"
                  class="w-8 h-8 text-yellow-500 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span class="sr-only">Pending</span>
              </div>
              <div className="flex flex-col space-y-6 text-center">
                <h2 className="text-3xl font-bold">Review</h2>
                <p className="text-lg font-normal text-gray-500">
                  Your registration is successful! We are currently reviewing
                  your application. <br></br> You will receive an email once
                  admin has approved your application.
                </p>
              </div>
              <Link
                to="/"
                className="mt-12 flex w-full items-center rounded-lg bg-purple-600 px-4 py-3 text-center justify-center hover:bg-purple-800"
              >
                <span className="text-md text-white font-medium">
                  Return to Home
                </span>
              </Link>
            </div>
          ) : null}
        </div>
        <div
          id="successModal"
          tabindex="-1"
          aria-hidden="true"
          class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full"
        >
          <div class="relative p-4 w-full max-w-md h-full md:h-auto">
            <div class="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
              <button
                type="button"
                class="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-toggle="successModal"
              >
                <svg
                  aria-hidden="true"
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span class="sr-only">Close modal</span>
              </button>
              <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 p-2 flex items-center justify-center mx-auto mb-3.5">
                <svg
                  aria-hidden="true"
                  class="w-8 h-8 text-green-500 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span class="sr-only">Success</span>
              </div>
              <p class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Successfully removed product.
              </p>
              <button
                data-modal-toggle="successModal"
                type="button"
                class="py-2 px-3 text-sm font-medium text-center text-white rounded-lg bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-900"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Onboarding;
