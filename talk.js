import Inspire from "./slides/talk.js";
import "https://elements.colorjs.io/src/color-swatch/color-swatch.js";
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import("https://cdn.jsdelivr.net/npm/prismjs/plugins/line-numbers/prism-line-numbers.min.js");

let canonicalIds = ["html", "js"];
function getLanguage (element) {
	let language = Prism.util.getLanguage(element);
	let def = Prism.languages[language];

	let canonical = canonicalIds.find(id => Prism.languages[id] === def);

	return canonical ?? language;
}

Inspire.for("iframe.browser[data-result]", iframe => {
	let parent = iframe.parentElement;
	let codes = [...parent.querySelectorAll("pre > code")].map(code => ({ language: getLanguage(code), code: code.textContent }));
	let code = Object.groupBy(codes, o => o.language);

	for (let language in code) {
		code[language] = code[language].map(o => o.code).join("\n");
	}

	let html = code.html ?? iframe.closest("[data-result-html]")?.dataset.resultHtml ?? "";
	let css = `<style>
		:root {
			font-size: 200%;
		}

		button, input, textarea, select {
			font-size: inherit;
		}
		${code.css ?? ""}
	</style>`;
	let js = code.js ? `<script type="module">${code.js}</script>
	` : "";

	iframe.srcdoc = `${ css }${ js }${ html }`;
});


/* start of animation */

const style = document.createElement('style');
document.head.appendChild(style);

for (let i = 4; i <= 8; i++) {
  style.sheet.insertRule(`
    .fade-in-${i} {
      animation: fadeIn 2s ease-in-out forwards;
      animation-delay: ${i + 1}s;
    }
  `, style.sheet.cssRules.length); /* insert at the end of the stylesheet */
};

document.getElementById("myButton1").addEventListener("click", 
    function() {
        for (let i = 1; i <= 8; i++) {
            document.getElementById(`in-${i}`).classList.add(`fade-in-${i}`)
        }
    }
);

document.getElementById("myButton2").addEventListener("click", 
    function() {
        for (let i = 1; i <= 3; i++) {
            console.log('iteration');
            document.getElementById(`out-${i}`).classList.add(`fade-out-${i}`)
        }
        document.getElementById('out-4').classList.add('fade-in-4')
        document.getElementById('out-5').classList.add('fade-in-5')
    }
);

/* end of animation */


/* visualization example from d3 graph gallery (I did not create this)*/

// set the dimensions and margins of the graph
const margin = {top: 40, right: 150, bottom: 60, left: 30},
    width = 1000 - margin.left - margin.right,
    height = 840 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

//Read the data
d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/4_ThreeNum.csv").then( function(data) {

    // ---------------------------//
    //       AXIS  AND SCALE      //
    // ---------------------------//

    // Add X axis
    const x = d3.scaleLinear()
        .domain([0, 45000])
        .range([0, width]);
    
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(3));

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 50)
        .attr("font-size", "35px")
        .text("GDP per Capita");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([35, 90])
        .range([height, 0]);
    
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add Y axis label:
    svg.append("text")
        .attr("text-anchor", "start")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-size", "35px")
        .text("Life Expectancy")

    // Add a scale for bubble size
    const z = d3.scaleSqrt()
        .domain([200000, 1310000000])
        .range([2, 30]);

    // Add a scale for bubble color
    const myColor = d3.scaleOrdinal()
        .domain(["Asia", "Europe", "Americas", "Africa", "Oceania"])
        .range(d3.schemeSet1);


    // ---------------------------//
    //      TOOLTIP               //
    // ---------------------------//

    // -1- Create a tooltip div that is hidden by default:
    const tooltip = d3.select("#my_dataviz")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "white")

    // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
    const showTooltip = function(event,d) {
        tooltip
            .transition()
            .duration(200)
        
            tooltip
            .style("opacity", 1)
            .html("Country: " + d.country)
            .style("left", (event.x)/2 + "px")
            .style("top", (event.y)/2-50 + "px")
    }
    const moveTooltip = function(event, d) {
        tooltip
            .style("left", (event.x)/2 + "px")
            .style("top", (event.y)/2-50 + "px")
    }
    const hideTooltip = function(event, d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }


    // ---------------------------//
    //       HIGHLIGHT GROUP      //
    // ---------------------------//

    // What to do when one group is hovered
    const highlight = function(event, d){
        // reduce opacity of all groups
        d3.selectAll(".bubbles").style("opacity", .05)
        // expect the one that is hovered
        d3.selectAll("."+d).style("opacity", 1)
    }

    // And when it is not hovered anymore
    const noHighlight = function(event, d){
        d3.selectAll(".bubbles").style("opacity", 1)
    }


    // ---------------------------//
    //       CIRCLES              //
    // ---------------------------//

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .join("circle")
        .attr("class", function(d) { return "bubbles " + d.continent })
        .attr("cx", d => x(d.gdpPercap))
        .attr("cy", d => y(d.lifeExp))
        .attr("r", d => z(d.pop))
        .style("fill", d => myColor(d.continent))
        // -3- Trigger the functions for hover
        .on("mouseover", showTooltip)
        .on("mousemove", moveTooltip)
        .on("mouseleave", hideTooltip)



    // ---------------------------//
    //       LEGEND              //
    // ---------------------------//

    // Add legend: circles
    const valuesToShow = [10000000, 100000000, 1000000000]
    const xCircle = 730
    const xLabel = 640
    
    svg
    .selectAll("legend")
    .data(valuesToShow)
    .join("circle")
        .attr("cx", xCircle)
        .attr("cy", d => height - 150 - z(d))
        .attr("r", d => z(d))
        .style("fill", "none")
        .attr("stroke", "black")

    // Add legend: segments
    svg
    .selectAll("legend")
    .data(valuesToShow)
    .join("line")
        .attr('x1', d => xCircle + z(d))
        .attr('x2', xLabel + 147)
        .attr('y1', d => height - 150 - z(d))
        .attr('y2', d => height - 150 - z(d))
        .attr('stroke', 'black')
        .style('stroke-dasharray', ('2,2'))

    // Add legend: labels
    svg.selectAll("legend")
        .data(valuesToShow)
        .join("text")
            .attr('x', xLabel + 150)
            .attr('y', d => height - 150 - z(d))
            .text(d => d/1000000)
            .style("font-size", 15)
            .attr('alignment-baseline', 'middle')

    // Legend title
    svg.append("text")
        .attr('x', xCircle + 15)
        .attr("y", height - 225)
        .text("Population (M)")
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")

    // Add one dot in the legend for each name.
    const size = 35
    const allgroups = ["Asia", "Europe", "Americas", "Africa", "Oceania"]

    svg.selectAll("myrect")
        .data(allgroups)
        .join("circle")
            .attr("cx", 680)
            .attr("cy", (d,i) => 260 + i*(size+5)) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 5)
            .style("fill", d =>  myColor(d))
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight)

    
            // Add labels beside legend dots
    svg.selectAll("mylabels")
        .data(allgroups)
        .enter()
        .append("text")
            .attr("x", 680 + size * .8)
            .attr("y", (d,i) =>  i * (size + 5) + (size/2) + 242) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("font-size", "25px")
            .style("fill", d => myColor(d))
            .text(d => d)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight)
});

/* end of visualization example from d3 graph gallery */