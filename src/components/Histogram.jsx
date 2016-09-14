import 'gsap';
import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import ReactTransitionGroup from 'react-addons-transition-group';
const d3 = require('d3');

class HistogramBar extends Component {
  render () {
    return (
      <rect
        x={this.props.x}
        width={this.props.width}
      />
    );
  }

  componentWillAppear (callback) {
    TweenLite.fromTo(
      findDOMNode(this),
      this.props.transitionDuration,
      {
        y: this.props.yScale(0),
        height: 0,
      },
      {
        y: this.props.y,
        height: this.props.height,
        ease: Cubic.easeOut,
        onComplete: callback,
      }
    );
  }

  componentDidUpdate () {
    TweenLite.to(
      findDOMNode(this),
      this.props.transitionDuration,
      {
        y: this.props.y,
        height: this.props.height,
        ease: Cubic.easeOut,
      }
    );
  }
}

HistogramBar.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  yScale: PropTypes.func.isRequired,
  transitionDuration: PropTypes.number.isRequired,
};

export default class Histogram extends Component {
  constructor (props, ...args) {
    super(props, ...args);

    const xDomain = props.domain || [ 0, d3.max(props.data) ];

    this.xScale = d3.scaleLinear()
      .domain(xDomain)
      .range([ 0, props.width ]);

    this.binGenerator = d3.histogram()
      .domain(this.xScale.domain())
      .thresholds(this.xScale.ticks());

    const bins = this.binGenerator(props.data);
    const yDomain = [ 0, d3.max(bins, (entry) => entry.length) ];

    this.yScale = d3.scaleLinear()
      .domain(yDomain)
      .range([ props.height, 0 ]);

    this.state = {
      isAdjusted: false,
    };

    this.yAxisGroup = this.xAxisGroup = null;
    this.xOffset = this.yOffset = null;
    this.yPadding = null;
  }

  getChartBars () {
    const actualChartWidth = this.xScale.range()[1];
    const actualChartHeight = this.yScale.range()[0];

    const binGenerator = d3.histogram()
      .domain(this.xScale.domain())
      .thresholds(this.xScale.ticks());
    const bins = binGenerator(this.props.data);

    const paddingWidth = this.props.padding * (bins.length);
    const barWidth = (actualChartWidth - paddingWidth) / bins.length;

    return bins.map((entry, index) => {
      const barX = ((barWidth + this.props.padding) * index) + (this.props.padding / 2);
      const barY = this.yScale(entry.length);
      const barHeight = actualChartHeight - barY;

      return (
        <HistogramBar
          key={index}
          x={barX}
          y={barY}
          width={barWidth}
          height={barHeight}
          yScale={this.yScale}
          transitionDuration={this.props.transitionDuration}
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
          <ReactTransitionGroup component="g">
            {this.getChartBars()}
          </ReactTransitionGroup>
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
  domain: PropTypes.array,
  padding: PropTypes.number,
  transitionDuration: PropTypes.number,
};

Histogram.defaultProps = {
  padding: 5,
  transitionDuration: 0.25,
};
