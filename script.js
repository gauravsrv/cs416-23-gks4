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
        const years = [2015, 2016, 2017, 2018, 2019];

        const airlinesByYear = {};
        years.forEach((year) => {
            airlinesByYear[year] = data
                .filter((d) => parseInt(d["Review_year"]) === year)
                .sort((a, b) => b["Overall_Rating"] - a["Overall_Rating"])
                .slice(0, 10)
                .map((d) => ({
                    Airline: d["Airline Name"],
                    Rating: parseFloat(d["Overall_Rating"]),
                }));
        });

        const margin = { top: 20, right: 20, bottom: 50, left: 80 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select("#chartContainer")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(years)
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, 10]) // Assuming the rating ranges from 0 to 10
            .range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));

        svg.append("g").call(d3.axisLeft(yScale));

        const barGroup = svg.selectAll(".barGroup")
            .data(years)
            .enter()
            .append("g")
            .attr("class", "barGroup")
            .attr("transform", (d) => `translate(${xScale(d)}, 0)`);

        barGroup.selectAll("rect")
            .data((d) => airlinesByYear[d])
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (d) => yScale(d.Rating))
            .attr("width", xScale.bandwidth())
            .attr("height", (d) => height - yScale(d.Rating))
            .attr("fill", "#007BFF");

        barGroup.selectAll("text")
            .data((d) => airlinesByYear[d])
            .enter()
            .append("text")
            .attr("x", xScale.bandwidth() / 2)
            .attr("y", (d) => yScale(d.Rating) - 5)
            .attr("text-anchor", "middle")
            .text((d) => d.Rating.toFixed(1))
            .attr("fill", "#fff");
    });
});
