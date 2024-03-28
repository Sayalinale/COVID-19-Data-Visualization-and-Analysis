(function (d3, topojson) {
  'use strict';
  const svg = d3.select('svg');
  const projection = d3.geoOrthographic();
  const pathGenerator = d3.geoPath().projection(projection);
  svg.append('path')
    .attr('class', 'sphere')
    .attr('d', pathGenerator({ type: 'Sphere' }));




  Promise.all([
    d3.tsv('https://unpkg.com/world-atlas@1.1.4/world/110m.tsv'),
    d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json'),
    d3.csv('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv'),
    d3.csv('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.csv')])
    .then(([tsvData, topoJSONdata, CovidDAta, VaccinationData]) => {
      // console.log(VaccinationData);


      const countryName = {};
      tsvData.forEach(d => {
        countryName[d.iso_n3] = d.name;
      });


      //Total Cases by the country
      const totalCases = {};
      CovidDAta.forEach(d => {
        const location = d.location;
        const cases = +d.new_cases;
        if (cases > 0) {
          totalCases[location] = (totalCases[location] || 0) + cases;
        }
      });

      //Total DeathCases by the country
      const totalDeathCount = {};
      CovidDAta.forEach(d => {
        const location = d.location;
        const Dtcases = +d.new_deaths;
        if (Dtcases > 0) {
          totalDeathCount[location] = (totalDeathCount[location] || 0) + Dtcases;
        }
      });


      //Total vcCases by the country
      const vaccCount = {};
      CovidDAta.forEach(d => {
        const location = d.location;
        const VCcases = +d.people_vaccinated;
        if (VCcases > 0) {
          vaccCount[location] = (vaccCount[location] || 0) + VCcases;
        }
      });



      // Name of the countries
      const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries);

      svg.selectAll('path').data(countries.features)
        .enter().append('path')
        .attr('class', 'country')
        .attr('d', pathGenerator)
        .append('title')
        .text(d => {
          const location = countryName[d.id];
          const covidCases = totalCases[location];
          const deathPeople = totalDeathCount[location];
          const vaccinationdPeople = vaccCount[location];
          return `${location} \n Cases:${covidCases ? covidCases.toLocaleString() : 'No data available'}\nTotal Deaths: ${deathPeople} \n Total Vaccinations: ${vaccinationdPeople} `;
        });



      //Cases according countires dropdown(line_cart) 
      var Country_locations = d3.set(CovidDAta.map(function (d) { return d.location; })).values();
      // console.log(Country_locations); 



      // Create select element and options
      var dropdownContainer = d3.select("#dropdown-container");

      dropdownContainer.append("label")
        .attr("for", "location-select")
        .text("Select The Country");

      var select = dropdownContainer.append("select")
        .attr("id", "location-select")
        .on("change", function () {
          updateVisualization();
        });


      //Options For the dropdown
      select.selectAll("option")
        .data(Country_locations)
        .enter()
        .append("option")
        .attr("value", function (d) { return d; })
        .text(function (d) { return d; });

      // Function to update visualization based on selected location
      function updateVisualization() {

        var selectedLocation = d3.select("#location-select").property("value");

        // Filter data for selected location and create line chart
        d3.csv("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv")
          .then(function (data_filter) {
            // console.log(data)
            var filteredData = data_filter.filter(function (d) { return d.location === selectedLocation; });


            // console.log(filteredData)
            // Parse date and cases data 
            var parseDate = d3.timeParse("%Y-%m-%d");
            var casesData = [];
            filteredData.forEach(function (d) {
              if (d.date >= "2020-01-01" && d.date <= "2023-03-12") {
                casesData.push({
                  date: parseDate(d.date),
                  cases: +d.new_cases

                });

              }
            });

            // console.log(casesData);

            // Set up chart dimensions
            var margin = { top: 20, right: 20, bottom: 30, left: 50 };
            var width = 600 - margin.left - margin.right;
            var height = 400 - margin.top - margin.bottom;

            // Create x and y scales
            var x = d3.scaleTime()
              .domain(d3.extent(casesData, function (d) { return d.date; }))
              .range([0, width]);

            var y = d3.scaleLinear()
              .domain([0, d3.max(casesData, function (d) { return d.cases; })])
              .range([height, 0]);

            // Create line function
            var line = d3.line()
              .x(function (d) { return x(d.date); })
              .y(function (d) { return y(d.cases); });

            // Create SVG element
            d3.select("#chart-container").selectAll("*").remove();
            var svg = d3.select("#chart-container")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Add line to SVG
            svg.append("path")
              .datum(casesData)
              .attr("class", "line")
              .attr("d", line)
              .attr('fill', '#80b1d3')


            // Add x axis to SVG
            svg.append("g")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(x));

            // Add y axis to SVG
            svg.append("g")
              .call(d3.axisLeft(y));

            // Add chart title
            svg.append("text")
              .attr("x", width / 2)
              .attr("y", 0 - (margin.top / 2))
              .attr("text-anchor", "middle")
              .text(selectedLocation + " - New Cases in 2020-2023");



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
              .text('Total number of Cases');
          });
      }
    });












}(d3, topojson));










//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNlbGVjdCwganNvbiwgZ2VvUGF0aCxnZW9PcnRob2dyYXBoaWMsdHN2IH0gZnJvbSAnZDMnO1xuaW1wb3J0IHtmZWF0dXJlfSBmcm9tICd0b3BvanNvbic7XG5cbmNvbnN0IHN2ZyA9IHNlbGVjdCgnc3ZnJyk7XG5cbmNvbnN0IHByb2plY3Rpb24gPSBnZW9PcnRob2dyYXBoaWMoKTtcbmNvbnN0IHBhdGhHZW5lcmF0b3I9Z2VvUGF0aCgpLnByb2plY3Rpb24ocHJvamVjdGlvbik7IFxuc3ZnLmFwcGVuZCgncGF0aCcpXG4gIC5hdHRyKCdjbGFzcycsJ3NwaGVyZScpXG4gIC5hdHRyKCdkJyxwYXRoR2VuZXJhdG9yKHt0eXBlOidTcGhlcmUnfSkpO1xuXG5Qcm9taXNlLmFsbChbXG4gIHRzdignaHR0cHM6Ly91bnBrZy5jb20vd29ybGQtYXRsYXNAMS4xLjQvd29ybGQvMTEwbS50c3YnKSxcbiAganNvbignaHR0cHM6Ly91bnBrZy5jb20vd29ybGQtYXRsYXNAMS4xLjQvd29ybGQvMTEwbS5qc29uJylcbiBdKS50aGVuKChbdHN2RGF0YSx0b3BvSlNPTmRhdGFdKT0+XG4gICAgICB7XG4gICAgY29uc3QgY291bnRyeU5hbWU9e307XG4gICAgdHN2RGF0YS5mb3JFYWNoKGQ9PntcbiAgICBjb3VudHJ5TmFtZVtkLmlzb19uM109ZC5uYW1lO1xuICAgIH0pOyBcbiAgXG4gICAgY29uc3QgY291bnRyaWVzPWZlYXR1cmUodG9wb0pTT05kYXRhLHRvcG9KU09OZGF0YS5vYmplY3RzLmNvdW50cmllcylcbiAgXG4gICBzdmcuc2VsZWN0QWxsKCdwYXRoJykuZGF0YShjb3VudHJpZXMuZmVhdHVyZXMpXG4gICAgICAuZW50ZXIoKS5hcHBlbmQoJ3BhdGgnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywnY291bnRyeScpXG4gICAgICAuYXR0cignZCcscGF0aEdlbmVyYXRvcilcbiAgICAgIC5hcHBlbmQoJ3RpdGxlJylcbiAgICAgIC50ZXh0KGQgPT5jb3VudHJ5TmFtZVtkLmlkXSk7XG59ICk7XG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4iXSwibmFtZXMiOlsic2VsZWN0IiwiZ2VvT3J0aG9ncmFwaGljIiwiZ2VvUGF0aCIsInRzdiIsImpzb24iLCJmZWF0dXJlIl0sIm1hcHBpbmdzIjoiOzs7RUFHQSxNQUFNLEdBQUcsR0FBR0EsU0FBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzFCO0VBQ0EsTUFBTSxVQUFVLEdBQUdDLGtCQUFlLEVBQUUsQ0FBQztFQUNyQyxNQUFNLGFBQWEsQ0FBQ0MsVUFBTyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0VBQ3JELEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQ2xCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7RUFDekIsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUM7RUFDQSxPQUFPLENBQUMsR0FBRyxDQUFDO0VBQ1osRUFBRUMsTUFBRyxDQUFDLG9EQUFvRCxDQUFDO0VBQzNELEVBQUVDLE9BQUksQ0FBQyxxREFBcUQsQ0FBQztFQUM3RCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7RUFDaEMsTUFBTTtFQUNOLElBQUksTUFBTSxXQUFXLENBQUMsRUFBRSxDQUFDO0VBQ3pCLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUU7RUFDdkIsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7RUFDakMsS0FBSyxDQUFDLENBQUM7RUFDUDtFQUNBLElBQUksTUFBTSxTQUFTLENBQUNDLGdCQUFPLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFDO0VBQ3hFO0VBQ0EsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO0VBQ2pELE9BQU8sS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUM3QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO0VBQzlCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUM7RUFDOUIsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDO0VBQ3RCLE9BQU8sSUFBSSxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDbkMsQ0FBQyxFQUFFOzs7OyJ9