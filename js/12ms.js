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

            document.getElementById('contentFrame').style.display = 'block';

            element.style.fontWeight = "bold";

            buildHeatmap(stockName);

            setTimeout(function () {
                document.getElementById('contentFrame').style.display = 'none';
            }, 1500);
        }

        function showPremiumModal() {
            document.getElementById('premiumModal').classList.remove('hidden');
        }

        function closePremiumModal() {
            document.getElementById('premiumModal').classList.add('hidden');
        }

        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const dayLabels = document.querySelector('.day-labels');
        for (let i = 1; i <= 31; i++) {
            const div = document.createElement('div');
            div.textContent = i;
            dayLabels.appendChild(div);
        }

        const monthLabels = document.querySelector('.month-labels');
        months.forEach(month => {
            const div = document.createElement('div');
            div.textContent = month;
            monthLabels.appendChild(div);
        });

        const heatmap = document.querySelector('.heatmap-container');
        const tooltip = document.getElementById('tooltip');

        // Get today's date (you can hardcode for testing)
        const today = new Date();  // July 10, 2025 (month 6 because 0-based)
        // Calculate start date = first day of month *after* today's month last year
        // So if today is July 10 2025, start from Aug 1, 2024
        const startYear = today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear() - 1;
        const startMonth = (today.getMonth() + 1) % 12; // next month (July=6, next=7 for August)
        const startDate = new Date(startYear, startMonth, 1);

        // End date = today
        const endDate = today;

        // Helper to format YYYY-MM-DD string
        function formatDate(d) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }

        // Filter months to only those between startDate and endDate inclusive
        // We'll create a months array in order from startDate to endDate, max 12 months
        function monthsInRange(start, end) {
            const result = [];
            let dt = new Date(start.getFullYear(), start.getMonth(), 1);
            while (dt <= end) {
                result.push({ year: dt.getFullYear(), month: dt.getMonth() });
                dt.setMonth(dt.getMonth() + 1);
            }
            return result;
        }

        // Fetch data and build heatmap
        async function buildHeatmap(stockValue) {
            // Fetch API data
            const response = await fetch(`https://narad-iota.vercel.app/api/1d?stock=${stockValue}`);
            const rawData = await response.json();

            // Filter data by date range (only between startDate and endDate)
            const filteredData = rawData.filter(d => {
                const dt = new Date(d.Date);
                return dt >= startDate && dt <= endDate;
            });

            // Index data by YYYY-MM-DD for quick lookup
            const dataByDate = {};
            filteredData.forEach(d => {
                dataByDate[d.Date] = d;
            });

            // Build months array from startDate to endDate (max 12 months)
            const monthsRange = monthsInRange(startDate, endDate);

            // Update month labels with filtered months
            monthLabels.innerHTML = '';
            monthsRange.forEach(({ year, month }) => {
                const div = document.createElement('div');
                div.textContent = months[month] + ' ' + year;
                monthLabels.appendChild(div);
            });

            // Clear heatmap container
            heatmap.innerHTML = '';

            // Build heatmap cells for each month and each day (1-31)
            monthsRange.forEach(({ year, month }, monthIndex) => {
                for (let day = 1; day <= 31; day++) {
                    const box = document.createElement('div');
                    box.classList.add('heatmap-box');

                    // Format date string for lookup
                    const dayStr = String(day).padStart(2, '0');
                    const monthStr = String(month + 1).padStart(2, '0');
                    const dateStr = `${year}-${monthStr}-${dayStr}`;

                    // Assign ID to cell
                    box.id = `${months[month]}-${dayStr}-${year}`;

                    // Check if date is valid (handle months with fewer than 31 days)
                    const checkDate = new Date(year, month, day);
                    if (checkDate.getMonth() !== month) {
                        // Invalid day for this month, color as light gray and disable tooltip
                        box.style.backgroundColor = '#ddd';
                        box.style.cursor = 'default';
                        heatmap.appendChild(box);
                        continue;
                    }

                    const item = dataByDate[dateStr];

                    if (item) {
                        const open = parseFloat(item.Open);
                        const close = parseFloat(item.Close);
                        const pctChange = ((close - open) / close) * 100;

                        // Color: green for positive, red for negative, intensity by abs pctChange up to 5%
                        const opacity = Math.min(Math.abs(pctChange) / 5, 1);
                        if (pctChange > 0) {
                            box.style.backgroundColor = `rgba(0, 200, 0, ${opacity})`;
                        } else if (pctChange < 0) {
                            box.style.backgroundColor = `rgba(200, 0, 0, ${opacity})`;
                        } else {
                            box.style.backgroundColor = '#e0e0e0';
                        }

                        box.addEventListener('mousemove', e => {
                            tooltip.innerHTML =
                                `Date: ${item.Date}<br>` +
                                `Open: ${open.toFixed(2)}<br>` +
                                `Close: ${close.toFixed(2)}<br>` +
                                `Change: ${pctChange.toFixed(2)}%`;
                            tooltip.style.display = 'block';
                            tooltip.style.left = (e.pageX + 10) + 'px';
                            tooltip.style.top = (e.pageY + 10) + 'px';
                        });
                        box.addEventListener('mouseleave', () => {
                            tooltip.style.display = 'none';
                        });
                    } else {
                        // No data for this valid date — show black
                        box.style.backgroundColor = 'black';
                    }

                    heatmap.appendChild(box);
                }
            });
        }
