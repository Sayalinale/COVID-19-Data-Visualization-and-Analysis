///////Donut chart for the total cases in the year 2020. 2021 and 2022


// Loading the data
d3.csv("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv")
    .then(function (donutdata) {

        // Parse the date column and extract the year
        var parseDate = d3.timeParse("%Y-%m-%d");
        donutdata.forEach(function (d) {
            d.date = parseDate(d.date);
            d.year = d.date.getFullYear();
        });

        // Filter the data for the  years 2020, 2021 and 2022
        var data2020 = donutdata.filter(function (d) { return d.year === 2020; });
        var data2021 = donutdata.filter(function (d) { return d.year === 2021; });
        var data2022 = donutdata.filter(function (d) { return d.year === 2022; });

        // Calculate the totalnew cases for each year
        var total2020 = d3.sum(data2020, function (d) { return +d.new_cases; });
        var total2021 = d3.sum(data2021, function (d) { return +d.new_cases; });
        var total2022 = d3.sum(data2022, function (d) { return +d.new_cases; });

        // Set up the chart 
        var width = 400,
            height = 400,
            radius = Math.min(width, height) / 2;

        // Set up the  scale for color
        var color = d3.scaleOrdinal()
            .domain(["2020", "2021", "2022"])
            .range(["#fdb462", "#fb8072", "#80b1d3"]);

        // Set up the arc generator
        var arc = d3.arc()
            .outerRadius(radius - 20)
            .innerRadius(radius - 90);

        // Set up the pie generator
        var pie = d3.pie()
            .sort(null)
            .value(function (d) { return d.value; });

        // Create the  SVG element for chart
        var svg = d3.select("#Donut_chart").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // Create the arcs for the donut chart
        var arcs = svg.selectAll(".arc")
            .data(pie([
                { key: "2020", value: total2020 },
                { key: "2021", value: total2021 },
                { key: "2022", value: total2022 }
            ]))
            .enter().append("g")
            .attr("class", "arc");

        // Add the path elements to the arcs of chart
        arcs.append("path")
            .attr("d", arc)
            .attr("fill", function (d) { return color(d.data.key); });


        // Add text labels to the arcs
        arcs.append("text")
            .attr("transform", function (d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .attr("dy", "0.35em")
            .text(function (d) { return d.data.key; });



        // Add a legend for the donut chart
        var legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
                return "translate(" + (width - 100) + "," + (i * 20 + 20) + ")";
            });

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(function (d) { return d; });

    });




///////////////////////////////////////////Vaccinations Lollipop Chart ////////////////////////

// Define chart dimensions and margins
const margin = { top: 30, right: 30, bottom: 50, left: 110 };
const width = 500 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

// Load the data
d3.csv("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv")
    .then(function (vaccineData) {

        // Parse the date column and extract the year
        var parseDate = d3.timeParse("%Y-%m-%d");
        vaccineData.forEach(function (d) {
            d.date = parseDate(d.date);
            d.year = d.date.getFullYear();
        });

        // Filter the data for the  years
        var data2020 = vaccineData.filter(function (d) { return d.year === 2020; });
        var data2021 = vaccineData.filter(function (d) { return d.year === 2021; });
        var data2022 = vaccineData.filter(function (d) { return d.year === 2022; });

        // Calculate the total daily vaccinations for the each year
        var total2020 = d3.sum(data2020, function (d) { return +d.new_vaccinations; });
        var total2021 = d3.sum(data2021, function (d) { return +d.new_vaccinations; });
        var total2022 = d3.sum(data2022, function (d) { return +d.new_vaccinations; });


        // Define the data
        const chardata = [
            { name: '2020', value: total2020 },
            { name: '2021', value: total2021 },
            { name: '2022', value: total2022 },

        ];


        // Create the SVG element
        const svg = d3.select('.vaccine_chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        //.on("click", function (d) { updateVisualization() });

        // Create the x-axis scale
        const x = d3.scaleBand()
            .range([0, width])
            .domain(chardata.map(d => d.name))
            .padding(0.2);

        // Create the y-axis scale
        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(chardata, d => d.value)]);

        // Create the x-axis
        const xAxis = d3.axisBottom(x);

        // Create the y-axis
        const yAxis = d3.axisLeft(y);

        // Add the x-axis to the chart
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis);

        // Add the y-axis to the chart
        svg.append('g')
            .attr("transform", "translate(0, 0)")
            .call(yAxis);

        // Add the dots to the chart
        const dots = svg.selectAll('.dot')
            .data(chardata)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(d.name) + x.bandwidth() / 2)
            .attr('cy', d => y(d.value))
            .attr('r', 5);

        // Add the lines to the chart
        const lines = svg.selectAll('.line')
            .data(chardata)
            .enter()
            .append('line')
            .attr('class', 'line')
            .attr('x1', d => x(d.name) + x.bandwidth() / 2)
            .attr('y1', d => y(d.value))
            .attr('x2', d => x(d.name) + x.bandwidth() / 2)
            .attr('y2', y(0))


        // Add chart title
        svg.append('text')
            .attr('x', (width / 2))
            .attr('y', 0 - (margin.top / 2))
            .attr('text-anchor', 'middle')
            .style('font-size', '18px')
            .text('Vaccinations by the year');

        // Add x-axis label
        svg.append('text')
            .attr('transform', `translate(${width / 2},${height + margin.top + 20})`)
            .attr('text-anchor', 'middle')
            .text('Year');

        // Add y-axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Total Vaccinated People');

    });


/////////////////////////////////Area Graph for the Total Deaths/////////////////////



d3.text("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv")
    .then(function (text) {
        const Death_data = d3.csvParse(text, function (d) {
            return {
                date: d3.timeParse("%Y-%m-%d")(d.date),
                new_deaths: +d.new_deaths
            };
        });
        // Set up the margin and dimensions of the chart
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create the SVG element and set its dimensions
        const svg = d3.select("#areachart_death")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Define the x and y scales
        const xScale = d3.scaleUtc()
            .domain(d3.extent(Death_data, d => d.date))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(Death_data, d => d.new_deaths)])
            .nice()
            .range([height, 0]);

        // Define the area generator
        const area = d3.area()
            .x(d => xScale(d.date))
            .y0(height)
            .y1(d => yScale(d.new_deaths));

        // console.log(d.new_deaths);

        // Draw the area chart
        svg.append("path")
            .datum(Death_data)
            .attr("fill", "steelblue")
            .attr("d", area)
            .text("Sayali");

        // Add the x-axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));

        // Add the y-axis
        svg.append("g")
            .call(d3.axisLeft(yScale));




        // Add x-axis label
        svg.append('text')
            .attr('transform', `translate(${width / 2},${height + margin.top + 20})`)
            .attr('text-anchor', 'middle')
            .text('Year');

        // Add y-axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Total number of deaths');


    });

///////////////////////////////////////////Scatter Plot for the GDP /////////////////


// Create tooltip
var tooltip = d3
    .select("#GDP")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
// Load data from CSV file
d3.csv(
    "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv"
).then(function (data) {
    // Get default selected country
    var defaultCountry = d3.select("#country-select_GDP").property("value");
    var selectedCountries = ["United States", "Italy", "Angola", "Japan", "France"];

    // Filter data for selected country
    var filteredData = data.filter(function (d) {
        return d.location === defaultCountry;
    });

    // Set up margin and dimensions
    var margin = { top: 20, right: 20, bottom: 50, left: 50 },
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Create SVG element
    var svg = d3
        .select("#GDP")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create scales
    var xScale = d3
        .scaleLinear()
        .domain(d3.extent(filteredData, function (d) {
            return +d.gdp_per_capita;
        }))
        .range([0, width]);
    var yScale = d3
        .scaleLinear()
        .domain(d3.extent(filteredData, function (d) {
            return +d.new_cases_per_million;
        }))
        .range([height, 0]);

    // Add data points
    svg
        .selectAll("circle")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return xScale(+d.gdp_per_capita);
        })
        .attr("cy", function (d) {
            return yScale(+d.new_cases_per_million);
        })
        .attr("r", 5)
        .attr("fill", function (d) {
            if (d.location === "United States") {
                return "purple";
            } else if (d.location === "Italy") {
                return "green";
            } else if (d.location === "Angola") {
                return "blue";
            } else if (d.location === "Japan") {
                return "purple";
            } else if (d.location === "France") {
                return "orange";
            }
        })
        .on("mouseover", function (event, d) {
            // Show tooltip with x-axis and y-axis values
            tooltip.transition().duration(200);
            tooltip.html(
                "GDP per capita: " +
                d.gdp_per_capita +
                "<br>New cases per million: " +
                d.new_cases_per_million
            )
                .style("left", event.pageX + "px")
                .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function (d) {
            // Hide tooltip
            tooltip.transition().duration(500);
        });

    // Add x-axis
    svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "x-axis") // add class to select later for update
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.bottom - 10)
        .attr("fill", "black")
        .attr("font-size", "14px")
        .text("GDP per capita");

    // Add y-axis
    svg
        .append("g")
        .attr("class", "y-axis") // add class to select later for update
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("transform", "rotate(-90)")
        .attr("fill", "black")
        .attr("font-size", "14px")
        .text("Total number of cases");

    // Add dropdown menu
    var countrySelect = d3.select("#country-select_GDP");
    var options = countrySelect.selectAll("option").data(selectedCountries);
    options
        .enter()
        .append("option")
        .merge(options)
        .attr("value", function (d) {
            return d;
        })
        .text(function (d) {
            return d;
        });

    // Update scatter plot when dropdown selection changes
    countrySelect.on("change", function () {
        var selectedCountry = d3.select(this).property("value");
        var filteredData = data.filter(function (d) {
            return d.location === selectedCountry;
        });

        // Create scales
        var xScale = d3
            .scaleLinear()
            .domain([
                d3.min(filteredData, function (d) {
                    return +d.gdp_per_capita;
                }) * 0.9, // set a small buffer on either side
                d3.max(filteredData, function (d) {
                    return +d.gdp_per_capita;
                }) * 1.1
            ])
            .range([0, width]);

        var yScale = d3
            .scaleLinear()
            .domain([
                d3.min(filteredData, function (d) {
                    return +d.new_cases_per_million;
                }) * 0.9,
                d3.max(filteredData, function (d) {
                    return +d.new_cases_per_million;
                }) * 1.1
            ])
            .range([height, 0]);

        // Update circles
        svg.selectAll("circle")
            .data(filteredData)
            .attr("fill", function (d) {
                if (d.location === "United States") {
                    return "purple";
                } else if (d.location === "Italy") {
                    return "green";
                } else if (d.location === "Angola") {
                    return "blue";
                } else if (d.location === "Japan") {
                    return "purple";
                } else if (d.location === "France") {
                    return "orange";
                }
            })
            .transition()
            .duration(1000)
            .attr("cx", function (d) {
                return xScale(+d.gdp_per_capita);
            })
            .attr("cy", function (d) {
                return yScale(+d.new_cases_per_million);
            });

        // Update x-axis
        svg.select(".x-axis")
            .transition()
            .duration(1000)
            .call(d3.axisBottom(xScale));

        // Update y-axis
        svg.select(".y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(yScale));
    });

});



////////////////////////////////////////HDP Plot ////////////////////////////




// append the svg object to the body of the page
var svg = d3.select("#HDP_chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip
var tooltip = d3.select("#HDP_chart")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


// load the data
d3.csv("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv").then(function (data) {

    // filter the data to get the latest date for each country
    var latestData = d3.group(data.filter(function (d) { return d.date == "2022-12-31" }), d => d.location);

    // get the top 5 countries with the highest human development index
    var topCountries = Array.from(latestData.keys())
        .sort(function (a, b) { return latestData.get(b)[0].human_development_index - latestData.get(a)[0].human_development_index })
        .slice(0, 5);

    // filter the data to keep only the top 5 countries
    var filteredData = data.filter(function (d) { return topCountries.includes(d.location) });

    // create scales for x and y axis
    var xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain(d3.extent(filteredData, function (d) { return d.human_development_index }))
        .range([height, 0]);

    // create x and y axis
    var xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format(".2s"));

    var yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Total Cases per Million");

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Human Development Index");


    // add the dots
    var dots = svg.selectAll(".dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", function (d) { return xScale(d.total_cases_per_million) })
        .attr("cy", function (d) { return yScale(d.human_development_index) })
        .attr("r", 5)
        .on("mouseover", function (event, d) {
            // show the tooltip on mouseover
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(d.location + "<br>" + "HDI: " + d.human_development_index)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (event, d) {
            // hide the tooltip on mouseout
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // add zoom and brush functionality
    var zoom = d3.zoom()
        .scaleExtent([0.5, 20])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    svg.call(zoom);

    var brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("brush end", brushed);

    svg.append("g")
        .attr("class", "brush")
        .call(brush);

    // function to handle zoom event
    function zoomed() {
        dots.attr("transform", d3.event.transform);
        svg.select(".x-axis").call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
    }

    // function to handle brush event
    function brushed(event, d) {
        if (event.selection) {
            var x0 = xScale.invert(event.selection[0][0]),
                x1 = xScale.invert(event.selection[1][0]),
                y0 = yScale.invert(event.selection[1][1]),
                y1 = yScale.invert(event.selection[0][1]);

            dots.classed("selected", function (d) {
                return x0 <= d.total_cases_per_million && d.total_cases_per_million <= x1
                    && y0 <= d.human_development_index && d.human_development_index <= y1;
            });
        } else {
            dots.classed("selected", false);
        }
    }
});
