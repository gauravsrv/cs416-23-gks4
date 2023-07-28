// JavaScript code
document.addEventListener("DOMContentLoaded", function () {
    const mainText = document.getElementById("mainText");
    const changeTextBtn = document.getElementById("changeTextBtn");

    changeTextBtn.addEventListener("click", function () {
        mainText.textContent = "Text changed!";
    });

    // D3.js code
    const data = [10, 30, 15, 25, 20];

    const svg = d3.select("#chart")
                .append("svg")
                .attr("width", 400)
                .attr("height", 200);

    const bars = svg.selectAll("rect")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", (d, i) => i * 80)
                .attr("y", (d) => 200 - d)
                .attr("width", 50)
                .attr("height", (d) => d)
                .attr("fill", "#007BFF");
});
