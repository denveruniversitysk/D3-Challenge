// Define svgWidth and svgHeight
var svgWidth = 900;
var svgHeight = 600;

// Define margin
var margin = {
    top: 40,
    bottom: 90,
    right: 40,
    left: 100
};

// Define height and width of svgWidth, svgHeight and margin
var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;

// Create an svg wrapper and append elements 
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Set parameters
var XAxis = "poverty";
var YAxis = "healthcare";

// Create function for x-scale variable 
function xScale(data, XAxis) {
    // Create Scales
    var xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[XAxis]) * .8,
            d3.max(data, d => d[XAxis]) * 1.2
        ])
        .range([0, width]);

    return xScale;

}

// Create function for y-scale variable
function yScale(data, YAxis) {
    // Create Scales
    var yLinScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[YAxis]) * .8,
            d3.max(data, d => d[YAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinScale;
}

// Create function for x-axis when axis label is clicked
function renderXaxis(newXscale, xAxis) {
    var bottom = d3.axisBottom(newXscale);

    xAxis.transition()
        .duration(1000)
        .call(bottom);

    return xAxis;
}

// Create function for y-axis when axis label is clicked
function renderYaxis(newYscale, yAxis) {
    var left = d3.axisLeft(newYscale);

    yAxis.transition()
        .duration(1000)
        .call(left);

    return yAxis;
}

// Create function to render circles transitioning to new circles
function updateCircles(circleHover, newXscale, newYscale, XAxis, YAxis) {

    circleHover.transition()
        .duration(1000)
        .attr("cx", d => newXscale(d[XAxis]))
        .attr("cy", d => newYscale(d[YAxis]));

    return circleHover;
}

// Create function to render text in circles transitioning to new text
function updateText(circleText, newXscale, newYscale, XAxis, YAxis) {
    circleText.transition()
        .duration(1000)
        .attr("x", d => newXscale(d[XAxis]))
        .attr("y", d => newYscale(d[YAxis]));
    
    return circleText;
}

// Create function to update toolTip
function changeToolTip(XAxis, YAxis, circleHover) {

    // Conditional for X Axis.
    if (XAxis === "poverty") {
        var xLabel = "Poverty: ";
    }
    else if (XAxis === "income") {
        var xLabel = "Median Income: "
    }
    else {
        var xLabel = "Age: "
    }

    // Create conditional for y-axis
    if (YAxis === "healthcare") {
        var yLabel = "Lacks Healthcare: ";
    }
    else if (YAxis === "smokes") {
        var yLabel = "Smokers: ";
    }
    else {
        var yLabel = "Obesity: ";
    }

    // Define toolTip
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .style("background", "black")
        .style("color", "white")
        .offset([120, -60])
        .html(function(d) {
            if (XAxis === "age") {
                return (`${d.state}<br>${xLabel} ${d[XAxis]}<br>${yLabel}${d[YAxis]}%`);
              } else if (XAxis !== "poverty" && XAxis !== "age") {
                return (`${d.state}<br>${xLabel}$${d[XAxis]}<br>${yLabel}${d[YAxis]}%`);
              } else {
                return (`${d.state}<br>${xLabel}${d[XAxis]}%<br>${yLabel}${d[YAxis]}%`)
              }      
        });
    
    // Call toolTip    
    circleHover.call(toolTip);

    // Create "mouseover" and "mouseout" event listener
    circleHover
        .on("mouseover", function(data) {
            toolTip.show(data, this)
        })
        .on("mouseout", function(data) {
            toolTip.hide(data, this)
        })

    return circleHover;
}

// Import data.csv 
d3.csv("assets/data/data.csv")
    .then(function(data) {

    // Convert strings to numbers 
    data.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    });

    // Create x-scale function
    var xLinScale = xScale(data, XAxis);

    // Create y-scale function
    var yLinScale = yScale(data, YAxis);

    // Create axis functions
    var bottom = d3.axisBottom(xLinScale);
    var left = d3.axisLeft(yLinScale);
    
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottom);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(left);

    // Add circles and append
    var circleHover = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinScale(d[XAxis]))
        .attr("cy", d => yLinScale(d[YAxis]))
        .attr("r", "15")
        .attr("fill", "lightblue")
        .attr("opacity", ".6")
        
    // Add state abbreviations to circles and append
    var circleText = chartGroup.selectAll()
        .data(data)
        .enter()
        .append("text")
        .text(d => (d.abbr))
        .attr("x", d => xLinScale(d[XAxis]))
        .attr("y", d => yLinScale(d[YAxis]))
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .style('fill', 'black')
        
    var groupLabels = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var poverty = groupLabels.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") 
        .classed("active", true)
        .text("In Poverty (%)");

    var age = groupLabels.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") 
        .classed("inactive", true)
        .text("Age (Median)");

    var income = groupLabels.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") 
        .classed("inactive", true)
        .text("Household Income (Median)");

    var healthcare = groupLabels.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", (margin.left) * 2.5)
        .attr("y", 0 - (height - 60))
        .attr("value", "healthcare") 
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var smoke = groupLabels.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", (margin.left) * 2.5)
        .attr("y", 0 - (height - 40))
        .attr("value", "smokes") 
        .classed("inactive", true)
        .text("Smokes (%)");

    var obesity = groupLabels.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", (margin.left) * 2.5)
        .attr("y", 0 - (height - 20))
        .attr("value", "obesity") 
        .classed("inactive", true)
        .text("Obesity (%)");

    // Update tool tip function 
    var circleHover = changeToolTip(XAxis, YAxis, circleHover);

    // Add x-axis labels to event listener
    groupLabels.selectAll("text")
        .on("click", function() {
            
            var value = d3.select(this).attr("value");

            if (true) {
                if (value === "poverty" || value === "age" || value === "income") {

                    XAxis = value;

                    xLinScale = xScale(data, XAxis);

                    xAxis = renderXaxis(xLinScale, xAxis);

                    // Change to bold text
                    if (XAxis === "poverty") {
                        poverty
                            .classed("active", true)
                            .classed("inactive", false);

                        age
                            .classed("active", false)
                            .classed("inactive", true);
                        
                        income
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (XAxis === "age"){
                        poverty
                            .classed("active", false)
                            .classed("inactive", true);

                        age
                            .classed("active", true)
                            .classed("inactive", false);

                        income
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {
                        poverty
                            .classed("active", false)
                            .classed("inactive", true);

                        age
                            .classed("active", false)
                            .classed("inactive", true)

                        income
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                
                } else {

                    YAxis = value;

                    // Update y-scale 
                    yLinScale = yScale(data, YAxis);

                    // Update y-axis with transition
                    yAxis = renderYaxis(yLinScale, yAxis);

                    // Change to bold text
                    if (YAxis === "healthcare") {
                        healthcare
                            .classed("active", true)
                            .classed("inactive", false);

                        smoke
                            .classed("active", false)
                            .classed("inactive", true);

                        obesity
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (YAxis === "smokes"){
                        healthcare
                            .classed("active", false)
                            .classed("inactive", true);

                        smoke
                            .classed("active", true)
                            .classed("inactive", false);

                        obesity
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {
                        healthcare
                            .classed("active", false)
                            .classed("inactive", true);

                        smoke
                            .classed("active", false)
                            .classed("inactive", true);

                        obesity
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                
                }

                // Update circles with new x-values
                circleHover = updateCircles(circleHover, xLinScale, yLinScale, XAxis, YAxis);

                // Update toolTips with new info
                circleHover = changeToolTip(XAxis, YAxis, circleHover);

                // Update text with new values
                circleText = updateText(circleText, xLinScale, yLinScale, XAxis, YAxis);

            }
            
        });

});