import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import styles from "./style";
// import "../dist/output.css";
import { Dashboard, Home, JobPostings } from "./components";
// import { Button, Navbar } from "flowbite-react";

const App = () => {
  // const [isModalOpen, setModalOpen] = useState(false);

  // const toggleModal = () => {
  //   setModalOpen(!isModalOpen);
  // };

  return (
    // <div className="bg-white w-full overflow-hidden">
    //   <div className={`${styles.paddingX} ${styles.flexCenter}`}>
    //     <div className={`${styles.boxWidth}`}>{/* <Navbar /> */}</div>
    //   </div>

    //   <div className={`bg-white ${styles.flexStart}`}>
    //     <div className={`${styles.boxWidth}`}>{/* <Hero /> */}</div>
    //   </div>

    //   <div className={`bg-white ${styles.paddingX} ${styles.flexCenter}`}>
    //     <div className={`${styles.boxWidth}`}>
    //     </div>
    //   </div>
    //   {/* <button onClick={toggleModal}>Toggle Modal</button>
    // <JobForm isOpen={isModalOpen} isClose={toggleModal} /> */}
    // </div>

    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jobpostings" element={<JobPostings />} />
        {/* <Route path="*" element={<NotFound />} />  */}
      </Routes>
    </div>
  );
};

export default App;
