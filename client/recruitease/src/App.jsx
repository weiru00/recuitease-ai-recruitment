import { Routes, Route } from "react-router-dom";
import "flowbite";
import styles from "./style";
// import "../dist/output.css";
import { Home, Login, Signup } from "./components";
import { ApplicantDashboard } from "./components/applicant";
import {
  JobPostings,
  RecruiterDashboard,
  Talents,
} from "./components/recruiter";

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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
        <Route path="/applicant-dashboard" element={<ApplicantDashboard />} />
        <Route path="/jobpostings" element={<JobPostings />} />
        <Route path="/talents" element={<Talents />} />
        {/* <Route path="*" element={<NotFound />} />  */}
      </Routes>
    </div>
  );
};

export default App;
