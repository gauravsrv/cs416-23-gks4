// JavaScript code
document.addEventListener("DOMContentLoaded", function () {
    const mainText = document.getElementById("mainText");
    const changeTextBtn = document.getElementById("changeTextBtn");

    changeTextBtn.addEventListener("click", function () {
        mainText.textContent = "Text changed!";
    });

    // D3.js code
    const slides = d3.selectAll("#slides > div");
    const pageButtons = d3.selectAll(".pageBtn");

    function showSlide(slideIndex) {
        slides.style("display", "none");
        slides.filter(`#slide${slideIndex}`).style("display", "block");
    }

    pageButtons.on("click", function () {
        const pageId = d3.select(this).attr("id");
        const slideIndex = parseInt(pageId.slice(-1));
        showSlide(slideIndex);
    });

    // Show the first slide by default
    showSlide(1);
});
