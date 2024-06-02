import React from "react";
import ApexCharts from "react-apexcharts";
import "flowbite";

const PieChart = ({ title, chartData }) => {
  const options = {
    series: chartData.map((data) => data.data),
    colors: ["#7E3AF2", "#4533a9", "#9d3af2"],
    chart: {
      height: 400,
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
    labels: chartData.map((data) => data.name),
    dataLabels: {
      enabled: true,
      style: {
        fontFamily: "Inter, sans-serif",
      },
    },
    legend: {
      position: "right",
      fontFamily: "Inter, sans-serif",
    },
  };

  return (
    <div className="font-body w-full bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6">
      <h1 className="text-md font-semibold leading-none text-purple-600 dark:text-white pe-1">
        {title}
      </h1>
      <ApexCharts
        options={options}
        series={options.series}
        type="pie"
        height={250}
      />
    </div>
  );
};

export default PieChart;
