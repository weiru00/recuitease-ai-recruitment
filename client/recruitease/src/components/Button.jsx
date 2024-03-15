import React from "react";

const Button = ({ text, size }) => {
  let sizeClass = "text-base px-5 py-3";

  // Adjust the sizeClass based on the size prop
  if (size === "small") {
    sizeClass = "text-sm px-6 py-2";
  } else if (size === "large") {
    sizeClass = "text-base px-5 py-3";
  }
  return (
    <button
      type="button"
      className={`text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg ${sizeClass} text-center inline-flex items-center dark:bg-purple-600 dark:hover:bg-purple-700`}
    >
      {text}
      <svg
        className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 14 10"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M1 5h12m0 0L9 1m4 4L9 9"
        />
      </svg>
    </button>
  );
};

export default Button;
