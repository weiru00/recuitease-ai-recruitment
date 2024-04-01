import React from "react";
import ApexCharts from "react-apexcharts";
import "flowbite";

const BarChart = () => {
  // Chart options
  const options = {
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
      ],
    },
    yaxis: {
      title: {
        text: "Units",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " units";
        },
      },
    },
  };

  // Chart series data
  const series = [
    {
      name: "Sales",
      data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
    },
  ];

  return (
    <ApexCharts options={options} series={series} type="bar" height={350} />
  );
};

export default BarChart;
