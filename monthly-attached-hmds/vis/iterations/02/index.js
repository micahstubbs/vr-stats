d3.csv('./monthly-attached-hmds.csv').then(data => boxplot(data))

function boxplot(data) {
  // setup the plot area
  const h = 500
  const w = 500

  const margin = {
    top: 20,
    bottom: 40,
    left: 20,
    right: 30
  }

  const innerHeight = h - margin.bottom
  const innerWidth = w - margin.right

  const outerHeight = 500
  const outerWidth = 960

  d3.select('body')
    .append('svg')
    .attr('height', outerHeight)
    .attr('width', outerWidth)

  //
  // map variables in the data to types
  //

  // categorical variable
  const catVariable = 'VR HMD'
  const catValues = data.map(d => d[catVariable])
  console.log('catValues', catValues)

  // numeric variable statistics
  const minVariable = 'min user count estimate'
  const maxVariable = 'max user count estimate'
  const medianVariable = 'median user count estimate'
  const q1Variable = undefined
  const q3Variable = undefined

  // ensure numeric values read from csv data are numbers
  data.forEach(d => {
    if (minVariable) d[minVariable] = Number(d[minVariable])
    if (maxVariable) d[maxVariable] = Number(d[maxVariable])
    if (medianVariable) d[medianVariable] = Number(d[medianVariable])
    if (q1Variable) d[q1Variable] = Number(d[q1Variable])
    if (q3Variable) d[q3Variable] = Number(d[q3Variable])
  })

  // define the scales
  xScale = d3
    .scaleLinear()
    .domain([
      d3.min(data.map(d => d[minVariable])),
      d3.max(data.map(d => d[maxVariable])) * 1.1
    ])
    .rangeRound([margin.left, innerWidth])

  yScale = d3
    .scaleBand()
    .domain(catValues)
    .rangeRound([0, innerHeight])

  console.log(data)

  //
  // setup the axes
  //

  // x-axis
  const xTranslate = innerHeight
  xAxis = d3
    .axisBottom()
    .scale(xScale)
    .ticks(7)
    .tickFormat(d3.format('~s'))
    .tickSize(-xTranslate)

  d3.select('svg')
    .append('g')
    .attr('transform', `translate(0,${xTranslate})`)
    .attr('id', 'xAxisG')
    .call(xAxis)

  // text label for the x axis
  d3.select('svg')
    .append('text')
    .attr('transform', `translate(${w / 2},${h - 5})`)
    .style('text-anchor', 'middle')
    .text('Steam Monthly Attached Head-Mounted Displays')

  // y-axis
  const yTranslate = innerWidth
  yAxis = d3
    .axisRight()
    .scale(yScale)
    .tickSize(-yTranslate)
    .tickValues(catValues)

  d3.select('svg')
    .append('g')
    .attr('transform', `translate(${yTranslate},0)`)
    .attr('id', 'yAxisG')
    .call(yAxis)

  d3.select('svg')
    .selectAll('g.box')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'box')
    .attr('transform', d => {
      const yValue = d[catVariable]
      const yValueScaled = yScale(yValue)
      const yOffset = margin.top * 2
      // console.log('d', d)
      console.log('yValue', yValue)
      console.log('yValueScaled', yValueScaled)
      return `translate(${xScale(d[medianVariable])},${yValueScaled + yOffset})`
    })
    .each(function(d, i) {
      const minScreen = xScale(d[minVariable])
      const medianScreen = xScale(d[medianVariable])
      const maxScreen = xScale(d[maxVariable])
      console.log('d', d)
      console.log('minScreen', minScreen)
      console.log('medianScreen', medianScreen)
      console.log('maxScreen', maxScreen)

      d3.select(this)
        .append('line')
        .attr('class', 'range')
        .attr('x1', xScale(d[maxVariable]) - xScale(d[medianVariable]))
        .attr('x2', xScale(d[minVariable]) - xScale(d[medianVariable]))
        .attr('y1', 0)
        .attr('y2', 0)
        .style('stroke', 'black')
        .style('stroke-width', '3px')

      d3.select(this)
        .append('line')
        .attr('class', 'max')
        .attr('x1', xScale(d[maxVariable]) - xScale(d[medianVariable]))
        .attr('x2', xScale(d[maxVariable]) - xScale(d[medianVariable]))
        .attr('y1', -10)
        .attr('y2', 10)
        .style('stroke', 'black')
        .style('stroke-width', '3px')

      d3.select(this)
        .append('line')
        .attr('class', 'min')
        .attr('x1', xScale(d[minVariable]) - xScale(d[medianVariable]))
        .attr('x2', xScale(d[minVariable]) - xScale(d[medianVariable]))
        .attr('y1', -10)
        .attr('y2', 10)
        .style('stroke', 'black')
        .style('stroke-width', '3px')

      // only draw the box if q1 and q3 variables are defined
      if (q1Variable && q3Variable) {
        d3.select(this)
          .append('rect')
          .attr('class', 'range')
          .attr('x', xScale(d[q1Variable]) - xScale(d[medianVariable]))
          .attr('y', -10)
          .attr('height', 20)
          .attr('width', xScale(d[q3Variable]) - xScale(d[q1Variable]))
          .style('fill', 'white')
          .style('stroke', 'black')
          .style('stroke-width', '3px')
      }

      // median
      d3.select(this)
        .append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', -5)
        .attr('y2', 5)
        .style('stroke', 'darkgray')
        .style('stroke-width', '3px')
    })
}
