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
            "KLM Royal Dutch Airlines",
            "Air India"
        ];

        const years = Array.from({ length: 11 }, (_, i) => 2013 + i); // From 2013 to 2023

        const colorScale = d3.scaleOrdinal()
            .domain(airlinesToPlot)
            .range(d3.schemeCategory10); // Using D3's built-in color scheme

         const legendWidth = 120;   
        const margin = { top: 40, right: legendWidth, bottom: 50, left: 60 }; // Increased left margin to accommodate the description
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

        const tooltip1 = d3.select("#chartContainer")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
 
       
        // Add x-axis label
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .style("text-anchor", "middle")
            .text("Year");

        // Add y-axis label
        svg.append("text")
            .attr("x", -(height / 2))
            .attr("y", -margin.left + 15)
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .text("Overall Rating");



        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(640, 30)`); // Move the legend to the right side


         const legendItems = legend.selectAll(".legendItem")
        .data(airlinesToPlot)
        .enter()
        .append("g")
        .attr("class", "legendItem")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`)
        .on("click", function (event, d) {
            if (!isAnimationStopped) {
                stopAnimation();
            }
            const isActive = d3.select(this).classed("active");
            d3.selectAll(".legendItem").classed("active", false);
            d3.select(this).classed("active", !isActive);

            if (!isActive) {
                const filteredData = airlinesData.filter((airlineData) => airlineData[0].Airline === d);
                updateGraphWithAnimation(filteredData);
            } else {
                updateGraphWithAnimation(airlinesData);
            }
        })
        .on("mouseenter", function (event, d) {
            if (!isAnimationStopped) {
                stopAnimation();
            }
            const isActive = d3.select(this).classed("active");
            if (!isActive) {
               // const filteredData = airlinesData.filter((airlineData) => airlineData[0].Airline === d);
               const filteredData = airlinesData.map((airlineData) =>
                    airlineData.filter((d) => d.Airline === d)
                );
                updateGraphData(filteredData[0]);
            }
        })
        .on("mouseleave", function () {
            if (!isAnimationStopped) {
                stopAnimation();
                updateGraphWithAnimation(airlinesData);
            }
        });



    

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

            tooltip1.style("opacity", 0.9)
                .style("left", `${mouseX}px`)
                .style("top", `${mouseY - 28}px`);

            path.attr("d", (d) => line(d.slice(0, yearIndex + 1)));
        }

        function updateGraphData(data) {
                const circles = svg.selectAll(".circle").data(data);
                circles.transition()
                    .duration(1500) // The same duration as the animation interval
                    .attr("cx", (d) => xScale(d.Year))
                    .attr("cy", (d) => yScale(d.Rating))
                    .style("opacity", 1);

                const paths = svg.selectAll(".line").data(data);
                paths.transition()
                    .duration(1500) // The same duration as the animation interval
                    .attr("d", (d) => line(d));
            }


        let isAnimationStopped = false; // A flag to keep track of whether the animation has stopped or not

        function updateGraphWithAnimation(data) {
        const circles = svg.selectAll(".circle").data(data);
        circles.transition()
            .duration(1500) // The same duration as the animation interval
            .attr("cy", (d) => yScale(d[yearIndex].Rating))
            .style("opacity", 1);

        const paths = svg.selectAll(".line").data(data);
        paths.transition()
            .duration(1500) // The same duration as the animation interval
            .attr("d", (d) => line(d.slice(0, yearIndex + 1)));
    }

      function stopAnimation() {
        animationInterval.stop();
        isAnimationStopped = true;
        updateGraphData(airlinesData);
    }

        let yearIndex = 0;
        updateGraph(yearIndex);
        updateGraphWithAnimation(airlinesData);

        const animationInterval = d3.interval(() => {
            yearIndex = (yearIndex + 1) % years.length;
            updateGraph(yearIndex);
            updateGraphWithAnimation(airlinesData);
        }, 1500); // Change the duration as needed for the animation speed

        // Stop the animation when the user clicks on the chart
    svg.on("click", stopAnimation);


            // Get the mouse position on the SVG container
        svg.on("mousemove", function (event) {
            [mouseX, mouseY] = d3.pointer(event, this);
            if (!isAnimationStopped) {
                updateGraph(yearIndex);
            }
        });





// Create the scatter plot in slide 2
        const scatterMargin = { top: 40, right: 120, bottom: 50, left: 60 };
        const scatterWidth = 800 - scatterMargin.left - scatterMargin.right;
        const scatterHeight = 400 - scatterMargin.top - scatterMargin.bottom;

        const scatterSvg = d3.select("#scatterPlotContainer")
            .append("svg")
            .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
            .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
            .append("g")
            .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`);

        const airlinesComfortData = airlinesToPlot.map((airline) => {
            const comfortData = data.filter((d) => d["Airline Name"] === airline);
            const overallRating = d3.mean(comfortData, (d) => parseFloat(d["Overall_Rating"])) || 0;
            const comfortLevel = d3.mean(comfortData, (d) => parseFloat(d["Seat Comfort"])) || 0;
            return {
                Airline: airline,
                OverallRating: overallRating,
                ComfortLevel: comfortLevel,
            };
        });

        const xScatterScale = d3.scaleBand()
            .domain(airlinesComfortData.map((d) => d.Airline))
            .range([0, scatterWidth])
            .padding(0.2);

        // const yScatterScale = d3.scaleLinear()
        //     .domain([0, 10]) // Assuming the comfort level ranges from 0 to 10
        //     .range([scatterHeight, 0]);
        // Use a logarithmic scale for the y-axis
        const yScatterScale = d3.scaleLog()
            .domain([0.1, 10]) // Set the domain for the logarithmic scale
            .range([scatterHeight, 0]);

        scatterSvg.append("g")
            .attr("transform", `translate(0, ${scatterHeight})`)
            .call(d3.axisBottom(xScatterScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        //scatterSvg.append("g").call(d3.axisLeft(yScatterScale));
        // Use a logarithmic scale for the y-axis
        scatterSvg.append("g").call(d3.axisLeft(yScatterScale).ticks(5, ".1"));

        const tooltip = d3.select("#scatterPlotContainer")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


        scatterSvg.selectAll(".dot")
            .data(airlinesComfortData)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", (d) => xScatterScale(d.Airline) + xScatterScale.bandwidth() / 2)
            .attr("cy", (d) => yScatterScale(d.ComfortLevel))
            .attr("r", 8)
            .attr("fill", (d) => colorScale(d.Airline))
            .style("opacity", 0.7)
            .on("mouseenter", function (event, d) {
            // Show tooltip on mouseover
            const [mouseX, mouseY] = d3.pointer(event, scatterSvg.node());
            const containerRect = scatterSvg.node().getBoundingClientRect();
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);

            tooltip.style("opacity", 0.9)
                .style("left", `${mouseX}px`)
                .style("top", `${mouseY - 28}px`)
                // .html(`
                //     <div><strong>${d.Airline}</strong></div>
                //     <div>Overall Rating: ${d3.format(".2f")(d.OverallRating)}</div>
                //     <div>Comfort Rating: ${d3.format(".2f")(d.ComfortLevel)}</div>
                // `)
                .html(`
                    <div><strong>Airline: ${d.Airline}</strong></div>
                    <div>Overall Rating: ${d.OverallRating.toFixed(1)}</div>
                    <div>Comfort Rating: ${d.ComfortLevel.toFixed(1)}</div>
            `   );
            })
            .on("mouseout", function () {
                // Hide tooltip on mouseout
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        scatterSvg.append("text")
            .attr("x", scatterWidth / 2)
            .attr("y", scatterHeight + scatterMargin.bottom - 10)
            .style("text-anchor", "middle")
            .text("Airline");

        scatterSvg.append("text")
            .attr("x", -(scatterHeight / 2))
            .attr("y", -scatterMargin.left + 15)
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .text("Comfort Level");

        // Add legend to slide2
        const legend2 = scatterSvg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(640, 30)`);

        const legendItems2 = legend2.selectAll(".legendItem")
            .data(airlinesToPlot)
            .enter()
            .append("g")
            .attr("class", "legendItem")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`)
            .on("mouseenter", function (event, d) {
                scatterSvg.selectAll(".dot")
                    .style("opacity", 0.2);
                scatterSvg.selectAll(`.dot.${d.replace(/\s+/g, '')}`)
                    .style("opacity", 0.7);
            })
            .on("mouseleave", function () {
                scatterSvg.selectAll(".dot")
                    .style("opacity", 0.7);
            });

        legendItems2.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", (d) => colorScale(d));

        legendItems2.append("text")
            .attr("x", 20)
            .attr("y", 10)
            .text((d) => d)
            .attr("fill", "#333")
            .style("font-size", "12px");


        // Hide the scatter plot initially
        d3.select("#slide2").style("display", "none");



         // Create the pie chart in slide 3
    const pieMargin = { top: 40, right: 30, bottom: 50, left: 60 };
    const pieWidth = 800 - pieMargin.left - pieMargin.right;
    const pieHeight = 400 - pieMargin.top - pieMargin.bottom;
    const radius = Math.min(pieWidth, pieHeight) / 2;

    const pieSvg = d3.select("#pieChartContainer")
        .append("svg")
        .attr("width", pieWidth + pieMargin.left + pieMargin.right)
        .attr("height", pieHeight + pieMargin.top + pieMargin.bottom)
        .append("g")
        .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2})`);

    const pieColorScale = d3.scaleOrdinal()
        .domain(airlinesToPlot)
        .range(d3.schemeCategory10);

    const pieData = airlinesToPlot.map((airline) => {
        const recommendCount = data.filter((d) => d["Airline Name"] === airline && d["Recommended"] === "yes").length;
        return { airline: airline, recommendCount: recommendCount };
    });

    const pie = d3.pie()
        .value((d) => d.recommendCount);

    const pieArc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const pieChart = pieSvg.selectAll(".arc")
        .data(pie(pieData))
        .enter()
        .append("g")
        .attr("class", "arc");

   const tooltipPie = d3.select("#pieChartContainer") // Change #tooltipPie to #pieChartContainer
    .append("div")
    .attr("class", "tooltipPie") // Change the class name to "tooltipPie"
    .style("opacity", 0);

    pieChart.append("path")
        .attr("d", pieArc)
        .attr("fill", (d) => pieColorScale(d.data.airline))
        .attr("stroke", "#fff")
        .style("stroke-width", "2px")
        .on("mouseover", (event, d) => {
        const [mouseX, mouseY] = d3.pointer(event);
        const color = pieColorScale(d.data.airline);
        tooltipPie.transition().duration(200).style("opacity", 0.9);
        tooltipPie.html(`${d.data.airline}<br>Percentage: ${d.data.recommendCount}%`)
            .style("left",  `${event.pageX}px`) // Adjust the left position to center the tooltip
            .style("top", `${event.pageY}px`) // Adjust the top position to center the tooltip
            .style("background-color", color);
    })
        .on("mouseout", function () {
            tooltipPie.transition().duration(500).style("opacity", 0);
        });

    // pieChart.append("text")
    //     .attr("transform", (d) => `translate(${pieArc.centroid(d)})`)
    //     .attr("dy", "0.35em")
    //     .style("text-anchor", "middle")
    //     .text((d) => `${d.data.airline} (${((d.data.recommendCount / data.length) * 100).toFixed(1)}%)`);

    // Hide the pie chart initially

   
const legendHeight = airlinesToPlot.length * 20;

const legendPie = d3.select("#slide3")
    .append("svg")
    .attr("width", 200)
    .attr("height", legendHeight)
    .selectAll("g")
    .data(pieData)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`);

legendPie.append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", (d) => pieColorScale(d.airline));

legendPie.append("text")
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", "0.35em")
    .text((d) => d.airline);


    d3.select("#slide3").style("display", "none");


    });
});
