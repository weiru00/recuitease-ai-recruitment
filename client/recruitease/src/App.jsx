// import React, { useState, useEffect } from "react";
// import { getFirestore, collection, getDocs } from "firebase/firestore";
// import db from "./firebase"; // Import the Firebase app initialization

// function App() {
//   const [data, setData] = useState([{}]);

//   useEffect(() => {
//     fetch("/api/jobs")
//       .then((res) => res.json())
//       .then((data) => setData(data))
//       .catch((err) => console.error("Error fetching data:", err));
//   }, []);

//   return (
//     <div>
//       <h1>Job Details</h1>
//       {data ? ( // Check if data is not null
//         <div>
//           <p>
//             <strong>Title:</strong> {data.title}
//           </p>
//           <p>
//             <strong>Description:</strong> {data.description}
//           </p>
//         </div>
//       ) : (
//         <p>Loading job data...</p> // Show loading message while data is being fetched
//       )}
//     </div>
//   );
// }

// export default App;
import React from "react";
import styles from "./style";
// import "../dist/output.css";
import { Navbar, Hero, Features, JobPostings, Footer } from "./components";
// import { Button, Navbar } from "flowbite-react";

const App = () => {
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
          {/* <Features />
          <JobPostings />
          <Footer /> */}
        </div>
      </div>
    </div>
  );
};

export default App;
