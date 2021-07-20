
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper
//  append an SVG group that will hold the chart and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data       then fulfills promise
d3.csv("assets/data/data.csv").then(function(censusData) {
    console.log(censusData);

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    censusData.forEach(function(num) {
        num.age = +num.age;
        num.healthcare = +num.healthcare;
        num.income = +num.income;
        num.obesity = +num.obesity;
        num.poverty = +num.poverty;
        num.smokes = +num.smokes;
        // num.id = +num.id;
      });

    // Step 2: Create scale functions
    // ==============================
    // **will come back to create function for multi axis chart
    var xLinearScale = d3.scaleLinear()
      .domain([(d3.min(censusData, d => d.poverty)) -0.75, (d3.max(censusData, d => d.poverty))+0.75])
      // .domain(d3.extent(censusData, d => d.poverty))    // // not using bc I want buffer from axis
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([(d3.min(censusData, d => d.healthcare)) -0.75, (d3.max(censusData, d => d.healthcare))+0.75])
      // .domain(d3.extent(censusData, d => d.healthcare))

      .range([height, 0]);

    // creating axis
    var bottomAxis= d3.axisBottom(xLinearScale);
    var leftAxis= d3.axisLeft(yLinearScale);

    // append created axis to chartgroup
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .attr("class", "bottomAxis")
      .call(bottomAxis);

    chartGroup.append("g")
      .attr("class", "leftAxis")
      .call(leftAxis);

    // create cirles to mark datapoints
    var circlesGroup = chartGroup.append("g")
      .attr("class", "circleGroup")
      .selectAll("circle")
      .data(censusData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", "15")
      .attr("fill", "pink")
      .attr("opacity", ".5");

    // create text group to put over circles
    var textGroup= chartGroup.append("g")
      .attr("class", "textGroup")
      .selectAll("text")
      .data(censusData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d.poverty))
      .attr("y", d => yLinearScale(d.healthcare) +4)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("fill", "white")
      .text(d => d.abbr)


    //Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>change this to iterate: ${d.poverty}<br>TBD: ${d.healthcare}`);
      });

    //  Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    //Create event listeners to display and hide the tooltip
    // ==============================
    textGroup.on("click", function(data) {
      toolTip.show(data, this);
    })
      // onmouse out event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

      // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare %");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("Poverty %");
    

}).catch(function(error) {
  console.log(error);
  });