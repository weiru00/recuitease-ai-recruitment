import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import db from "./firebase"; // Import the Firebase app initialization

function App() {
  const [data, setData] = useState([{}]);

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    // <div>
    //   {typeof data.members == "undefined" ? (
    //     <p>Loading...</p>
    //   ) : (
    //     data.members.map((member, i) => <p key={i}>{member}</p>)
    //   )}
    // </div>
    <div>
      <h1>Job Details</h1>
      {data ? ( // Check if data is not null
        <div>
          <p>
            <strong>Title:</strong> {data.title}
          </p>
          <p>
            <strong>Description:</strong> {data.description}
          </p>
          {/* Render more job details as needed */}
        </div>
      ) : (
        <p>Loading job data...</p> // Show loading message while data is being fetched
      )}
    </div>
  );
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const querySnapshot = await getDocs(collection(db, "jobListings"));
  //     querySnapshot.forEach((doc) => {
  //       console.log(`${doc.id} => ${doc.data()}`);
  //     });
  //   };

  //   fetchData();
  // }, []);

  // return <div>Check the console for Firestore data!</div>;
}

export default App;
