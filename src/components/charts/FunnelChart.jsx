import React from "react";
import ApexCharts from "react-apexcharts";
import "flowbite";

const FunnelChart = ({ title, chartData }) => {
  const total = chartData.reduce((acc, data) => acc + data.data, 0);
  const options = {
    colors: ["#5521B5", "#6C2BD9", "#7E3AF2", "#9061F9", "#AC94FA", "#CABFFD"],
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        // columnWidth: "55%",
        barHeight: "80%",
        borderRadius: 8,
        isFunnel: true,
        distributed: true,
        // color: "#7E3AF2",
      },
    },
    dataLabels: {
      enabled: true,
      // formatter: function (val, opt) {
      //   return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val;
      // },
      formatter: function (val, opt) {
        // Calculate the percentage
        const percentage = ((val / total) * 100).toFixed(1);
        return (
          opt.w.globals.labels[opt.dataPointIndex] + ":  " + `${percentage}%`
        );
      },
      dropShadow: {
        enabled: false,
      },
    },
    // stroke: {
    //   show: true,
    //   width: 2,
    //   colors: ["transparent"],
    // },
    xaxis: {
      enabled: false,
      categories: chartData.map((data) => data.name),
      // categories: ["Applied", "Review", "Interview", "Hire"],
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
      name: "Application",
      data: chartData.map((data) => data.data),
    },
  ];

  return (
    <div className="font-body w-full bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6">
      <h1>{title}</h1>
      <ApexCharts options={options} series={series} type="bar" height={350} />
    </div>
  );
};

export default FunnelChart;
