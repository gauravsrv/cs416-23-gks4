// JavaScript code
document.addEventListener("DOMContentLoaded", function () {
    // D3.js code
    const slides = d3.selectAll("#slides > div");
    const pageButtons = d3.selectAll(".pageBtn");

    function showSlide(slideIndex) {
        slides.style("display", "none");
        slides.filter(`#slide${slideIndex}`).style("display", "block");
    }

    function setSelectedButton(pageIndex) {
        pageButtons.classed("selected", false);
        pageButtons.filter(`#page${pageIndex}`).classed("selected", true);
    }

    pageButtons.on("click", function () {
        const pageId = d3.select(this).attr("id");
        const slideIndex = parseInt(pageId.slice(-1));
        showSlide(slideIndex);
        setSelectedButton(slideIndex);
    });

    // Show the first slide and select the first button by default
    showSlide(1);
    setSelectedButton(1);

    // Load the CSV data and create the chart in slide 1
    d3.csv("Airline_review.csv").then(function (data) {
        const airlinesToPlot = [
            "Air India",
            "US Airways",
            "United Airlines",
            "Emirates",
            "Tigerair",
            "Thai Airways",
            "Japan Airlines",
            "Singapore Airlines",
            "Qatar Airways",
            "Oman Air",
            "British Airways",
            "Lufthansa",
            "KLM Royal Dutch Airlines"
        ];

        const years = [2015, 2016, 2017, 2018, 2019];

        const colorScale = d3.scaleOrdinal()
            .domain(airlinesToPlot)
            .range(d3.schemeCategory10); // Using D3's built-in color scheme

        const margin = { top: 20, right: 20, bottom: 50, left: 80 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select("#chartContainer")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const xScale = d3.scaleLinear()
            .domain([d3.min(years), d3.max(years)])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, 10]) // Assuming the rating ranges from 0 to 10
            .range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.format("d")));

        svg.append("g").call(d3.axisLeft(yScale));

        airlinesToPlot.forEach((airline) => {
            const airlineData = years.map((year) => {
                const ratingData = data.find((d) => d["Airline Name"] === airline && parseInt(d["Review_year"]) === year);
                return {
                    Year: year,
                    Rating: ratingData ? parseFloat(ratingData["Overall_Rating"]) : 0,
                };
            });

            const line = d3.line()
                .x((d) => xScale(d.Year))
                .y((d) => yScale(d.Rating));

            svg.append("path")
                .datum(airlineData)
                .attr("fill", "none")
                .attr("stroke", colorScale(airline))
                .attr("stroke-width", 2)
                .attr("d", line);

            svg.selectAll(".dot")
                .data(airlineData)
                .enter()
                .append("circle")
                .attr("cx", (d) => xScale(d.Year))
                .attr("cy", (d) => yScale(d.Rating))
                .attr("r", 4)
                .attr("fill", colorScale(airline));
        });

        // Create a legend
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - 100}, 20)`);

        const legendItems = legend.selectAll(".legendItem")
            .data(airlinesToPlot)
            .enter()
            .append("g")
            .attr("class", "legendItem")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);

        legendItems.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", colorScale);

        legendItems.append("text")
            .attr("x", 20)
            .attr("y", 10)
            .text((d) => d)
            .attr("fill", "#333")
            .style("font-size", "12px");
    });
});
