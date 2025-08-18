// Jai Shree Krishna
// Fetch stock data from the API
async function fetchStockData(stockSymbol) {
    try {
        const response = await fetch(`https://narad-iota.vercel.app/api/1d?stock=${stockSymbol}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching stock data:", error);
        return null;
    }
}

// Process stock data: extract closing prices and dates
function processStockData(data) {
    const limitedData = data.slice(-200);
    const prices = [];
    const dates = [];

    limitedData.forEach(item => {
        const date = new Date(item.Date);
        const closePrice = parseFloat(item.Close);

        dates.push(date);
        prices.push(closePrice);
    });

    return { dates, prices };
}

// Pearson correlation calculation
function pearsonCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return numerator / denominator;
}

// Calculate rolling correlation for the given stock data with a window size of 30 days
function rollingCorrelation(stock1Prices, stock2Prices, windowSize = 30) {
    const rollingCorrelations = [];

    for (let i = 0; i <= stock1Prices.length - windowSize; i++) {
        const window1 = stock1Prices.slice(i, i + windowSize);
        const window2 = stock2Prices.slice(i, i + windowSize);

        const correlation = pearsonCorrelation(window1, window2);
        rollingCorrelations.push(correlation);
    }

    return rollingCorrelations;
}

// Main function to get stock data and calculate rolling correlation
async function getStockData() {

    Object.values(Chart.instances).forEach(chart => {
        chart.destroy();
    });

    document.getElementById('contentFrame').style.display = 'block';

    const stock1Value = document.getElementById('stock1').value;
    const stock2Value = document.getElementById('stock2').value;

    if (stock1Value == "" || stock2Value == "") {
        alert("Please Select Stocks.");
        return;
    }

    const stock1Data = await fetchStockData(stock1Value);
    const stock2Data = await fetchStockData(stock2Value);

    if (!stock1Data || !stock2Data) {
        console.error("Data for one or both stocks is unavailable.");
        return;
    }

    const stock1 = processStockData(stock1Data);
    const stock2 = processStockData(stock2Data);

    const rollingCorrelations = rollingCorrelation(stock1.prices, stock2.prices);

    // Charting the rolling correlation
    const ctx = document.getElementById('myChart').getContext('2d');
    const rollingCorrelationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: stock1.dates.slice(29),  // Use dates from the 30th entry (because windowSize = 30)
            datasets: [{
                label: 'Rolling Correlation (30 Days)',
                data: rollingCorrelations,
                borderColor: 'rgba(37, 99, 235, 1)',
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'PP'
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    min: -1,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Correlation Coefficient'
                    }
                }
            }
        }
    });

    document.getElementById('contentFrame').style.display = 'none';
}

function plotData() {
    getStockData();
}