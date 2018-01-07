import React from 'react';
import { func, number, string, arrayOf, any } from 'prop-types';
import getRelativeCoordinates from './getRelativeCoordinates';

function drawHeatmapLine({
  node,
  data = [],
  text = '2017',
  textAlign = 'left',
  itemWidth = 5,
  itemHeight = 20,
  legendWidth = 5,
  font,
  mapValueToColor,
}) {
  const ctx = node.getContext('2d');
  const sourceWidth = node.clientWidth;
  const itemsWidth = data.length * itemWidth;
  const scaleFactor = sourceWidth * (1 - legendWidth / 100) / itemsWidth;
  const scaledLegendWidth = Math.floor(
    sourceWidth * legendWidth / (100 * scaleFactor),
  );
  node.width = itemsWidth + scaledLegendWidth;
  node.height = itemHeight;
  const offsetLeft = textAlign === 'left' ? scaledLegendWidth : 0;
  ctx.font = font;
  ctx.fillStyle = 'black';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(
    text,
    (offsetLeft ? 0 : itemsWidth) + scaledLegendWidth / 2,
    node.height / 2,
    scaledLegendWidth * 0.75,
  );
  data.forEach((element, idx) => {
    ctx.fillStyle = mapValueToColor(element);
    ctx.fillRect(
      offsetLeft + itemWidth * idx + 1,
      0,
      itemWidth - 1,
      itemHeight,
    );
  });
}

class HeatmapRow extends React.PureComponent {
  /* eslint-disable react/no-unused-prop-types */
  static propTypes = {
    data: arrayOf(any).isRequired,
    text: string,
    textAlign: string,
    font: string,
    itemWidth: number,
    itemHeight: number,
    legendWidth: number,
    mapValueToColor: func,
    onSelectEntry: func,
    onMouseLeave: func,
  };

  static defaultProps = {
    text: '',
    textAlign: 'right',
    font: '20px Arial',
    itemWidth: 5,
    itemHeight: 20,
    legendWidth: 5,
    mapValueToColor: v => v,
    onSelectEntry: () => {},
    onMouseLeave: () => {},
  };

  componentDidMount() {
    this.drawCanvas();
  }

  componentDidUpdate() {
    this.drawCanvas();
  }

  drawCanvas() {
    drawHeatmapLine({
      node: this.node,

      ...this.props,
    });
  }

  handleMove = e => {
    const coords = getRelativeCoordinates(e, this.node);
    const width = this.node.clientWidth;
    const percent = coords.x / width * 100;
    const dataWidth = 100 - this.props.legendWidth;
    if (this.props.textAlign === 'left' && percent < this.props.legendWidth) {
      return this.props.onSelectEntry(null);
    }
    if (this.props.textAlign === 'right' && percent > dataWidth) {
      return this.props.onSelectEntry(null);
    }

    const relativePercent = percent / dataWidth;
    return this.props.onSelectEntry(
      this.props.data[Math.round(this.props.data.length * relativePercent)],
    );
  };

  render() {
    return (
      <canvas
        onMouseMove={this.handleMove}
        onMouseLeave={this.props.onMouseLeave}
        ref={node => {
          this.node = node;
        }}
      />
    );
  }
}

export default HeatmapRow;
