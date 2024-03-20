import React from "react";
import { login } from "../assets";

const Onboarding = () => {
  return (
    <div>
      {/* <section class="bg-white dark:bg-gray-900">
        <div class="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
          <div class="mr-auto place-self-center lg:col-span-7">
            <h1 class="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white">
              Payments tool for software companies
            </h1>
            <p class="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">
              From checkout to global sales tax compliance, companies around the
              world use Flowbite to simplify their payment stack.
            </p>
            <a
              href="#"
              class="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900"
            >
              Get started
              <svg
                class="w-5 h-5 ml-2 -mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </a>
            <a
              href="#"
              class="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
            >
              Speak to Sales
            </a>
          </div>
          <div class="hidden lg:mt-0 lg:col-span-5 lg:flex">
            <img
              src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/phone-mockup.png"
              alt="mockup"
            />
          </div>
        </div>
      </section> */}
      <div className="flex h-screen w-full items-center justify-center bg-purple-50 px-36">
        <div className="flex w-full max-w-screen-xl rounded-lg bg-white p-8 shadow-lg">
          <div className="mr-8 flex w-1/3 flex-col rounded-lg bg-purple-100 px-8 py-10 text-white">
            <div className="flex items-center space-x-3">
              {/* <FlagIcon className="h-8 w-8" /> */}
              <span className="text-3xl text-purple-600 font-bold">
                RecruitEase
              </span>
            </div>

            <div className="mt-6 flex flex-col space-y-4">
              {/* <h2 className="text-2xl font-bold">Your selected plan</h2>
              <p>30-day free trial</p>
              <ul className="list-inside list-disc space-y-4">
                <li>Individual configuration</li>
                <li>No setup, or hidden fees</li>
                <li>Team size: 1 developer</li>
                <li>Premium support: 6 months</li>
                <li>Free updates: 6 months</li>
              </ul> */}
              <img src={login} />
            </div>
          </div>
          <div className="flex w-2/3 flex-col">
            <div className="mb-9 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="rounded-full bg-gray-200 px-4 py-1 text-md font-semibold text-gray-700">
                  1
                </div>
                <span className="text-md font-medium">Personal Info</span>
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
              <p className="text-lg font-semibold">What is your profession?</p>
              <div className="flex flex-col space-y-6">
                <button className="flex w-full items-center justify-between rounded-lg border-2 border-gray-300 px-4 py-3 text-left hover:border-2 hover:border-purple-600 focus:border-purple-600 focus:ring-4 focus:outline-none focus:ring-purple-300">
                  <span className="text-lg font-medium">I'm an Applicant.</span>
                  {/* <ChevronRightIcon className="h-6 w-6" /> */}
                </button>
                <button className="flex w-full items-center justify-between rounded-lg border-2 border-gray-300 px-4 py-3 text-left hover:border-2 hover:border-purple-600 focus:border-purple-600 focus:ring-4 focus:outline-none focus:ring-purple-300">
                  <span className="text-lg font-medium">I'm a Recruiter.</span>
                  {/* <ChevronRightIcon className="h-6 w-6" /> */}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <a className="text-md text-purple-600" href="#">
                  Already have an account? Login here.
                </a>
                {/* <Button className="bg-blue-600 px-6 py-2 text-white">Next: Account Info</Button> */}
              </div>
            </div>
            <button className="mt-12 flex w-full items-center rounded-lg bg-purple-600 px-4 py-3 text-center justify-center hover:bg-purple-800">
              <span className="text-md text-white font-medium">
                Next: Account Info
              </span>
              {/* <ChevronRightIcon className="h-6 w-6" /> */}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
