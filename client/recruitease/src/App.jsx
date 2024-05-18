import { Routes, Route } from "react-router-dom";
import "flowbite";
import styles from "./style";
// import "../dist/output.css";
import {
  Home,
  Login,
  Signup,
  PrivateRoute,
  Onboarding,
  OnboardingConfirmation,
  JobPostings,
  JobDescription,
  OnboardingCompany,
} from "./components";
import {
  ApplicantDashboard,
  OnboardingApplicant,
  TrackApplication,
} from "./components/applicant";
import {
  RecruiterDashboard,
  Talents,
  OnboardingRecruiter,
} from "./components/recruiter";
import {
  AdminDashboard,
  OnboardingAdmin,
  ManageProfile,
} from "./components/admin";

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
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/jobpostings" element={<JobPostings />} />
        <Route path="/talents" element={<Talents />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/onboarding-admin" element={<OnboardingAdmin />} />
        <Route path="/onboarding-recruiter" element={<OnboardingRecruiter />} />
        <Route path="/onboarding-manager" element={<OnboardingRecruiter />} />
        <Route path="/onboarding-company" element={<OnboardingCompany />} />
        <Route path="/onboarding-applicant" element={<OnboardingApplicant />} />
        <Route
          path="/onboarding-successful"
          element={<OnboardingConfirmation />}
        />
        <Route path="/jobdescription" element={<JobDescription />} />
        <Route path="/track-applications" element={<TrackApplication />} />
        <Route path="/manage-profile" element={<ManageProfile />} />

        {/* <Route path="*" element={<NotFound />} />  */}
      </Routes>
    </div>
  );
};

export default App;
