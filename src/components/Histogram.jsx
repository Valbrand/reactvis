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

    this.yAxisGroup = this.xAxisGroup = null;
    this.xOffset = this.yOffset = 0;
    this.yPadding = this.xPadding = 0;

    const {
      bins,
      xScale,
      yScale,
    } = this.processedData(props.data);

    this.state = {
      isAdjusted: false,
      xScale,
      yScale,
      bins,
    };
  }

  processedData (data) {
    const xDomain = this.props.domain || [ 0, d3.max(data) ];

    const xScale = d3.scaleLinear()
      .domain(xDomain)
      .range([ 0, this.props.width - (this.xOffset + this.xPadding) ]);

    const binGenerator = d3.histogram()
      .domain(xScale.domain())
      .thresholds(xScale.ticks());

    const bins = binGenerator(data);
    const yDomain = [ 0, d3.max(bins, (entry) => entry.length) ];

    const yScale = d3.scaleLinear()
      .domain(yDomain)
      .range([ this.props.height - (this.yOffset + this.yPadding), 0 ]);

    return {
      bins,
      xScale,
      yScale,
    };
  }

  getChartBars () {
    const actualChartWidth = this.state.xScale.range()[1];
    const actualChartHeight = this.state.yScale.range()[0];

    const totalPaddingWidth = this.props.padding * (this.state.bins.length + 1);
    const barWidth = (actualChartWidth - totalPaddingWidth) / this.state.bins.length;

    return this.state.bins.map((entry, index) => {
      const barX = ((barWidth + this.props.padding) * index) + this.props.padding;
      const barY = this.state.yScale(entry.length);
      const barHeight = actualChartHeight - barY;

      return (
        <HistogramBar
          key={index}
          x={barX}
          y={barY}
          width={barWidth}
          height={barHeight}
          yScale={this.state.yScale}
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
    console.log('render');

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

    const axis = d3.axisLeft(this.state.yScale);

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

    const axis = d3.axisBottom(this.state.xScale);

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

    this.state.xScale.range([ 0, this.props.width - (this.xOffset + this.xPadding) ]);
    this.state.yScale.range([ this.props.height - (this.yOffset + this.yPadding), 0 ]);
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

  componentWillReceiveProps (nextProps) {
    if (nextProps.data && nextProps.data !== this.props.data) {
      const {
        bins,
        xScale,
        yScale,
      } = this.processedData(nextProps.data);

      this.setState({
        isAdjusted: false,
        bins,
        xScale,
        yScale,
      });
    }
  }

  componentDidUpdate () {
    this.createYAxis();
    this.createXAxis();

    if (!this.state.isAdjusted) {
      this.adjustScales();

      /* eslint react/no-did-mount-set-state: 0 */
      this.setState({
        isAdjusted: true,
      });
    }
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
  transitionDuration: 0.5,
};
