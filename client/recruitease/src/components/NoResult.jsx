import React from "react";
import { nodata } from "../assets";

const NoResult = ({ title, desc }) => {
  return (
    <div className="text-center p-10 font-body">
      <img
        src={nodata}
        alt="No results found"
        className="mx-auto"
        style={{ maxWidth: "300px" }}
      />
      <h3 className="mt-2 text-lg font-semibold text-gray-600">{title}</h3>
      <p className="text-gray-400">{desc}</p>
    </div>
  );
};

export default NoResult;
