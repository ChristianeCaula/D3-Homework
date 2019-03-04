// D3 Scatterplot Assignment
let svgWidth = 680;
let svgHeight = 480;

let margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
}

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
//and shift the latter by left and top margins.
let svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
let chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenxAxis = "obesity";
let chosenyAxis = "income";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenxAxis) {
    // Create scales
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenxAxis]) * 0.8,
        d3.max(data, d => d[chosenxAxis]) * 1.2
    ])
    .range([0, width]);

    return xLinearScale
};

// function used for updating xAxis var upon click on axis label
function renderAxes(newxScale, xAxis) {
    let bottomAxis = d3.axisBottom(newxScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis
};

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newxScale, chosenxAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newxScale(d[chosenxAxis]))

    return circlesGroup
  };


// function used for updating circles group with new tooltip
function updateToolTip(chosenxAxis, circlesGroup) {

    if (chosenxAxis == "obesity") {
      var xlabel = "Obesity: ";
      var ylabel = "Average Income ($): "
    } else {
      var xlabel = "Smoke: "
      var ylabel = "Average Income ($): "
    };
  
    let toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function (d) {
        return (`${d.state}<hr>${xlabel} ${d[chosenxAxis]}<br>${ylabel} ${d[chosenyAxis]}`);
      });
    
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
      })
      // onmouseout event
      .on("mouseout", function (data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup
  }

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv", function (error, data) {
    if (error) throw error;
  
    // parse data
    data.forEach(function (file) {
      file.income = +file.income;
      file.obesity = +file.obesity;
      file.smoke = +file.smoke;
    });
  
    // xLinearScale function above csv import
    let xLinearScale = xScale(data, chosenxAxis);
  
    // Create y scale function
    let yLinearScale = d3.scaleLinear()
      .domain([10, d3.max(data, d => d.income)])
      .range([height, 0]);
  
    // Create initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    let xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    chartGroup.append("g")
      .call(leftAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenxAxis]))
      .attr("cy", d => yLinearScale(d[chosenyAxis]))
      .attr("r", 9)
      .attr("fill", "red")
      .attr("opacity", "0.6")
      .attr("class", "stateText");
    
    var circlesText = chartGroup.selectAll("stateText")
      .data(data)
      .enter()
      .append("text")
      .text(function (d) {
        return d.abbr;
      })
      .attr("x", function (d) {
        return xLinearScale(d[chosenxAxis]);
      })
      .attr("y", function (d) {
        return yLinearScale(d[chosenyAxis]);
      })
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .attr("fill", "white");
      
    
    // Create group for  2 x- axis labels
    let labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width/2}, ${height + 20})`)
  
    let obesity = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "obesity") //value to grab for event listener
      .classed("active", true)
      .text("Obesity");
  
    let smoke = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "smoke") //value to grab for event listener
      .classed("inactive", true)
      .text("Smoke");
  
    // append y axis
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "2em")
      .classed("axis-text", true)
      .text("Income");
  
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenxAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function () {
        // get value of selection
        let value = d3.select(this).attr("value")
        if (value != chosenxAxis) {
  
          // replaces chosenXAxis with value
          chosenxAxis = value;
  
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(data, chosenxAxis);
  
          // updates x axis with transition
          xAxis = renderAxes(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenxAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenxAxis, circlesGroup);

          var newCirclesText = chartGroup.selectAll("stateText")
            .data(data)
            .enter()
            .append("text")
            .text(function (d) {
              return d.abbr;
            })
            .attr("x", function (d) {
              return xLinearScale(d[chosenxAxis]);
            })
            .attr("y", function (d) {
              return yLinearScale(d[chosenyAxis]);
            })
            .attr("font-size", "10px")
            .attr("text-anchor", "middle")
            .attr("fill", "white");
  
          // changes classes to change bold text
          if (chosenxAxis == "smoke") {
            smoke
              .classed("active", true)
              .classed("inactive", false)
            obesity
              .classed("active", false)
              .classed("inactive", true)
          } else {
            smoke
              .classed("active", false)
              .classed("inactive", true)
            obesity
              .classed("active", true)
              .classed("inactive", false)
          };
        };
      });
  });
  
