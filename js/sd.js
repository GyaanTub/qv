// Jai Shree Krishna

// Fetch the data for the two stocks
async function fetchStockData(stockSymbol) {
    try {
        const response = await fetch(`https://narad-iota.vercel.app/api/1d?stock=${stockSymbol}`);
        const data = await response.json();  // Parse the response as JSON
        return data;
    } catch (error) {
        console.error("Error fetching stock data:", error);
        return null;  // In case of error, return null
    }
}

// Process and extract closing prices and dates from the stock data, limiting to the last 200 points
function processStockData(data) {
    // Limit the data to the last 200 points
    const limitedData = data.slice(-200);

    const prices = [];
    const dates = [];

    // Loop through each item in the data
    limitedData.forEach(item => {
        const date = new Date(item.Date);  // Convert date to a Date object
        const closePrice = parseFloat(item.Close);  // Convert closing price to float

        // Push the date and closing price to the arrays
        dates.push(date);
        prices.push(closePrice);
    });

    return { dates, prices };
}

// Create scatter plot with the data
async function createChart() {

    document.getElementById('contentFrame').style.display = 'block';

    Object.values(Chart.instances).forEach(chart => {
        chart.destroy();
    });

    let stock1Value = document.getElementById('stock1').value;
    let stock2Value = document.getElementById('stock2').value;

    if (stock1Value == "" || stock2Value == "") {
        alert("Please Select Stocks.")
        return
    }
    const stock1Data = await fetchStockData(stock1Value);
    const stock2Data = await fetchStockData(stock2Value);

    if (!stock1Data || !stock2Data) {
        console.error("Data for one or both stocks is unavailable");
        return;
    }

    const stock1 = processStockData(stock1Data);
    const stock2 = processStockData(stock2Data);

    // Combine the data for scatter plot (Stock1's prices on X, Stock2's prices on Y)
    const data = {
        datasets: [
            {
                label: 'Scatter Plot',
                data: stock1.prices.map((price, index) => ({
                    x: price,
                    y: stock2.prices[index],
                    date: stock1.dates[index].toLocaleDateString()  // Add date to the data point
                })),
                backgroundColor: 'rgba(37, 99, 235, 0.5)',  // Semi-transparent color
                borderColor: 'rgba(37, 99, 235, 1)',  // Solid border color
                borderWidth: 1
            }
        ]
    };

    const config = {
        type: 'scatter',
        data: data,
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: `${stock1Value}`,
                    },
                    ticks: {
                        beginAtZero: true
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: `${stock2Value}`,
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        // Customize the tooltip to show date, stock 1 price, and stock 2 price
                        label: function (tooltipItem) {
                            const date = tooltipItem.raw.date;  // Get the date from the data point
                            return `Date: ${date}`;
                        }
                    }
                }
            }
        }
    };

    // Render the chart
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, config);

    document.getElementById('contentFrame').style.display = 'none';
}


function plotData() {
    createChart();
}
