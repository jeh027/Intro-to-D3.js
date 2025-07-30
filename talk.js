import Inspire from "./slides/talk.js";

// import "https://colorjs.io/elements/css-color/css-color.js";
import "https://elements.colorjs.io/src/color-swatch/color-swatch.js";
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

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

// import("https://cdn.jsdelivr.net/npm/wc-mermaid/wc-mermaid.js");
// import("https://prismjs.com/plugins/line-numbers/prism-line-numbers.js");
import("https://cdn.jsdelivr.net/npm/prismjs/plugins/line-numbers/prism-line-numbers.min.js");


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


/* start of visualization example from d3 graph gallery */

// set the dimensions and margins of the graph
const margin = {top: 10, right: 20, bottom: 30, left: 50},
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

    // Add X axis
    const x = d3.scaleLinear()
        .domain([0, 12000])
        .range([0, width ]);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([35, 90])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add a scale for bubble size
    const z = d3.scaleLinear()
        .domain([200000, 1310000000])
        .range([4, 40]);

    // Add a scale for bubble color
    const myColor = d3.scaleOrdinal()
        .domain(["Asia", "Europe", "Americas", "Africa", "Oceania"])
        .range(d3.schemeSet2);

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
    const showTooltip = function(event, d) {
        tooltip.transition().duration(200)

        tooltip
            .style("opacity", 1)
            .html("Country: " + d.country)
            .style("left", (event.x)/2 + "px")
            .style("top", (event.y)/2+30 + "px")
    }

    const moveTooltip = function(event, d) {
        tooltip
            .style("left", (event.x)/2 + "px") /* learn how style direction works here */
            .style("top", (event.y)/2+30 + "px")
    }

    const hideTooltip = function(event, d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .join("circle")
        .attr("class", "bubbles")
        .attr("cx", d => x(d.gdpPercap))
        .attr("cy", d => y(d.lifeExp))
        .attr("r", d => z(d.pop))
        .style("fill", d => myColor(d.continent))
        .on("mouseover", showTooltip)
        .on("mousemove", moveTooltip)
        .on("mouseleave", hideTooltip)
    }
);

/* end of visualization example from d3 graph gallery */