import "babel-polyfill";
import Chart from "chart.js";

const meteoURL = "/xml.meteoservice.ru/export/gismeteo/point/140.xml";

/**
 * Получаем данные из API...
 * @returns {Promise<Document>}
 */
async function loadCurrency() {
    const response = await fetch(meteoURL);
    const xmlTest = await response.text();
    const parser = new DOMParser();
    const meteoData = parser.parseFromString(xmlTest, "text/xml");
    console.log(meteoData);
    return meteoData;
}

/**
 * Получаем лейблы для графика...
 * @param meteoData
 * @returns {Promise<Array>}
 */
async function getLabels(meteoData) {
    const forecast = meteoData.querySelectorAll("FORECAST");

    let labels = [];
    for (let i = 0; i < forecast.length; i++) {
        const item = forecast.item(i);
        let date = item.getAttribute("day");
        date += `.${item.getAttribute("month")}`;
        date += `.${item.getAttribute("year")}`;
        date += ` ${item.getAttribute("hour")}:00`;
        labels.push(date);
    }
    return labels;
}

/**
 * Создаём массив данных для графика...
 * @param meteoData
 * @returns {Promise<*[]>}
 */
async function getDatasets(meteoData) {
    const temperature = meteoData.querySelectorAll("TEMPERATURE");
    let minTemperature = [];
    let maxTemperature = [];

    for (let i = 0; i < temperature.length; i++) {
        const temperatureTag = temperature.item(i);
        const min = temperatureTag.getAttribute("min");
        const max = temperatureTag.getAttribute("max");
        minTemperature.push(min);
        maxTemperature.push(max);
    }

    const dasets = [
        {
            label: 'Минимальная температура',
            borderColor: 'blue',
            backgroundColor: 'blue',
            fill: false,
            data: minTemperature,
            yAxisID: 'y-axis-1'
        },
        {
            label: 'Максимальная температура',
            borderColor: 'red',
            backgroundColor: 'red',
            fill: false,
            data: maxTemperature,
            yAxisID: 'y-axis-2'
        }
    ];

    return dasets;
}

const buttonBuild = document.getElementById("btn");
const canvasCtx = document.getElementById("out").getContext("2d");

buttonBuild.addEventListener("click", async function () {
    const meteoData = await loadCurrency();
    const labels = await getLabels(meteoData);
    const datasets = await getDatasets(meteoData);
    const title = labels[0].split(' ');

    const chartConfig = {
        type: "line",
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            hoverMode: 'index',
            stacked: false,
            title: {
                display: true,
                text: `График температуры для модульбанка на ${title[0]}`
            },
            scales: {
                yAxes: [{
                    type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: 'left',
                    id: 'y-axis-1',
                }, {
                    type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: 'right',
                    id: 'y-axis-2',
                    // grid line settings
                    gridLines: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                }],
            }
        }
    };

    console.log(chartConfig);

    if (window.chart) {
        chart.data.labels = chartConfig.data.labels;
        chart.data.datasets = chartConfig.data.datasets;
        chart.update({
            duration: 800,
            easing: "easeOutBounce"
        });
    } else {
        window.chart = new Chart(canvasCtx, chartConfig);
    }
});
