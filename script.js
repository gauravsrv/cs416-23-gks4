// JavaScript code
document.addEventListener("DOMContentLoaded", function () {
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

        const years = Array.from({ length: 11 }, (_, i) => 2013 + i); // From 2013 to 2023

        const colorScale = d3.scaleOrdinal()
            .domain(airlinesToPlot)
            .range(d3.schemeCategory10); // Using D3's built-in color scheme

         const legendWidth = 120;   
        const margin = { top: 20, right: legendWidth, bottom: 50, left: 80 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        let mouseX = 0;
        let mouseY = 0;

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
            .call(d3.axisBottom(xScale).ticks(11).tickFormat(d3.format("d")));

        svg.append("g").call(d3.axisLeft(yScale));

        const line = d3.line()
            .x((d) => xScale(d.Year))
            .y((d) => yScale(d.Rating));

        const airlinesData = airlinesToPlot.map((airline) => {
            return years.map((year) => {
                const ratingData = data.find((d) => d["Airline Name"] === airline && parseInt(d["Review_year"]) === year);
                return {
                    Year: year,
                    Rating: ratingData ? parseFloat(ratingData["Overall_Rating"]) : 0,
                };
            });
        });

        const path = svg.selectAll(".path")
            .data(airlinesData)
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", (d, i) => colorScale(airlinesToPlot[i]))
            .attr("stroke-width", 2)
            .attr("d", line);

        const circle = svg.selectAll(".circle")
            .data(airlinesData)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("r", 4)
            .attr("fill", (d, i) => colorScale(airlinesToPlot[i]))
            .style("opacity", 0); // Hide the circles initially

        const tooltip = d3.select("#chartContainer")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

       
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width}, 20)`); // Move the legend to the right side


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

        function updateGraph(yearIndex) {
            circle.attr("cx", (d) => xScale(d[yearIndex].Year))
                .attr("cy", (d) => yScale(d[yearIndex].Rating));

            tooltip.style("opacity", 0.9)
                .style("left", `${mouseX}px`)
                .style("top", `${mouseY - 28}px`)
                .html(`<strong>Year:</strong> ${years[yearIndex]}<br><strong>Rating:</strong> ${d3.format(".2f")(airlinesData[0][yearIndex].Rating)}`);

            path.attr("d", (d) => line(d.slice(0, yearIndex + 1)));
        }

        let yearIndex = 0;
        updateGraph(yearIndex);

        const animationInterval = d3.interval(() => {
            yearIndex = (yearIndex + 1) % years.length;
            updateGraph(yearIndex);
        }, 1500); // Change the duration as needed for the animation speed

        // Stop the animation when the user clicks on the chart
        svg.on("click", () => animationInterval.stop());

        // Get the mouse position on the SVG container
        svg.on("mousemove", function () {
            [mouseX, mouseY] = d3.mouse(this);
            updateGraph(yearIndex);
        });
    });
});
