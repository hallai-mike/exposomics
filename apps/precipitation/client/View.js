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
                  <div className={cx('col-xs-1', cs.temp_zero)}>
                    <span />
                    <br />
                    <p> &lt;0 </p>
                  </div>
                </li>
                <li>
                  <div className={cx('col-xs-1', cs.temp_one)}>
                    <span />
                    <br />
                    <p>0&minus;10</p>
                  </div>
                </li>
                <li>
                  <div className={cx('col-xs-1', cs.temp_two)}>
                    <span />
                    <br />
                    <p>10&minus;20</p>
                  </div>
                </li>
                <li>
                  <div className={cx('col-xs-1', cs.temp_three)}>
                    <span />
                    <br />

                    <p>20&minus;30</p>
                  </div>
                </li>
                <li>
                  <div className={cx('col-xs-1', cs.temp_four)}>
                    <span />
                    <br />

                    <p>30&minus;40</p>
                  </div>
                </li>
                <li>
                  <div className={cx('col-xs-1', cs.temp_five)}>
                    <span />
                    <br />

                    <p> &gt;40</p>
                  </div>
                </li>
              </div>
            </ul>
          </div>
          <div className={cx('col-xs-6', cs.moreInfoContent)}>
            <div className="row">
              <p className={cs.footerTitle}>
                If you want to know more about this precipitation data and where
                it comes from check out the following links:
              </p>
            </div>
            <ul className={cs.moreInfo}>
              <div className="row">
                <div className="col-xs-6">
                  <li>
                    <a
                      href="https://www.ncdc.noaa.gov/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      NOAA National Centers for Environmental Information
                    </a>
                    <br />
                    <span>
                      The government website for public environmental data
                    </span>
                  </li>
                </div>

                <div className="col-xs-6">
                  <li>
                    <a
                      href="ftp://ftp.ncdc.noaa.gov/pub/data/ghcn/daily/by_year/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Daily weather station data
                    </a>
                    <br />
                    <span>Public ftp server</span>
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
