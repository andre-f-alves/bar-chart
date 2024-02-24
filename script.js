import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const endpoint = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

const svgWidth = 900;
const svgHeight = 500;
const svgPadding = 50;

const svg = d3
  .select(".svg-container")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

const tooltip = d3
  .select(".svg-container")
  .append("div")
  .attr("id", "tooltip");

fetch(endpoint)
  .then(res => res.json())
  .then(data => {
    const gdp = data.data.map(item => ({
      date: item[0],
      gdp: item[1]
    }));


    const minDate = new Date(d3.min(gdp, item => item.date));
    const maxDate = new Date(d3.max(gdp, item => item.date));

    maxDate.setMonth(maxDate.getMonth() + 3);

    const dataAmount = d3.count(gdp, d => d.gdp);
    const barWidth = (svgWidth - svgPadding * 2) / dataAmount;

    const xScale = d3.scaleTime(
      [minDate, maxDate],
      [svgPadding, svgWidth - svgPadding]
    );


    const yScale = d3.scaleLinear(
      [0, d3.max(gdp, item => item.gdp)],
      [svgHeight - svgPadding, svgPadding]
    );


    svg
      .append("g")
      .attr("transform", `translate(0, ${svgHeight - svgPadding})`)
      .attr("id", "x-axis")
      .call(d3.axisBottom(xScale));

    svg
      .append("g")
      .attr("transform", `translate(${svgPadding}, 0)`)
      .attr("id", "y-axis")
      .call(d3.axisLeft(yScale));

    svg
      .append("text")
      .text("Gross Domestic Product")
      .attr("transform", "rotate(-90)")
      .attr("x", (svgPadding - svgHeight) / 2)
      .attr("y", svgPadding + 20);

    svg
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
      .attr("fill", "royalblue")
      .on("mouseover", (d) => {
        const value = d.gdp.toLocaleString("en-IN", {
          style: "currency",
          currency: "USD"
        });

        let [year, month] = d.date.split("-", 2);
        let quarter;

        switch (month) {
          case "01":
            quarter = "Q1";
            break;
          case "04":
            quarter = "Q2";
            break;
          case "07":
            quarter = "Q3";
            break;
          case "10":
            quarter = "Q4";
            break;
        }

        tooltip
          .attr("data-date", d.date)
          .classed("active", true)
          .style("left", xScale(new Date(d.date)) + "px")
          .html(`${year} ${quarter}<br>${value} Billion`);
      })
      .on("mouseout", () => tooltip.classed("active", false));
  });