function barchart(url_mask, width, height){
    // Set margins with more space for labels
    const margin = {top: 20, right: 30, bottom: 170, left: 70};
    
    // append the svg object to the body of the page
    d3.select("svg").remove();
    const svg = d3.select("#grouped_bars")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",`translate(${margin.left},${margin.top})`);

    // Create tooltip div if it doesn't exist
    const tooltip = d3.select("body").selectAll(".bar-tooltip").data([0])
        .join("div")
        .attr("class", "bar-tooltip");
        
    // Parse the Data 
    d3.csv( url_mask ).then( function(data) {
    
    // List of subgroups = header of the csv files = soil condition here
    const subgroups = data.columns.slice(1)

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    const groups = data.map(d => d.group)

    const max_y = d3.max(data.map(d => parseInt(d.count) ) )

    // Add X axis with rotated labels
    const x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.4])
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
        .style("text-anchor", "end")
        .style("font-size", "14px")
        .attr("dx", "-.8em")
        .attr("dy", "1em")
        .attr("transform", "rotate(-45)");

    // Add Y axis with larger font
    const y = d3.scaleLinear()
        .domain([0, 1.1 * max_y])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "14px");

    // Another scale for subgroup position?
    const xSubgroup = d3.scaleBand()
        .domain(subgroups)
        .range([0, x.bandwidth()])
        .padding([0.05])

    // Pastel color palette with slightly more saturation
    const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#FF9EAA', '#A8E6CF', '#A8E1FF']);

    // Show the bars with animation
    svg.append("g")
        .selectAll("g")
        .data(data)
        .join("g")
        .attr("transform", d => `translate(${x(d.group)}, 0)`)
        .selectAll("rect")
        .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key], group: d.group}; }); })
        .join("rect")
        .attr("x", d => xSubgroup(d.key))
        .attr("y", height) // Start from bottom
        .attr("width", xSubgroup.bandwidth())
        .attr("height", 0) // Start with height 0
        .attr("fill", d => color(d.key))
        .attr("rx", 4) // Rounded corners
        .attr("ry", 4) // Rounded corners
        .attr("opacity", 0.9) // Slightly transparent by default
        .on("mouseover", function(event, d) {
            // Highlight the bar
            d3.select(this)
                .transition()
                .duration(200)
                .attr("opacity", 1)
                .attr("fill", "#e41a1c"); // Original red color for highlight
            
            // Show tooltip with just the value
            tooltip
                .style("opacity", 1)
                .html(d.value)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event, d) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            // Restore bar appearance
            d3.select(this)
                .transition()
                .duration(200)
                .attr("opacity", 0.9)
                .attr("fill", d => color(d.key)); // Restore original color
            
            // Hide tooltip
            tooltip
                .style("opacity", 0);
        })
        .transition() // Add transition
        .duration(800) // Animation duration
        .delay((d, i) => i * 100) // Stagger the animations
        .ease(d3.easeElastic.amplitude(0.5)) // Add elastic effect
        .attr("y", d => y(d.value))
        .attr("height", d => height - y(d.value));
    });
}