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

    // Slide 1: Top 10 Airlines for each year between 2015 to 2019
    d3.csv("Airline_review.csv").then(data => {
        // Convert Overall_Rating to a number for sorting
        data.forEach(d => {
            d.Overall_Rating = +d.Overall_Rating;
        });

        const filteredData = data.filter(d => d.Review_Date && d.Review_Date.length >= 4);

        const nestedData = d3.group(filteredData, d => d.Review_Date.substring(0, 4));


        const margin = { top: 20, right: 30, bottom: 60, left: 100 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select("#slide1")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(nestedData.get("2015").map(d => d.Airline_Name))
            .range([0, width])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, 10])
            .range([height, 0]);

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        // Create bars
        const bars = svg.selectAll(".bar")
            .data(nestedData.get("2015"))
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.Airline_Name))
            .attr("width", xScale.bandwidth())
            .attr("y", d => yScale(d.Overall_Rating))
            .attr("height", d => height - yScale(d.Overall_Rating))
            .attr("fill", "#007BFF");
    });

    // Show the first slide and select the first button by default
    showSlide(1);
    setSelectedButton(1);
});
