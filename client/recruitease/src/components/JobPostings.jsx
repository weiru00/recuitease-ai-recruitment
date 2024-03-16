import React from "react";
import { useState, useEffect } from "react";

const JobPostings = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch("api/joblistings")
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((error) => console.error("There was an error!", error));
  }, []);

  return (
    <div>
      <h2>Job Listings</h2>
      <ul>
        {jobs.map((job, index) => (
          <li key={index}>
            {job.title} - {job.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobPostings;
