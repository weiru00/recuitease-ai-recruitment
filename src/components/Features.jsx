import React from "react";
import Button from "./Button";
import styles from "../style";

const Features = () => {
  return (
    <section className="bg-white dark:bg-gray-900 font-body">
      <div className="gap-8 text-center py-4 px-4 mx-auto max-w-screen-xl xl:gap-16 sm:py-4 lg:px-6">
        <div className="mt-2 md:mt-0">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            Our Work
          </h2>
          <p className="mb-6 font-light text-gray-500 md:text-lg dark:text-gray-400">
            RecruitEase helps you gets hired in an easier and faster way.{" "}
          </p>
        </div>
      </div>

      <div className="gap-8 items-center py-8 px-4 mx-auto max-w-screen-xl xl:gap-16 md:grid md:grid-cols-2 sm:py-16 lg:px-6">
        <div
          className={`flex-1 flex ${styles.flexCenter} md:my-0 my-8 relative`}
        >
          <img
            className="w-full dark:hidden relative z-[5]"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup.svg"
            alt="dashboard image"
          ></img>
          <img
            className="w-full hidden dark:block relative z-[5]"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup-dark.svg"
            alt="dashboard image"
          ></img>

          {/* gradient start */}
          <div className="absolute z-[0] w-[40%] h-[15%] top-0 pink__gradient" />
          <div className="absolute z-[1] w-[60%] h-[60%] rounded-full purple__gradient bottom-40" />
          <div className="absolute z-[0] w-[50%] h-[50%] right-20 bottom-20 white__gradient" />
          {/* gradient end */}
        </div>

        <div className="mt-4 md:mt-0">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            Let's create more tools and ideas that brings us together.
          </h2>
          <p className="mb-6 font-light text-gray-500 md:text-lg dark:text-gray-400">
            Flowbite helps you connect with friends and communities of people
            who share your interests. Connecting with your friends and family as
            well as discovering new ones is easy with features like Groups.
          </p>
          <Button text="Explore Now" size="small" type="primary" />
        </div>
      </div>

      <div className="gap-8 items-center py-8 px-4 mx-auto max-w-screen-xl xl:gap-16 md:grid md:grid-cols-2 sm:py-16 lg:px-6">
        <div className="mt-4 md:mt-0">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            Let's create more tools and ideas that brings us together.
          </h2>
          <p className="mb-6 font-light text-gray-500 md:text-lg dark:text-gray-400">
            Flowbite helps you connect with friends and communities of people
            who share your interests. Connecting with your friends and family as
            well as discovering new ones is easy with features like Groups.
          </p>
          <Button text="Explore Now" size="small" type="primary" />
        </div>
        <div
          className={`flex-1 flex ${styles.flexCenter} md:my-0 my-8 relative`}
        >
          <img
            className="w-full dark:hidden relative z-[5]"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup.svg"
            alt="dashboard image"
          ></img>
          <img
            className="w-full hidden dark:block relative z-[5]"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup-dark.svg"
            alt="dashboard image"
          ></img>

          {/* gradient start */}
          <div className="absolute z-[0] w-[40%] h-[15%] top-0 white__gradient" />
          <div className="absolute z-[1] w-[60%] h-[60%] rounded-full pink__gradient bottom-40" />
          <div className="absolute z-[0] w-[70%] h-[50%] right-50 bottom-20 purple__gradient" />
          {/* gradient end */}
        </div>
      </div>

      <div className="gap-8 items-center py-8 px-4 mx-auto max-w-screen-xl xl:gap-16 md:grid md:grid-cols-2 sm:py-16 lg:px-6">
        <div
          className={`flex-1 flex ${styles.flexCenter} md:my-0 my-8 relative`}
        >
          <img
            className="w-full dark:hidden relative z-[5]"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup.svg"
            alt="dashboard image"
          ></img>
          <img
            className="w-full hidden dark:block relative z-[5]"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup-dark.svg"
            alt="dashboard image"
          ></img>

          {/* gradient start */}
          <div className="absolute z-[1] w-[40%] h-[15%] top-0 pink__gradient" />
          <div className="absolute z-[0] w-[60%] h-[60%] rounded-full purple__gradient bottom-40" />
          <div className="absolute z-[1] w-[50%] h-[50%] right-20 bottom-20 white__gradient" />
          {/* gradient end */}
        </div>
        <div className="mt-4 md:mt-0">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            Let's create more tools and ideas that brings us together.
          </h2>
          <p className="mb-6 font-light text-gray-500 md:text-lg dark:text-gray-400">
            Flowbite helps you connect with friends and communities of people
            who share your interests. Connecting with your friends and family as
            well as discovering new ones is easy with features like Groups.
          </p>
          <Button text="Explore Now" size="small" type="primary" />
        </div>
      </div>
    </section>
  );
};

export default Features;
