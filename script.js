import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function createAxis(svgElement, axis, id, x, y) {
  svgElement
    .append("g")
    .attr("transform", `translate(${x}, ${y})`)
    .attr("id", id)
    .call(axis);
};

const endpoint = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

const svgWidth = 900;
const svgHeight = 500;
const svgPadding = 50;

const svg = d3
  .select(".svg-container")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

const tooltip = d3.select("#tooltip");

fetch(endpoint)
  .then(res => res.json())
  .then(data => {
    const gdp = data.data.map(item => ({
      date: item[0],
      gdp: item[1]
    }));

    const minDate = new Date(d3.min(gdp, item => item.date));
    const maxDate = new Date(d3.max(gdp, item => item.date));
    maxDate.setMonth(maxDate.getMonth() + 2);

    const barWidth = (svgWidth - svgPadding * 2) / gdp.length;

    const xScale = d3.scaleTime(
      [minDate, maxDate],
      [svgPadding, svgWidth - svgPadding]
    );

    const yScale = d3.scaleLinear(
      [0, d3.max(gdp, item => item.gdp)],
      [svgHeight - svgPadding, svgPadding]
    );
    
    createAxis(svg, d3.axisBottom(xScale), "x-axis", 0, svgHeight - svgPadding)

    createAxis(svg, d3.axisLeft(yScale), "y-axis", svgPadding, 0)

    svg
      .append("text")
      .text("Gross Domestic Product")
      .attr("transform", "rotate(-90)")
      .attr("x", (svgPadding - svgHeight) / 2)
      .attr("y", svgPadding + 20);

    const bars = svg
      .selectAll("rect.bar")
      .data(gdp)
      .join("rect")
      .classed("bar", true)
      .attr("x", d => xScale(new Date(d.date)))
      .attr("y", d => yScale(d.gdp))
      .attr("width", barWidth)
      .attr("height", d => svgHeight - svgPadding - yScale(d.gdp))
      .attr("data-date", d => d.date)
      .attr("data-gdp", d => d.gdp)
      
    bars.on("mouseover", (event, d) => {
      const x = d3.pointer(event, svg)[0];
      const position = x >= innerWidth / 2 ? "-110%" : "10%";

      const value = d.gdp.toLocaleString("en-IN", {
        style: "currency",
        currency: "USD"
      });

      const [ year, month ] = d.date.split("-", 2);
      const quarter = "Q" + Math.ceil(month / 3);

      tooltip
        .classed("active", true)
        .attr("data-date", d.date)
        .style("left", x + "px")
        .style("transform", `translateX(${position})`)
        .html(`<p>${year} ${quarter}<br>${value} Billion</p>`);
    });

    bars.on("mouseout", () => tooltip.classed("active", false));
  });
