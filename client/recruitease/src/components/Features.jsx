import React from "react";
import Button from "./Button";

const Features = () => {
  return (
    <section class="bg-white dark:bg-gray-900">
      <div class="gap-8 items-center py-8 px-4 mx-auto max-w-screen-xl xl:gap-16 md:grid md:grid-cols-2 sm:py-16 lg:px-6">
        <img
          class="w-full dark:hidden"
          src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup.svg"
          alt="dashboard image"
        ></img>
        <img
          class="w-full hidden dark:block"
          src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup-dark.svg"
          alt="dashboard image"
        ></img>
        <div class="mt-4 md:mt-0">
          <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            Let's create more tools and ideas that brings us together.
          </h2>
          <p class="mb-6 font-light text-gray-500 md:text-lg dark:text-gray-400">
            Flowbite helps you connect with friends and communities of people
            who share your interests. Connecting with your friends and family as
            well as discovering new ones is easy with features like Groups.
          </p>
          <Button text="Explore Now" size="small" />
        </div>
      </div>
    </section>
  );
};

export default Features;
