// Jai Shree Krishna

const crownSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-yellow-500 ml-2 premium-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 16L3 5l5 5 4-6 4 6 5-5-2 11H5zm0 2h14v2H5v-2z"/>
            </svg>
        `;

function attachPremiumIconsAndClickHandlers() {
    // #Jai Shree Krishna
    document.querySelectorAll('li[data-premium-symbol="true"]').forEach(li => {
        li.classList.add('flex', 'justify-between', 'items-center');

        if (!li.querySelector('.premium-icon')) {
            li.insertAdjacentHTML('beforeend', crownSVG);
        }

        li.addEventListener('click', (e) => {
            if (!e.target.classList.contains('upgrade-btn')) {
                showPremiumModal();
            }
        });
    });
}

attachPremiumIconsAndClickHandlers();

function filterStocks() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let stockListItems = document.querySelectorAll("#stockList li");

    requestAnimationFrame(() => {
        stockListItems.forEach((item) => {
            const stockName = item.textContent.toLowerCase();
            item.style.display = stockName.includes(input) ? "" : "none";
        });
    });
}

function loadStock(element, stockName) {
    document.querySelectorAll("li").forEach(li => {
        li.style.fontWeight = "normal";
    });

    element.style.fontWeight = "bold";

    createChart(stockName);
}

function showPremiumModal() {
    document.getElementById('premiumModal').classList.remove('hidden');
}

function closePremiumModal() {
    document.getElementById('premiumModal').classList.add('hidden');
}

let labels_2025, labels_2024, labels_2023, labels_2022, labels_2021, labels_2020, labels_SC, labels_MC;
let open_2025, open_2024, open_2023, open_2022, open_2021, open_2020, open_SC, open_MC;
let close_2025, close_2024, close_2023, close_2022, close_2021, close_2020, close_SC, close_MC;

let seac = null;
let stock;

function fetchData(realValue) {

    // console.log(realValue);
    let stockValue = encodeURIComponent(realValue);

    return new Promise((resolve, reject) => {
        fetch(`https://narad-iota.vercel.app/api/seasonality?stock=${stockValue}&year=2020`)
            .then(response => response.json())
            .then(data => {
                // Prepare the data for the chart
                labels_2020 = data.map(item => item.Date);  // Extract Date
                open_2020 = data.map(item => item.Open === 0 ? null : item.Open);  // Extract Open prices
                close_2020 = data.map(item => item.Close === 0 ? null : item.Close);  // Extract Close prices
            })
            .catch(error => {
                console.error(error);
            });
        fetch(`https://narad-iota.vercel.app/api/seasonality?stock=${stockValue}&year=2021`)
            .then(response => response.json())
            .then(data => {
                // Prepare the data for the chart
                labels_2021 = data.map(item => item.Date);  // Extract Date
                open_2021 = data.map(item => item.Open === 0 ? null : item.Open);  // Extract Open prices
                close_2021 = data.map(item => item.Close === 0 ? null : item.Close);  // Extract Close prices
            })
            .catch(error => {
                console.error(error);
            });
        fetch(`https://narad-iota.vercel.app/api/seasonality?stock=${stockValue}&year=2022`)
            .then(response => response.json())
            .then(data => {
                // Prepare the data for the chart
                labels_2022 = data.map(item => item.Date);  // Extract Date
                open_2022 = data.map(item => item.Open === 0 ? null : item.Open);  // Extract Open prices
                close_2022 = data.map(item => item.Close === 0 ? null : item.Close);  // Extract Close prices
            })
            .catch(error => {
                console.error(error);
            });
        fetch(`https://narad-iota.vercel.app/api/seasonality?stock=${stockValue}&year=2023`)
            .then(response => response.json())
            .then(data => {
                // Prepare the data for the chart
                labels_2023 = data.map(item => item.Date);  // Extract Date
                open_2023 = data.map(item => item.Open === 0 ? null : item.Open);  // Extract Open prices
                close_2023 = data.map(item => item.Close === 0 ? null : item.Close);  // Extract Close prices
            })
            .catch(error => {
                console.error(error);
            });
        fetch(`https://narad-iota.vercel.app/api/seasonality?stock=${stockValue}&year=2024`)
            .then(response => response.json())
            .then(data => {
                // Prepare the data for the chart
                labels_2024 = data.map(item => item.Date);  // Extract Date
                open_2024 = data.map(item => item.Open === 0 ? null : item.Open);  // Extract Open prices
                close_2024 = data.map(item => item.Close === 0 ? null : item.Close);  // Extract Close prices
            })
            .catch(error => {
                console.error(error);
            });
        fetch(`https://narad-iota.vercel.app/api/seasonality?stock=${stockValue}&year=2025`)
            .then(response => response.json())
            .then(data => {
                // Prepare the data for the chart
                labels_2025 = data.map(item => item.Date);  // Extract Date
                open_2025 = data.map(item => item.Open === 0 ? null : item.Open);  // Extract Open prices
                close_2025 = data.map(item => item.Close === 0 ? null : item.Close);  // Extract Close prices
            })
            .catch(error => {
                console.error(error);
            });
    });
}

function plotStockData(labels_2025, close_2020, close_2021, close_2022, close_2023, close_2024, close_2025) {
    // Prepare the stock data
    let stockData = {
        labels: labels_2025, // Dates or Time Points
        datasets: [
            {
                label: '2020',
                borderColor: 'rgb(255, 99, 132)',
                data: close_2020,
                fill: false,
                tension: 0.1,
            },
            {
                label: '2021',
                borderColor: 'rgb(54, 162, 235)',
                data: close_2021,
                fill: false,
                tension: 0.1,
            },
            {
                label: '2022',
                borderColor: 'rgb(75, 192, 192)',
                data: close_2022,
                fill: false,
                tension: 0.1,
            },
            {
                label: '2023',
                borderColor: 'rgb(255, 99, 132)',
                data: close_2023,
                fill: false,
                tension: 0.1,
            },
            {
                label: '2024',
                borderColor: 'rgb(54, 162, 235)',
                data: close_2024,
                fill: false,
                tension: 0.1,
            },
            {
                label: '2025',
                borderColor: 'rgb(75, 192, 192)',
                data: close_2025,
                fill: false,
                tension: 0.1,
            }
        ]
    };

    // Chart configuration
    let seac_config = {
        type: 'line',
        data: stockData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price'
                    }
                }
            }
        }
    };

    // Render the chart
    const seac_ctx = document.getElementById('seacChart').getContext('2d');
    new Chart(seac_ctx, seac_config);
}

function createChart(stockName) {

    stock = stockName;
    // console.log(stock);

    document.getElementById('contentFrame').style.display = 'block';
    document.getElementById('seacChart').style.display = 'none';

    Object.values(Chart.instances).forEach(chart => {
        chart.destroy();
    });

    // Changing chart to view mode
    document.getElementById('seacChart').style.display = 'none';

    fetchData(stockName);

    // Fetching all data and storing it
    setTimeout(function () {
        plotStockData(labels_2024, close_2020, close_2021, close_2022, close_2023, close_2024, close_2025);
        document.getElementById('seacChart').style.display = 'block';
        document.getElementById('contentFrame').style.display = 'none';
    }, 2000);


}

function redirectToBacktest() {
    if (stock === "" || stock === "undefined" || stock === undefined) {
        const url = `https://sankhya-six.vercel.app/`;
        window.location.href = url;
    } else {
        const url = `https://sankhya-six.vercel.app/seac?stock=${stock}`;
        window.location.href = url;
    }
}