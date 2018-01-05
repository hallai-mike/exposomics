import React from 'react';
import { func, arrayOf, any, string } from 'prop-types';
import HeatmapRow from './HeatmapRow';
import getRelativeCoordinates from './getRelativeCoordinates';

function prepareData({ startDate, endDate, values, extractDate }) {
  if (endDate < startDate) {
    throw new Error('End date should be greater than start date');
  }
  const cache = Object.create(null);
  values.forEach(entry => {
    const date = extractDate(entry);
    const day = date.toISOString().substr(0, 10);
    if (cache[day]) {
      throw new Error(`Duplicate record for ${day}`);
    }
    cache[day] = entry;
  });

  const normalizedDataSplits = Object.create(null);
  const startYear = new Date(startDate).getFullYear();
  const endYear = new Date(endDate).getFullYear();
  for (let year = startYear; year <= endYear; year += 1) {
    normalizedDataSplits[year] = [];
    for (
      let currentDate = new Date(year, 0, 1);
      currentDate.getFullYear() === year;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      if (currentDate.getMonth() === 1 && currentDate.getDate() === 29) {
        continue; // eslint-disable-line no-continue
      }
      const day = currentDate.toISOString().substring(0, 10);
      normalizedDataSplits[year].push(
        cache[day] || {
          date: currentDate.toISOString(),
          value: -1,
        },
      );
    }
  }

  return normalizedDataSplits;
}

export default class Heatmap extends React.Component {
  static propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    values: arrayOf(any).isRequired,
    startDate: string.isRequired,
    endDate: string.isRequired,
    mapValueToColor: func.isRequired,
    renderTooltip: func,
  };

  static defaultProps = {
    renderTooltip: () => null,
  };

  constructor(props) {
    super();

    this.state = { data: prepareData(props) };
  }

  componentWillReceiveProps(newProps) {
    if (
      newProps.values !== this.props.values ||
      newProps.startDate !== this.props.startDate ||
      newProps.endDate !== this.props.endDate
    ) {
      this.setState({ data: prepareData(newProps), tooltipEntry: null });
    }
  }

  clearCoords = () => {
    this.setState({ tooltipEntry: null });
  };

  handleMouseMove = e => {
    this.setState({
      tooltipCoords: getRelativeCoordinates(e, this.container),
    });
  };

  selectEntry = e => {
    this.setState({ tooltipEntry: e });
  };

  render() {
    const { data, tooltipEntry, tooltipCoords } = this.state;
    const { mapValueToColor, renderTooltip } = this.props;
    return (
      <div
        style={{ position: 'relative' }}
        ref={c => {
          this.container = c;
        }}
      >
        <div onMouseMove={this.handleMouseMove} onMouseLeave={this.clearCoords}>
          {Object.keys(data).map(year => (
            <HeatmapRow
              key={year}
              onSelectEntry={this.selectEntry}
              onMouseLeave={this.clearCoords}
              text={year}
              data={data[year]}
              mapValueToColor={mapValueToColor}
            />
          ))}
        </div>
        {tooltipEntry && (
          <div
            style={{
              position: 'absolute',
              zIndex: 2,
              left: tooltipCoords.x,
              top: tooltipCoords.y,
              transform: 'translateX(-50%) translateY(5px)',
            }}
            className="foo"
          >
            {renderTooltip(tooltipEntry)}
          </div>
        )}
      </div>
    );
  }
}
