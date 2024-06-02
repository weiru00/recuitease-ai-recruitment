import styles from "../style";
import { hero } from "../assets";
import Button from "./Button";

const Hero = () => {
  return (
    <section
      id="home"
      className={`flex md:flex-row flex-col font-body ${styles.paddingY}`}
    >
      <div
        className={`flex-1 ${styles.flexStart} flex-col xl:px-0 sm:px-16 px-6`}
      >
        <div className="flex flex-row justify-between items-center w-full mb-4">
          <h1 className="max-w-2xl mb-4 text-5xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white">
            Get Hired Now.
          </h1>
        </div>

        <p className="max-w-2xl mb-6 font-light text-gray-700 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">
          Our platform is designed to streamline your hiring process. Leveraging
          advanced AI technology, RecruitEase provides insightful analytics to
          ensure you make the best hiring decisions.
        </p>
        <div className="flex space-x-4">
          <Button
            text="Get Started"
            size="large"
            type="primary"
            navigateTo="/login"
          />
          <Button text="Learn More" size="large" type="cancel" />
        </div>
      </div>

      <div className={`flex-1 flex ${styles.flexCenter} md:my-0 my-8 relative`}>
        <img
          src={hero}
          alt="hero"
          className="w-[90%] h-[100%] relative z-[5]"
        />

        {/* gradient start */}
        <div className="absolute z-[0] w-[40%] h-[35%] top-0 pink__gradient" />
        <div className="absolute z-[1] w-[80%] h-[80%] rounded-full purple__gradient bottom-40" />
        <div className="absolute z-[0] w-[50%] h-[50%] right-20 bottom-20 white__gradient" />
        {/* gradient end */}
      </div>
    </section>
  );
};

export default Hero;
