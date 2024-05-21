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
  ManageProfile,
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
import { AdminDashboard, OnboardingAdmin } from "./components/admin";
import { ManagerDashboard } from "./components/manager";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
        <Route path="/applicant-dashboard" element={<ApplicantDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
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
