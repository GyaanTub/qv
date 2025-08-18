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

// Function to fill missing months with value 0 for each year
function fillMissingMonths(data) {
    const years = Array.from(new Set(data.map(item => item.year)));

    years.forEach(year => {
        const existingMonths = data.filter(item => item.year === year).map(item => item.month);

        for (let month = 1; month <= 12; month++) {
            if (!existingMonths.includes(month)) {
                data.push({ year: year, month: month, value: 0 });
            }
        }
    });

    return data;
}

// Function to populate the heatmap based on an array of {year, month, value}
function generateHeatmap(data, container) {

    // Fill missing months with value 0
    data = fillMissingMonths(data);

    // Get max and min values from the data array
    let maxValue = Math.max(...data.map(item => item.value));
    let minValue = Math.min(...data.map(item => item.value));

    // Determine the range of years
    const years = data.map(item => item.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    // Set grid-template-rows dynamically based on the number of years
    const rowCount = maxYear - minYear + 1; // number of rows equals the number of years
    container.style.gridTemplateRows = `repeat(${rowCount}, 50px)`;

    // Loop through the data array to create boxes
    data.forEach(item => {
        const { year, month, value } = item;

        // Calculate grid positions
        const x = month;  // Months (1-12) -> gridColumn (1-12)
        const y = year - minYear; // For example, the first year in data maps to row 0

        // Create the box
        const box = document.createElement('div');
        box.classList.add('heatmap-box');

        // Determine color and alpha based on value
        let color = getColorBasedOnValue(value, maxValue, minValue);

        // Set the background color with the calculated alpha
        box.style.backgroundColor = color;

        // Create and append tooltip
        const tooltip = document.createElement('div');
        tooltip.classList.add('tooltip');
        tooltip.innerHTML = `Year: ${year}<br>Month: ${getMonthName(month)}<br>Value: ${value.toFixed(2)}`;
        box.appendChild(tooltip);

        // Set box position in the grid using x and y
        box.style.gridColumnStart = x;
        box.style.gridRowStart = y + 1;

        // Hover interaction: Show tooltip on hover
        box.addEventListener('mousemove', (e) => {
            const boxRect = box.getBoundingClientRect();
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const tooltipX = mouseX + 10;
            const tooltipY = mouseY + 10;

            tooltip.style.left = `${tooltipX - boxRect.left}px`;
            tooltip.style.top = `${tooltipY - boxRect.top}px`;
            tooltip.style.visibility = 'visible';
        });

        // Mouse leave interaction: Hide tooltip
        box.addEventListener('mouseout', () => {
            tooltip.style.visibility = 'hidden';
        });

        container.appendChild(box);
    });

    // Add the year labels to the first column
    for (let i = minYear; i <= maxYear; i++) {
        const yearLabel = document.createElement('div');
        yearLabel.classList.add('year-label');
        yearLabel.textContent = i;

        // Center the year label within the first column using flexbox
        yearLabel.style.display = 'flex';
        yearLabel.style.justifyContent = 'center';
        yearLabel.style.alignItems = 'center';
        yearLabel.style.height = '50px'; // Ensure the year label takes the correct height

        container.appendChild(yearLabel);
    }

    // Create month labels at the top
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthLabels.forEach(month => {
        const label = document.createElement('div');
        label.style.textAlign = 'center';
        label.textContent = month;
        container.appendChild(label);
    });


}

// Helper function to get the color based on the value
function getColorBasedOnValue(value, maxValue, minValue) {
    let color;
    if (value > 0) {
        color = `rgba(0, 255, 0, ${Math.abs(value) / maxValue})`; // Green color
    } else {
        color = `rgba(255, 0, 0, ${Math.abs(value) / Math.abs(minValue)})`; // Red color
    }
    return color;
}

// Helper function to get the month name from the month number (1-12)
function getMonthName(month) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
}

async function fetchStockData(stockValue) {

    let stockData;

    const url = `https://narad-iota.vercel.app/api/1d?stock=${stockValue}`;

    try {
        const response = await fetch(url);
        const data = await response.json();  // Make sure to parse the JSON data

        // Assuming `data` is an array of objects
        stockData = data;
        // console.log(stockData);

    } catch (error) {
        console.error('Error fetching data:', error);
    }

    return stockData
}

async function calculateMonthlyVolatility(stockData) {
    // Create an object to store volatilities by year and month
    const volatilityByMonth = {};

    // Loop through each entry and calculate volatility (High - Low)
    stockData.forEach(item => {
        const { Date: date, High, Low } = item;
        const volatility = (parseFloat(High) - parseFloat(Low)) / parseFloat(High);

        // Parse the year and month from the date
        const [year, month] = date.split('-');

        // Convert year and month to numbers to avoid quotes
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);

        // Create a key for the year-month combination
        const yearMonthKey = `${yearNum}-${monthNum}`;

        // If the key doesn't exist, initialize it
        if (!volatilityByMonth[yearMonthKey]) {
            volatilityByMonth[yearMonthKey] = { totalVolatility: 0, count: 0 };
        }

        // Add the volatility to the corresponding year-month key
        volatilityByMonth[yearMonthKey].totalVolatility += volatility;
        volatilityByMonth[yearMonthKey].count += 1;
    });

    // Create an array to store the result in the desired format
    const averageVolatilityArray = [];

    for (let key in volatilityByMonth) {
        const { totalVolatility, count } = volatilityByMonth[key];
        const [year, month] = key.split('-');
        const averageVolatility = totalVolatility / count;

        // Add the result as an object to the array with numbers for year and month
        averageVolatilityArray.push({
            year: parseInt(year),  // Year as number
            month: parseInt(month), // Month as number
            value: averageVolatility
        });
    }

    // Return the array of average volatilities
    return averageVolatilityArray;
}

async function createChart(stockName) {

    // Changing chart to view mode
    const container = document.getElementById('heatbox');
    container.style.display = 'none';
    container.innerHTML = "";
    document.getElementById('contentFrame').style.display = 'block';

    let stockData = await fetchStockData(stockName);
    // console.log(stockData);

    let volData = await calculateMonthlyVolatility(stockData);
    // console.log(volData);

    setTimeout(function () {
        generateHeatmap(volData, container);
    }, 1500);

    // Fetching all data and storing it
    setTimeout(function () {
        container.style.display = 'grid';
        document.getElementById('contentFrame').style.display = 'none';
    }, 1500);


}
