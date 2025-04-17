document.addEventListener("DOMContentLoaded", () => {
  const spinner = document.getElementById("spinner");
  const dashboard = document.getElementById("dashboard");

  setTimeout(() => {
    spinner.classList.add("hidden");
    dashboard.classList.remove("hidden");
  }, 2000);

  const apiUrl = "https://api.coingecko.com/api/v3/coins/";
  let chart;

  async function fetchCryptoData(crypto) {
    try {
      const response = await fetch(`${apiUrl}${crypto}`);
      if (!response.ok) throw new Error("Failed to fetch general data");

      const data = await response.json();

      document.getElementById("crypto-name").textContent = data.name;
      document.getElementById(
        "current-price"
      ).textContent = `$${data.market_data.current_price.usd}`;
      document.getElementById(
        "market-price"
      ).textContent = `$${data.market_data.current_price.usd}`;
      document.getElementById(
        "market-cap"
      ).textContent = `$${data.market_data.market_cap.usd}`;

      // Fetch historical market data for the last 7 days
      const historyResponse = await fetch(
        `${apiUrl}${crypto}/market_chart?vs_currency=usd&days=7`
      );
      if (!historyResponse.ok) throw new Error("Failed to fetch history data");

      const historyData = await historyResponse.json();

      const prices = historyData.prices.map((entry) => entry[1]);
      const timestamps = historyData.prices.map((entry) => {
        const date = new Date(entry[0]);
        return `${date.getDate()}-${date.getMonth() + 1}`;
      });

      if (!chart) {
        chart = new ApexCharts(document.querySelector("#chart"), {
          chart: {
            type: "area",
            height: 350,
            zoom: {
              enabled: true,
            },
            toolbar: {
              show: false, // Disable the toolbar
            },
          },
          series: [
            {
              name: "Price (USD)",
              data: prices,
            },
          ],
          dataLabels: {
            enabled: false,
          },
          stroke: {
            curve: "smooth",
          },
          fill: {
            type: "gradient",
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.7,
              opacityTo: 0.3,
              stops: [0, 90, 100],
            },
          },
          grid: {
            borderColor: "#444",
            strokeDashArray: 3,
          },
          xaxis: {
            categories: timestamps,
            title: {
              text: "Date",
              style: {
                color: "#ffffff",
              },
            },
            labels: {
              show: false,
            },
          },
          yaxis: {
            title: {
              text: "Price (USD)",
              style: {
                color: "#ffffff",
              },
            },
            labels: {
              style: {
                colors: "#ffffff",
              },
              formatter: (value) => `$${value.toFixed(2)}`,
            },
          },
          tooltip: {
            theme: "dark",
          },
          colors: ["#00E396"],
        });
        chart.render();
      } else {
        chart.updateSeries([
          {
            name: "Price (USD)",
            data: prices,
          },
        ]);
        chart.updateOptions({
          xaxis: {
            categories: timestamps,
            labels: {
              show: false,
            },
          },
        });
      }
    } catch (error) {
      console.error("Error fetching crypto data:", error);
      document.getElementById("crypto-name").textContent = "Error loading data";
    }
  }

  fetchCryptoData("dogecoin");

  document
    .getElementById("crypto-select")
    .addEventListener("change", (event) => {
      const selectedCrypto = event.target.value;
      fetchCryptoData(selectedCrypto);
    });
});
