import Histogram from '../../src/components/Histogram';

import React, { Component } from 'react';

export default class HistogramSample extends Component {
  constructor (...args) {
    super(...args);

    this.state = {
      data: this.randomData(),
    };
  }

  randomData () {
    return Array(50).fill(0).map(() => Math.random() * 100 | 0);
  }

  render () {
    return (
      <section className="sample">
        <h1>Histogram</h1>

        <div>
          <button
            onClick={() => {
              this.setState({
                data: this.randomData(),
              });
            }}
          >
            Generate new data
          </button>
        </div>

        <Histogram
          width={500}
          height={500}
          domain={[ 0, 100 ]}
          data={this.state.data}
        />
      </section>
    );
  }
}