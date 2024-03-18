import React from "react";
import "flowbite";
import styles from "../style";
import { Navbar, Hero, Features, JobPostings, Footer } from "./index";

const Home = () => {
  return (
    <div className="bg-white w-full overflow-hidden">
      <div className={`${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <Navbar />
        </div>
      </div>

      <div className={`bg-white ${styles.flexStart}`}>
        <div className={`${styles.boxWidth}`}>
          <Hero />
        </div>
      </div>

      <div className={`bg-white ${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <Features />
          <JobPostings />

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Home;
