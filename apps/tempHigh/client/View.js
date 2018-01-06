import React from 'react';
import { shape, arrayOf, any, string } from 'prop-types';
import cx from 'classnames';
import CalendarHeatmap from './components/Heatmap';
import Style from '../../../components/Style';
import {
  classNames as cs,
  stylesheet,
} from '../../../components/ResultsPage/ResultsPage.scss';

const Tooltip = entry => (
  <div
    style={{
      backgroundColor: 'white',
      borderRadius: 5,
      border: 'solid #808080 1px',
      padding: 5,
    }}
  >
    <div>
      <strong>{entry.date.substring(0, 10)}</strong>
    </div>
    <div>
      Value: <strong>{entry.value}</strong>
    </div>
  </div>
);

const extractDate = value => new Date(value.date);
const mapValueToColor = ({ value }) => {
  if (value === -101 || value === -1 || value === 0) {
    return '#ccc';
  } else if (value === -202) {
    return '#aaa';
  } else if (value < 0) {
    return '#000080';
  } else if (value < 10) {
    return '#0088FF';
  } else if (value < 20) {
    return '#00FFFF';
  } else if (value < 30) {
    return '#00FF00';
  } else if (value < 40) {
    return '#FFA500';
  }
  return '#ff0000';
};

export default class View extends React.PureComponent {
  static propTypes = {
    data: shape({
      startDate: string,
      endDate: string,
      dataList: arrayOf(any),
    }).isRequired,
  };

  render() {
    const { data } = this.props;
    const dataList = data.dataList;
    const endDate = data.endDate;
    const startDate = data.startDate;
    // console.log(dataList);
    return (
      <div>
        <Style stylesheet={stylesheet} />

        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={dataList}
          extractDate={extractDate}
          mapValueToColor={mapValueToColor}
          renderTooltip={Tooltip}
        />

        <div className="row">
          <div className="col-xs-6">
            <ul className={cs.legend}>
              <div className="row">
                <li>
                  <div className={cx('col-xs-1', cs.zero)}>
                    <span />
                    <br />
                    <p>Good</p>
                  </div>
                </li>
                <li>
                  <div className={cx('col-xs-1', cs.one)}>
                    <span />
                    <br />
                    <p>Moderate</p>
                  </div>
                </li>
                <li>
                  <div className={cx('col-xs-1', cs.two)}>
                    <span />
                    <br />
                    <p>
                      {' '}
                      Unhealthy <br />for <br />sensitive <br />groups
                    </p>
                  </div>
                </li>
                <li>
                  <div className={cx('col-xs-1', cs.three)}>
                    <span />
                    <br />

                    <p> Unhealthy</p>
                  </div>
                </li>
                <li>
                  <div className={cx('col-xs-1', cs.four)}>
                    <span />
                    <br />

                    <p>
                      {' '}
                      Very <br />unhealthy
                    </p>
                  </div>
                </li>
                <li>
                  <div className={cx('col-xs-1', cs.five)}>
                    <span />
                    <br />

                    <p> Hazardous</p>
                  </div>
                </li>
              </div>
            </ul>
          </div>
          <div className={cx('col-xs-6', cs.moreInfoContent)}>
            <div className="row">
              <p className={cs.footerTitle}>
                If you want to know more about temperature highs and how
                <br />they might affect your health check out the following
                links:
              </p>
            </div>
            <ul className={cs.moreInfo}>
              <div className="row">
                <div className="col-xs-6">
                  <li>
                    <a
                      href="https://www3.epa.gov/airnow/aqi_brochure_02_14.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      EPA&apos;s Air Quality Brochure
                    </a>
                    <br />
                    <span>
                      A comprehensive guide to everything AQI (20 min read)
                    </span>
                  </li>
                </div>

                <div className="col-xs-6">
                  <li>
                    <a
                      href="https://forum.airnowtech.org/t/the-aqi-equation/169"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      How AQI is Calculated
                    </a>
                    <br />
                    <span>5 min read</span>
                  </li>
                </div>
              </div>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
