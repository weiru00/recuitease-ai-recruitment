import React, { useEffect } from "react";
import ApexCharts from "apexcharts";

const BarChart = ({ title, chartData }) => {
  const series = [
    {
      name: "Data",
      data: chartData.map((data) => data.data),
    },
  ];
  const labels = chartData.map((data) => data.name);

  const getChartOptions = () => {
    return {
      series: series,
      colors: [
        "#7E3AF2",
        "#9d3af2",
        "#5529a9",
        "#dfcfff",
        "#c09eff",
        "#4533a9",
      ],
      chart: {
        height: 500,
        width: 700,
        type: "bar",
        fontFamily: "Inter, sans-serif",
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: "50%",
          borderRadius: 12,
          distributed: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      grid: {
        show: false,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: -23,
          bottom: -20,
        },
      },
      xaxis: {
        categories: labels,
        labels: {
          show: false,
          style: {
            cssClass: "text-md font-normal fill-gray-500 dark:fill-gray-400",
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        show: true,
        labels: {
          style: {
            cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        show: true,
        position: "bottom",
        fontFamily: "Inter, sans-serif",
        markers: {
          width: 12,
          height: 12,
          strokeWidth: 0,
          strokeColor: "#fff",
          radius: 12, // Makes the icon rounded-full
        },
        itemMargin: {
          horizontal: 5,
          vertical: 10, // Adds top (and bottom) margin
        },
      },

      tooltip: {
        enabled: true,
        x: {
          show: true,
        },
        y: {
          formatter: function (val) {
            return val + " applicants";
          },
        },
      },
    };
  };

  useEffect(() => {
    const chartElement = document.getElementById("column-chart");
    if (chartElement && typeof ApexCharts !== "undefined") {
      const chart = new ApexCharts(chartElement, getChartOptions());
      chart.render();

      // Cleanup function to destroy the chart when the component unmounts
      return () => {
        chart.destroy();
      };
    }
  }, [chartData]);

  return (
    <div className="w-full h-full bg-white rounded-lg shadow dark:bg-gray-800 py-7 px-10">
      <div className="flex justify-between mb-3">
        <div className="flex items-center">
          <div className="flex justify-center items-center">
            <h5 className="text-lg font-semibold leading-none text-purple-600 dark:text-white pe-1">
              {title}
            </h5>

            <div
              data-popover
              id="chart-info"
              role="tooltip"
              className="absolute z-10 invisible inline-block text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 w-72 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
            >
              <div data-popper-arrow></div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
        <div className="grid grid-cols-3 gap-3 mb-2">
          <dl className="bg-purple-600 bg-opacity-50 rounded-lg flex flex-col items-center justify-center h-[78px]">
            <dt className="w-8 h-8 rounded-full bg-purple-600 bg-opacity-60 text-orange-600 text-sm font-medium flex items-center justify-center mb-1">
              12
            </dt>
            <dd className="text-orange-600 text-sm font-medium">Applied</dd>
          </dl>
          <dl className="bg-teal-50 bg-opacity-50 rounded-lg flex flex-col items-center justify-center h-[78px]">
            <dt className="w-8 h-8 rounded-full bg-teal-100 bg-opacity-60 text-teal-600 text-sm font-medium flex items-center justify-center mb-1">
              23
            </dt>
            <dd className="text-teal-600 text-sm font-medium">Review</dd>
          </dl>
          <dl className="bg-blue-50 bg-opacity-50 rounded-lg flex flex-col items-center justify-center h-[78px]">
            <dt className="w-8 h-8 rounded-full bg-blue-100 bg-opacity-60 text-blue-600 text-sm font-medium flex items-center justify-center mb-1">
              64
            </dt>
            <dd className="text-blue-600 text-sm font-medium">Interview</dd>
          </dl>
        </div>
      </div> */}

      <div className="py-4" id="column-chart"></div>
    </div>
  );
};

export default BarChart;
