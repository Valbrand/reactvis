import React, { Component, PropTypes } from 'react';
const d3 = require('d3');

export default class Histogram extends Component {
  constructor (props, ...args) {
    super(props, ...args);

    this.state = {
      isAdjusted: false,
    };

    this.xScale = d3.scaleLinear()
      .domain([ 0, d3.max(props.data) ])
      .range([ 0, props.width ]);

    this.yScale = d3.scaleLinear()
      .domain([ 0, props.data.length ])
      .range([ props.height, 0 ]);

    this.yAxisGroup = this.xAxisGroup = null;
    this.xOffset = this.yOffset = null;
    this.yPadding = null;
  }

  getChartBars () {
    const actualChartWidth = this.xScale.range()[1];
    const actualChartHeight = this.yScale.range()[0];

    const processedData = this.props.data.reduce((result, entry) => {
      result[]

      return result;
    }, Array(this.props.data.length).fill(0));

    const paddingWidth = this.props.padding * (this.props.data.length - 1);
    const barWidth = (actualChartWidth - paddingWidth) / this.props.data.length;

    return this.props.data.map((entry, index) => {
      const barX = (barWidth + this.props.padding) * index;
      const barY = this.yScale(entry);
      const barHeight = actualChartHeight - barY;

      return (
        <rect
          key={index}
          x={barX}
          y={barY}
          width={barWidth}
          height={barHeight}
        />
      );
    });
  }

  getChartContent () {
    if (this.state.isAdjusted) {
      return (
        <g
          className="chartData"
          transform={`translate(${this.xOffset}, ${this.yPadding})`}
        >
          {this.getChartBars()}
        </g>
      );
    } else {
      return null;
    }
  }

  render () {
    return (
      <svg
        ref="chart"
        width={this.props.width}
        height={this.props.height}
      >
        {this.getChartContent()}
      </svg>
    );
  }

  createYAxis () {
    if (!this.yAxisGroup) {
      this.yAxisGroup = d3.select(this.refs.chart).append('g')
        .attr('id', 'yAxis');
    }

    if (this.xOffset) {
      this.yAxisGroup
        .attr('transform', `translate(${this.xOffset}, ${this.yPadding})`);
    }

    const axis = d3.axisLeft(this.yScale);

    this.yAxisGroup.call(axis);
  }

  createXAxis () {
    if (!this.xAxisGroup) {
      this.xAxisGroup = d3.select(this.refs.chart).append('g')
        .attr('id', 'xAxis');
    }

    if (this.yOffset) {
      this.xAxisGroup
        .attr('transform', `translate(${this.xOffset}, ${this.props.height - this.yOffset})`);
    }

    const axis = d3.axisBottom(this.xScale);

    this.xAxisGroup.call(axis);
  }

  adjustScales () {
    const xAxisBoundingBox = this.xAxisGroup.node().getBBox();
    const yAxisBoundingBox = this.yAxisGroup.node().getBBox();

    this.xOffset = yAxisBoundingBox.width;
    if (xAxisBoundingBox.width > this.props.width) {
      this.xPadding = xAxisBoundingBox.width - this.props.width;
    }

    this.yOffset = xAxisBoundingBox.height;
    if (yAxisBoundingBox.height > this.props.height) {
      this.yPadding = yAxisBoundingBox.height - this.props.height;
    }

    this.xScale.range([ 0, this.props.width - (this.xOffset + this.xPadding) ]);
    this.yScale.range([ this.props.height - (this.yOffset + this.yPadding), 0 ]);
  }

  componentDidMount () {
    if (!this.state.isAdjusted) {
      this.createYAxis();
      this.createXAxis();

      this.adjustScales();

      /* eslint react/no-did-mount-set-state: 0 */
      this.setState({
        isAdjusted: true,
      });
    }
  }

  componentDidUpdate () {
    this.createYAxis();
    this.createXAxis();
  }
}

Histogram.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  data: PropTypes.array.isRequired,
  padding: PropTypes.number,
};

Histogram.defaultProps = {
  padding: 5,
};
