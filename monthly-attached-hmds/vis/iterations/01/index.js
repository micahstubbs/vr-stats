d3.csv('data.csv').then(data => boxplot(data))

function boxplot(data) {
  // setup the plot area
  const h = 500
  const w = 500

  const margin = {
    top: 20,
    bottom: 20,
    left: 20,
    right: 30
  }

  d3.select('body')
    .append('svg')
    .attr('height', h)
    .attr('width', w)

  //
  // map variables in the data to types
  //

  // categorical variable
  const catVariable = 'day'
  const catValues = data.map(d => Number(d[catVariable]))

  // numeric variable statistics
  const minVariable = 'min'
  const maxVariable = 'max'
  const medianVariable = 'median'
  const q1Variable = 'q1'
  const q3Variable = 'q3'

  // define the scales
  xScale = d3
    .scaleLinear()
    .domain([0, 100]) // 0% to 100%
    .range([margin.left, w - margin.right])

  yScale = d3
    .scaleLinear()
    .domain([
      Number(d3.max(data, d => d[catVariable])) + 1,
      Number(d3.min(data, d => d[catVariable])) - 1
    ])
    .range([h - margin.bottom, margin.top])

  console.log(data)

  // setup the axes
  xAxis = d3
    .axisBottom()
    .scale(xScale)
    .ticks(10)
    .tickSize(-470)

  d3.select('svg')
    .append('g')
    .attr('transform', 'translate(0,480)')
    .attr('id', 'xAxisG')
    .call(xAxis)

  yAxis = d3
    .axisRight()
    .scale(yScale)
    .tickSize(-470)
    .tickValues(catValues)

  d3.select('svg')
    .append('g')
    .attr('transform', 'translate(470,0)')
    .attr('id', 'yAxisG')
    .call(yAxis)

  d3.select('svg')
    .selectAll('g.box')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'box')
    .attr(
      'transform',
      d => `translate(${xScale(d[medianVariable])},${yScale(d[catVariable])})`
    )
    .each(function(d, i) {
      d3.select(this)
        .append('line')
        .attr('class', 'range')
        .attr('x1', xScale(d[maxVariable]) - xScale(d[medianVariable]))
        .attr('x2', xScale(d[minVariable]) - xScale(d[medianVariable]))
        .attr('y1', 0)
        .attr('y2', 0)
        .style('stroke', 'black')
        .style('stroke-width', '4px')

      d3.select(this)
        .append('line')
        .attr('class', 'max')
        .attr('x1', xScale(d[maxVariable]) - xScale(d[medianVariable]))
        .attr('x2', xScale(d[maxVariable]) - xScale(d[medianVariable]))
        .attr('y1', -10)
        .attr('y2', 10)
        .style('stroke', 'black')
        .style('stroke-width', '4px')

      d3.select(this)
        .append('line')
        .attr('class', 'min')
        .attr('x1', xScale(d[minVariable]) - xScale(d[medianVariable]))
        .attr('x2', xScale(d[minVariable]) - xScale(d[medianVariable]))
        .attr('y1', -10)
        .attr('y2', 10)
        .style('stroke', 'black')
        .style('stroke-width', '4px')

      d3.select(this)
        .append('rect')
        .attr('class', 'range')
        .attr('x', xScale(d[q1Variable]) - xScale(d[medianVariable]))
        .attr('y', -10)
        .attr('height', 20)
        .attr('width', xScale(d[q3Variable]) - xScale(d[q1Variable]))
        .style('fill', 'white')
        .style('stroke', 'black')
        .style('stroke-width', '2px')

      d3.select(this)
        .append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', -10)
        .attr('y2', 10)
        .style('stroke', 'darkgray')
        .style('stroke-width', '4px')
    })
}
