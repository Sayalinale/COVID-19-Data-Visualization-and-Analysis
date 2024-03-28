import { select, json, geoPath, geoOrthographic, tsv, csv ,} from 'd3';
import { feature } from 'topojson';

const svg = select('svg');
const projection = geoOrthographic();
const pathGenerator = geoPath().projection(projection);

svg.append('path')
  .attr('class', 'sphere')
  .attr('d', pathGenerator({ type: 'Sphere' }));

Promise.all([
  tsv('https://unpkg.com/world-atlas@1.1.4/world/110m.tsv'),
  json('https://unpkg.com/world-atlas@1.1.4/world/110m.json'),
  csv('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv')
]).then(([tsvData, topoJSONdata, CovidDAta]) => {

  const countryName = {};
  tsvData.forEach(d => { countryName[d.iso_n3] = d.name; });

  const totalCases = {};
  CovidDAta.forEach(d => {
    const location = d.location;
    const cases = +d.new_cases;
    if (cases > 0) {
      totalCases[location] = (totalCases[location] || 0) + cases;
    }
  });

  const countries = feature(topoJSONdata, topoJSONdata.objects.countries);

  svg.selectAll('path').data(countries.features)
    .enter().append('path')
    .attr('class', 'country')
    .attr('d', pathGenerator)
    .append('title')
    .text(d => {
      const location = countryName[d.id];
      const covidCases = totalCases[location];
      return `${location}: ${covidCases ? covidCases.toLocaleString() : 'No data available'}`;
    });
});
