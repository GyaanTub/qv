// Jai Shree Krishna

function RSI(ohlcData, period) {

    ohlcData = ohlcData.slice(3);

    const rsiData = [];

    // Calculate the daily price changes (Close difference)
    let gains = 0, losses = 0;
    for (let i = 1; i <= period; i++) {
        const currentClose = parseFloat(ohlcData[i].Close);
        const previousClose = parseFloat(ohlcData[i - 1].Close);
        const change = currentClose - previousClose;
        if (change > 0) gains += change;
        else losses -= change;
    }

    // Calculate the average gain and loss for the first period
    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Add the first RSI value (for the period)
    let rs = avgGain / avgLoss;
    let rsi = 100 - (100 / (1 + rs));

    // Prepare the object to push with Date and optionally Time
    let rsiDataPoint = {
        //Date: ohlcData[period - 1].Date,
        Date: ohlcData[period - 1].Price, // This is for Development Purpose Only
        Value: rsi.toFixed(2)
    };

    rsiData.push(rsiDataPoint);

    // Calculate RSI for the remaining days
    for (let i = period; i < ohlcData.length; i++) {
        const change = parseFloat(ohlcData[i].Close) - parseFloat(ohlcData[i - 1].Close);

        // Gain or loss
        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? -change : 0;

        // Update average gains and losses
        avgGain = ((avgGain * (period - 1)) + gain) / period;
        avgLoss = ((avgLoss * (period - 1)) + loss) / period;

        // Calculate RS and RSI
        rs = avgGain / avgLoss;
        rsi = 100 - (100 / (1 + rs));

        // Prepare the object to push with Date and optionally Time
        rsiDataPoint = {
            // Date: ohlcData[i].Date,
            Date: ohlcData[i].Price, // This is for Development Purposes only
            Value: rsi.toFixed(2)
        };

        rsiData.push(rsiDataPoint);
    }

    return rsiData;
}

function calculateRatios(array1, array2) {
    // Create a map for easy access to the second array values by Date
    const map2 = new Map(array2.map(item => [item.Date, item.Value]));

    // Iterate through the first array and calculate the ratio for matching dates
    const ratios = array1.map(item1 => {
        const value2 = map2.get(item1.Date);
        if (value2) {
            return {
                Date: item1.Date,
                Value: item1.Value / value2
            };
        }
    }).filter(item => item !== undefined); // Filter out any undefined results

    return ratios;
}

function MA(ohlcData, period) {
    // Ensure the period is a valid number
    if (period <= 0) {
        throw new Error("Period must be greater than 0.");
    }

    // Result array to store SMA values
    let smaValues = [];

    // Loop through the OHLC data to calculate the SMA for each point
    for (let i = period - 1; i < ohlcData.length; i++) {
        let sum = 0;

        // Sum the close prices for the given period
        for (let j = i - period + 1; j <= i; j++) {
            sum += parseFloat(ohlcData[j].Value);  // Convert 'Close' to a number
        }

        // Calculate the average (SMA) and add it to the result
        let sma = sum / period;

        // Prepare the object to push
        let smaData = {
            Date: ohlcData[i].Date,
            RS: sma
        };

        smaValues.push(smaData);
    }

    return smaValues;
}

function RM(array) {
    // Create an array to store the growth factors
    const growthFactors = [];

    // Iterate over the array starting from the second element
    for (let i = 1; i < array.length; i++) {
        const prevValue = array[i - 1].RS;
        const currentValue = array[i].RS;

        // Calculate the growth factor using the formula
        const growthFactor = ((currentValue - prevValue) / prevValue) + 1;

        // Push the result into the growthFactors array
        growthFactors.push({
            Date: array[i].Date,  // Keep the Date
            RM: growthFactor
        });
    }

    return growthFactors;
}

function merge(arrayRM, arrayRS) {
    // Create a map for easy access to RS values by Date
    const mapRS = new Map(arrayRS.map(item => [item.Date, item.RS]));

    // Merge the arrays using Date as the key
    const mergedArray = arrayRM.map(itemRM => {
        const RS = mapRS.get(itemRM.Date);  // Get the corresponding RS value

        if (RS !== undefined) {
            // Multiply RM and RS by 100 and round to 2 decimal places
            return {
                Date: itemRM.Date,
                RM: (itemRM.RM * 100).toFixed(2),
                RS: (RS * 100).toFixed(2)
            };
        }
    }).filter(item => item !== undefined); // Filter out any undefined results

    return mergedArray;
}

function generateRRG(plotarray, basearray) {

    // Calculate RSI for both arrays with a period of 14
    const rsi1 = RSI(plotarray, 14);  // RSI for plotarray
    const rsi2 = RSI(basearray, 14);  // RSI for basearray

    // Calculate the ratio between the two RSIs
    const ratio = calculateRatios(rsi1, rsi2);

    // Calculate the 14-period moving average of the ratio
    const arrayRS = MA(ratio, 14);

    // Apply some transformation to RS (RM is unclear but for now, assume it's just the RS array)
    const arrayRM = RM(arrayRS);  // You should define RM()

    // Merge the RM and RS arrays based on Date or index
    const final = merge(arrayRM, arrayRS);

    return final;
}


// Elements
const mainBtn = document.getElementById("mainBtn");
const popup = document.getElementById("popup");
const popupOverlay = document.getElementById("popupOverlay");
const closePopup = document.getElementById("closePopup");
const searchInput = document.getElementById("searchInput");
const optionsList = document.getElementById("optionsList");
const insertBtn = document.getElementById("insertBtn");
const buttonsContainer = document.getElementById("buttonsContainer");

// Open Popup
mainBtn.addEventListener("click", function () {
    // Show popup and overlay
    popup.style.display = "block";
    popupOverlay.style.display = "block";

    // Clear the search input
    searchInput.value = "";

    // Show all options again
    document.querySelectorAll("#optionsList li").forEach(li => {
        li.style.display = "block";
    });
});


// Close Popup
closePopup.addEventListener("click", function () {
    popup.style.display = "none";
    popupOverlay.style.display = "none";
});

// Debounced Search Filtering
let debounceTimeout;
searchInput.addEventListener("input", function () {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        const searchValue = searchInput.value.toLowerCase();

        // Filter the options based on the search input
        filteredOptions = allOptions.filter(option =>
            option.toLowerCase().includes(searchValue)
        ); // Reload options after filtering
    }, 300);  // 300ms debounce time
});

// Insert Button with Selected Option
insertBtn.addEventListener("click", function () {
    const selectedOption = searchInput.value;

    // 🔒 Prevent adding more than 9 instruments
    const currentCount = buttonsContainer.querySelectorAll(".btn[data-option]").length;
    if (currentCount >= 9) {
        alert("You can insert a maximum of 9 instruments.");
        return;
    }

    if (selectedOption) {
        // Check if the button with the selected option already exists
        const existingButton = buttonsContainer.querySelector(`.btn[data-option="${selectedOption}"]`);

        if (existingButton) {
            alert("This instrument is already present.");
        } else {
            // Create the new button
            const newButton = document.createElement("button");
            newButton.classList.add("btn");
            newButton.textContent = selectedOption;

            // Set the data attribute to identify the button
            newButton.setAttribute("data-option", selectedOption);

            // Create the delete button
            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-btn");
            deleteButton.textContent = "X";

            // Attach the delete functionality
            deleteButton.addEventListener("click", function () {
                buttonsContainer.removeChild(newButton);
                generateCharts();
            });

            // Append the delete button to the new button
            newButton.appendChild(deleteButton);

            // Append the new button to the container
            buttonsContainer.appendChild(newButton);

            // Close the popup after inserting
            popup.style.display = "none";
            popupOverlay.style.display = "none";
        }
    } else {
        alert("Please select or search an option.");
    }
    generateCharts();
});

// Search Filtering for manually defined <li> items
searchInput.addEventListener("input", function () {
    const searchValue = searchInput.value.toLowerCase();

    // Loop through each <li> and toggle display based on search
    document.querySelectorAll("#optionsList li").forEach(li => {
        const optionText = li.textContent.toLowerCase();
        li.style.display = optionText.includes(searchValue) ? "block" : "none";
    });
});

// Attach click event listeners to each <li> (once)
document.querySelectorAll("#optionsList li").forEach(li => {
    li.addEventListener("click", function () {
        searchInput.value = li.getAttribute("data-option");
    });
});


let base = [];
let RRG_plots;

function fetchInstArray() {
    const buttonContainer = document.getElementById("buttonsContainer");
    const buttonTexts = Array.from(buttonContainer.querySelectorAll("button"))
        .map(btn => btn.textContent.replace('X', '').trim())
        .filter(text => text !== '');
    // buttonTexts.push(stockValue);
    // console.log(buttonTexts);
    return buttonTexts
}

async function fetchDataForStocks(stockArray) {

    for (let i = 0; i < stockArray.length; i++) {
        let stockValue = stockArray[i];
        const url = `https://narad-iota.vercel.app/api/RRG?stock=${stockValue}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            stockValue = stockValue.replace(/\s/g, '');
            // console.log(stockValue);

            // Dynamically assign to global variables stock1 ... stock9
            eval(`stock_${stockValue} = data;`);

        } catch (error) {
            console.error(`Error fetching data for ${stockValue}:`, error);
            window[`stock${i + 1}`] = null; // or assign error if needed
        }
    }
}

async function fetchStockData() {

    let stockValue = stock.value;
    const url = `https://narad-iota.vercel.app/api/RRG?stock=${stockValue}`;

    try {
        const response = await fetch(url);
        const data = await response.json();  // Make sure to parse the JSON data

        // Assuming `data` is an array of objects
        base = data;
        // console.log(base);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function generateRRGdatas(stockArray, base) {

    let dataPoint = {};

    for (let i = 0; i < stockArray.length; i++) {
        let stockValue = stockArray[i];
        stockValue = stockValue.replace(/\s/g, ''); // Remove any whitespace
        stockValue = "stock_" + stockValue; // Add prefix to stock value

        // Store the RRG data directly into RRGData object
        eval(`RRGData = generateRRG(${stockValue}, base);`) // Store RRG data using index i

        //console.log(RRGData);

        // Map the RRG data to create dataPoints and store them in dataPoints object
        dataPoints = RRGData.map(item => ({
            x: parseFloat(item.RS),
            y: parseFloat(item.RM),
            date: new Date(item.Date)
        }));

        // Slice the data to get the last 15 points for each stock
        dataPoint[i] = dataPoints.slice(-15);
    }

    return dataPoint
}


const verticalAtX = 100;
const horizontalAtY = 100;

const quadrantPlugin = {
    id: 'quadrantPlugin',
    beforeDraw(chart) {
        const { ctx, chartArea, scales: { x, y } } = chart;
        const { top, bottom, left, right } = chartArea;

        const xPixel = x.getPixelForValue(verticalAtX);
        const yPixel = y.getPixelForValue(horizontalAtY);

        const colors = [
            '#ffe6e6', // Top-Left
            '#e6f7ff', // Top-Right
            '#fffbe6', // Bottom-Left
            '#e6ffe6'  // Bottom-Right
        ];

        // Top-left
        ctx.fillStyle = colors[0];
        ctx.fillRect(left, top, xPixel - left, yPixel - top);

        // Top-right
        ctx.fillStyle = colors[1];
        ctx.fillRect(xPixel, top, right - xPixel, yPixel - top);

        // Bottom-left
        ctx.fillStyle = colors[2];
        ctx.fillRect(left, yPixel, xPixel - left, bottom - yPixel);

        // Bottom-right
        ctx.fillStyle = colors[3];
        ctx.fillRect(xPixel, yPixel, right - xPixel, bottom - yPixel);
    },
    afterDraw(chart) {
        const { ctx, chartArea, scales: { x, y } } = chart;
        const { top, bottom, left, right } = chartArea;

        const xPixel = x.getPixelForValue(verticalAtX);
        const yPixel = y.getPixelForValue(horizontalAtY);

        // Draw vertical and horizontal lines
        ctx.beginPath();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 1.5;

        // Vertical line
        ctx.moveTo(xPixel, top);
        ctx.lineTo(xPixel, bottom);

        // Horizontal line
        ctx.moveTo(left, yPixel);
        ctx.lineTo(right, yPixel);

        ctx.stroke();
        ctx.setLineDash([]);
    }
};

// Function to generate a random color from a list
function getRandomColor(i) {
    const colors = ['red', 'green', 'blue'];  // List of possible colors in order
    return colors[i % 3];  // Return the color based on the remainder of i divided by 3
}


async function generateCharts() {

    document.getElementById("contentFrame").style.display = "block";

    Object.values(Chart.instances).forEach(chart => {
        chart.destroy();
    });

    await fetchStockData();
    const stockArray = fetchInstArray();
    await fetchDataForStocks(stockArray);

    dataPoints = await generateRRGdatas(stockArray, base);

    let jsonArray = []

    for (let i = 0; i < stockArray.length; i++) {
        let stockValue = stockArray[i];

        let lineObject = {
            label: `${stockValue}`,
            data: dataPoints[i],
            type: 'line',
            borderColor: getRandomColor(i),
            fill: false,
            tension: 0.4,
            pointRadius: 6,
            borderWidth: 1,
            backgroundColor: function (context) {
                // Use the same color for the background as the border color
                return context.dataset.borderColor;
            },
        };

        // Push the objects into the jsonArray
        jsonArray.push(lineObject);
    }

    var ctx = document.getElementById('myChart').getContext('2d');

    var myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: jsonArray
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        title: function (tooltipItems) {
                            // Here, you can return a custom title for the tooltip
                            var date = tooltipItems[0].raw.date;
                            var dateString = date.toLocaleDateString(); // Format the date as needed
                            return `Date: ${dateString}`; // Set custom title
                        },
                        label: function (tooltipItem) {
                            var date = tooltipItem.raw.date;
                            var dateString = date.toLocaleDateString(); // Format date to show in label
                            var x = tooltipItem.raw.x;  // Get x value
                            var y = tooltipItem.raw.y;  // Get y value
                            return `RS: ${x}, RM: ${y}`; // Show x, y and date
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'RS'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'RM'
                    }
                }
            }
        },
        plugins: [quadrantPlugin]
    });

    document.getElementById("contentFrame").style.display = "none";

}