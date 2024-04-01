import React from "react";
import ApexCharts from "react-apexcharts";
import "flowbite";

const PieChart = () => {
  // Define options as an object
  const options = {
    series: [52.8, 26.8, 20.4],
    colors: ["#1C64F2", "#16BDCA", "#9061F9"],
    chart: {
      height: 420,
      width: "100%",
      type: "pie",
    },
    stroke: {
      colors: ["white"],
      lineCap: "",
    },
    plotOptions: {
      pie: {
        labels: {
          show: true,
        },
        size: "100%",
        dataLabels: {
          offset: -25,
        },
      },
    },
    labels: ["Direct", "Organic search", "Referrals"],
    dataLabels: {
      enabled: true,
      style: {
        fontFamily: "Inter, sans-serif",
      },
    },
    legend: {
      position: "bottom",
      fontFamily: "Inter, sans-serif",
    },
  };

  // Directly return the ApexCharts component
  return (
    <div className=" w-full bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6">
      <ApexCharts
        options={options}
        series={options.series}
        type="pie"
        height={420}
      />
    </div>
  );
};

export default PieChart;
