const svg = d3.select('svg')
const margin = { top: 150, right: 60, bottom: 30, left: 60 }
const width = +svg.attr('width') - margin.left - margin.right
const height = +svg.attr('height') - margin.top - margin.bottom

const x = d3
  .scaleTime()
  .domain([new Date(2015, 4, 1), new Date(2016, 12, 31)])
  .range([0, width])

const y = d3.scaleLinear().rangeRound([height, 0])

const g = svg
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`)

const parseDate = d3.utcParse('%Y%B')

d3.queue()
  .defer(d3.csv, 'data.csv')
  .defer(d3.json, 'annotations.json')
  .awaitAll(render)

function render(err, response) {
  console.log('response', response)
  const data = response[0]
  const annotationsData = response[1]

  // format input data
  data.forEach(d => {
    d.unitsShipped = +d.unitsShipped
    d.launchDate = parseDate(`${d.launchYear}${d.launchMonth}`)
    d.imageXOffset = +d.imageXOffset
    d.imageYOffset = +d.imageYOffset
  })
  annotationsData.forEach(d => {
    d.imageWidth = +d.imageWidth
    d.imageHeight = +d.imageHeight
    d.imageXOffset = +d.imageXOffset
    d.imageYOffset = +d.imageYOffset
  })

  // x.domain(data.map(d => d.letter));
  y.domain([0, d3.max(data, d => d.unitsShipped)])

  const xAxis = d3
    .axisBottom()
    .scale(x)
    // .ticks(d3.timeMonths)
    // .tickSize(16, 0)
    .tickSizeOuter(0)
    .tickFormat(d3.timeFormat('%B %Y'))

  const yAxis = d3
    .axisLeft()
    .scale(y)
    .ticks(10, ',.0f')

  g.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis)

  g.append('g')
    .attr('class', 'axis axis--y')
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '0.71em')
    .attr('text-anchor', 'end')
    .text('Frequency')

  // style the x-axis path
  d3.select('.axis--x path').style('stroke-opacity', 0)

  const defs = svg.append('defs')

  // draw arrow for x-axis baseline
  defs
    .append('marker')
    .attr('id', 'arrow')
    .attr('markerWidth', '6')
    .attr('markerHeight', '6')
    .attr('viewbox', '-3 -3 6 6')
    .attr('refX', '-1')
    .attr('refY', '0')
    .attr('markerUnits', 'strokeWidth')
    .attr('orient', 'auto')
    .attr('overflow', 'visible')
    .append('polygon')
    .attr('points', '-1,0 -2,2 2,0 -2,-2')
    .attr('fill', 'black')

  // draw the baseline with an arrow
  svg
    .append('line')
    .attr('x1', margin.left)
    .attr('y1', height + margin.top)
    .attr('x2', width + margin.left)
    .attr('y2', height + margin.top)
    .style('stroke-width', 4)
    .style('stroke-opacity', 1.0)
    .style('stroke', 'black')
    .attr('transform', 'translate(0,3)')
    .attr('marker-end', 'url(#arrow)')

  // draw the bars
  g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.launchDate))
    // + 1px y so that bar does not protrude
    // above the dot
    .attr('y', d => y(d.unitsShipped) + 1)
    .attr('width', 4)
    .attr('height', d => height - y(d.unitsShipped))
    .style('fill', 'black')
    .on('mouseover', d => console.log(d))

  // draw the circles at the top of the bars
  g.selectAll('.circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'point')
    .attr('cx', d => x(d.launchDate) + 2)
    .attr('cy', d => y(d.unitsShipped) + 6)
    .attr('r', 6)
    .style('fill', 'black')
    .style('fill-opacity', 1.0)
    .on('mouseover', d => console.log(d))

  //
  // draw head-mounted-display images
  //
  const imageScaleFactor = 8
  const images = svg
    .selectAll('image')
    .data(data)
    .enter()
    .append('svg:image')
    .attr('xlink:href', (d, i) => annotationsData[i].imageFileName)
    .attr(
      'x',
      (d, i) =>
        x(d.launchDate) +
        margin.left +
        annotationsData[i].imageXOffset -
        annotationsData[i].imageWidth / imageScaleFactor / 2
    )
    .attr(
      'y',
      (d, i) =>
        y(d.unitsShipped) +
        margin.top +
        annotationsData[i].imageYOffset -
        annotationsData[i].imageHeight / imageScaleFactor
    )
    .attr('width', (d, i) => annotationsData[i].imageWidth / imageScaleFactor)
    .attr('height', (d, i) => annotationsData[i].imageHeight / imageScaleFactor)
    .call(
      d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    )

  function dragstarted(d) {
    d3.select(this)
      .raise()
      .classed('active', true)
  }
  function dragged(d) {
    d3.select(this)
      .attr('x', (d.x = d3.event.x))
      .attr('y', (d.y = d3.event.y))
  }
  function dragended(d) {
    d3.select(this).classed('active', false)
  }

  // start with the axes hidden
  let axesVisible = false
  d3.selectAll('.axis').style('opacity', 0)

  d3.select('body').on('click', click)

  function click() {
    if (axesVisible) {
      d3.selectAll('.axis').style('opacity', 0)
      axesVisible = false
    } else {
      d3.selectAll('.axis').style('opacity', 1)
      axesVisible = true
    }
  }

  //
  // add labels
  //
  const format = d3.format('.2s')

  // collect annotations data
  // generate data-driven annotation positions
  // pad strings to achieve text alignment
  const annotations = []
  data.forEach((d, i) => {
    let textXOffset = x(d.launchDate) + margin.left - 40
    let textYOffset = y(d.unitsShipped) + margin.top - 100

    if (typeof annotationsData[i].textXOffset !== 'undefined') {
      textXOffset = annotationsData[i].textXOffset
    }
    if (typeof annotationsData[i].textYOffset !== 'undefined') {
      textYOffset = annotationsData[i].textYOffset
    }
    if (typeof d.unitsSuffix === 'undefined') {
      d.unitsSuffix = ''
    }

    annotations.push({
      path: 'M 610,143 A 81.322 81.322 0 0 1 564,221',
      text: [
        `${annotationsData[i].textOffsetLine0}${d.company} ${d.product}`,
        `${annotationsData[i].textOffsetLine1}${d.launchMonth} ${d.launchYear}`,
        `${annotationsData[i].textOffsetLine2}${d.unitsPrefix}${format(
          d.unitsShipped
        )}${d.unitsSuffix} shipped`
      ],
      textOffset: [textXOffset, textYOffset]
    })
  })

  // draw the annotation layer
  const swoopy = d3
    .swoopyDrag()
    .x(d => 0)
    .y(d => 0)
    .draggable(1)
    .annotations(annotations)

  const swoopySel = svg.append('g.swoopy').call(swoopy)

  // no circles for now
  swoopySel.selectAll('circle').remove()

  // no paths or arrowheads for now
  swoopySel.selectAll('path').remove()
  // .attr('marker-end', 'url(#arrow)')

  // svg.append('marker')
  //   .attr('id', 'arrow')
  //   .attr('viewBox', '-10 -10 20 20')
  //   .attr('markerWidth', 20)
  //   .attr('markerHeight', 20)
  //   .attr('orient', 'auto')
  //   .append('path')
  //     .attr('d', 'M-6.75,-6.75 L 0,0 L -6.75,6.75')

  swoopySel.selectAll('text').each(function(d) {
    d3.select(this)
      .text('')
      .tspans(d.text) // d3.wordwrap(d.text, 22)
  })

  swoopySel
    .selectAll('text')
    .style('font-size', 12)
    .style('font-family', 'Roboto')

  // d3.select('g.swoopy').selectAll('g')
  //   .attr('transform', 'translate(0,-20)');
}
