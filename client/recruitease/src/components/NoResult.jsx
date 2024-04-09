import React from "react";
import { nodata } from "../assets";

const NoResult = () => {
  return (
    <div className="text-center p-10">
      <img
        src={nodata}
        alt="No results found"
        className="mx-auto"
        style={{ maxWidth: "300px" }}
      />
      <h3 className="mt-2 text-lg font-semibold text-gray-600">
        No results found
      </h3>
      <p className="text-gray-400">Try adjusting your search or filters.</p>
    </div>
  );
};

export default NoResult;
