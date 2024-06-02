import React from "react";
import ApexCharts from "react-apexcharts";
import "flowbite";

const DonutChart = ({ title, chartData }) => {
  const options = {
    series: chartData.map((data) => data.data),
    colors: ["#7E3AF2", "#4533a9"],
    chart: {
      height: 400,
      width: "100%",
      type: "donut",
    },
    stroke: {
      colors: ["transparent"],
      lineCap: "",
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontFamily: "Inter, sans-serif",
              offsetY: 20,
            },
            total: {
              showAlways: true,
              show: true,
              label: "Total Applicants",
              fontFamily: "Inter, sans-serif",
              formatter: function (w) {
                const sum = w.globals.seriesTotals.reduce((a, b) => {
                  return a + b;
                }, 0);
                return sum;
              },
            },
            value: {
              show: true,
              fontFamily: "Inter, sans-serif",
              offsetY: -20,
              formatter: function (value) {
                return value;
              },
            },
          },
          dataLabels: {
            enabled: true,
            offsetY: 20,
            // style: {
            //   fontFamily: "Inter, sans-serif",
            // },
          },
          size: "70%",
        },
      },
    },
    // plotOptions: {
    //   pie: {
    //     donut: {
    //       labels: {
    //         show: true,
    //         name: {
    //           show: true,
    //           fontFamily: "Inter, sans-serif",
    //           offsetY: 20,
    //         },

    //       },
    //       size: "100%",
    //       dataLabels: {
    //         offsetY: 20,
    //       },
    //     },
    //   },
    // },
    labels: chartData.map((data) => data.name),

    legend: {
      position: "right",
      fontFamily: "Inter, sans-serif",
    },
  };

  return (
    <div className=" w-full bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6">
      <h1 className="text-md font-semibold leading-none text-purple-600 dark:text-white pe-1">
        {title}
      </h1>
      <ApexCharts
        options={options}
        series={options.series}
        type="donut"
        height={250}
      />
    </div>
  );
};

export default DonutChart;
