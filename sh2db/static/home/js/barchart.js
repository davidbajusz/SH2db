function barchart(url_mask, width, height){
    // Set margins to provide more space for labels
    const margin = {top: 40, right: 40, bottom: 60, left: 60};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Remove existing SVG and create a new one with more space
    d3.select("svg").remove();
    const svg = d3.select("#grouped_bars")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",`translate(${margin.left},${margin.top})`);
        
    // Create tooltip div
    const tooltip = d3.select("#grouped_bars")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "rgba(0, 0, 0, 0.7)")
        .style("color", "white")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("pointer-events", "none");
        
    // Parse the Data 
    d3.csv( url_mask ).then( function(data) {
    
    // List of subgroups = header of the csv files = soil condition here
    const subgroups = data.columns.slice(1)

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    const groups = data.map(d => d.group)

    const max_y = d3.max(data.map(d => parseInt(d.count) ) )

    // Add X axis with rotated labels and increased text size
    const x = d3.scaleBand()
        .domain(groups)
        .range([0, innerWidth])
        .padding([0.4])
    svg.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)")
            .style("font-size", "16px");

    // Add Y axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (innerHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Count")
        .style("font-size", "18px");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 1.1 * max_y])
        .range([ innerHeight, 0 ]);
    svg.append("g")
        .call(d3.axisLeft(y).ticks(10))
        .selectAll("text")
            .style("font-size", "16px");

    // Another scale for subgroup position
    const xSubgroup = d3.scaleBand()
        .domain(subgroups)
        .range([0, x.bandwidth()])
        .padding([0.05])

    // Pastel color palette = one color per subgroup
    const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#FFB3BA', '#BAFFC9', '#BAE1FF'])  // Pastel pink, green, blue

    // Show the bars with animation
    const rects = svg.append("g")
        .selectAll("g")
        .data(data)
        .join("g")
            .attr("transform", d => `translate(${x(d.group)}, 0)`)
        .selectAll("rect")
        .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key], group: d.group}; }); })
        .join("rect")
            .attr("x", d => xSubgroup(d.key))
            .attr("y", innerHeight) // Start bars from bottom
            .attr("width", xSubgroup.bandwidth())
            .attr("height", 0) // Initial height is 0
            .attr("fill", d => color(d.key))
            .attr("class", "bar-rect")
            .on("mouseover", function(event, d) {
                // Darken the bar on hover
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("fill", d3.color(color(d.key)).darker(0.7));
                
                // Show tooltip
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Group: ${d.group}<br/>Category: ${d.key}<br/>Value: ${d.value}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                // Restore original color
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("fill", color(d.key));
                
                // Hide tooltip
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

    // Animate bars growing from bottom to their actual height
    rects
        .transition()
        .duration(800)
        .delay((d, i) => i * 50) // Staggered animation
        .attr("y", d => y(d.value))
        .attr("height", d => innerHeight - y(d.value));
    });
}