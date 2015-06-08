/** @jsx m */
import socket from '../../socket';
import utils from '../../utils';
import h from '../helper';
import * as xhr from './playerXhr';
import layout from '../layout';
import widgets from '../widget/common';
import i18n from '../../i18n';
import { perfTitle } from '../../lichess/perfs';

export default {
  controller() {
    socket.createDefault();

    const ranking = m.prop({});

    xhr.ranking().then(data => {
      Object.keys(data).forEach(k => {
        data[k].isOpenedOnMobile = false;
      });
      ranking(data);
    }, err => {
      utils.handleXhrError(err);
      m.route('/');
    });

    return {
      ranking,
      onunload() {
        socket.destroy();
      },
      toggleRankingCat(key) {
        let cat = ranking()[key];
        cat.isOpenedOnMobile = !cat.isOpenedOnMobile;
      }
    };
  },

  view(ctrl) {
    return layout.free(
      () => widgets.header(i18n('ranking')),
      renderBody.bind(undefined, ctrl),
      widgets.empty,
      widgets.empty
    );
  }
};

function renderBody(ctrl) {
  return (
    <div id="allRanking" className="native_scroller page">
      {Object.keys(ctrl.ranking()).filter(k => k !== 'online').map(k => renderRankingCategory(ctrl, k))}
    </div>
  );
}

function renderRankingCategory(ctrl, key) {
  const ranking = ctrl.ranking();
  const h3Class = [
    'rankingPerfTitle',
    ranking[key].isOpenedOnMobile ? 'open' : ''
  ].join(' ');
  return (
    <section className={'ranking ' + key}>
      <h3 className={h3Class} config={h.ontouchY(ctrl.toggleRankingCat.bind(undefined, key))}>
        <span className="perfIcon" data-icon={utils.gameIcon(key)} />
        {perfTitle(key)}
        {h.isWideScreen() ? null : <span className="toggleIcon" data-icon="u"/>}
      </h3>
      { ranking[key].isOpenedOnMobile || h.isWideScreen() ?
      <ul>
        {ranking[key].map(p => renderRankingPlayer(p, key))}
      </ul> : null
      }
    </section>
  );
}

function renderRankingPlayer(user, key) {
  return (
    <li className="rankingPlayer" config={h.ontouchY(() => m.route('/@/' + user.id))}>
      {widgets.userStatus(user)}
      <span className="rating">
        {user.perfs[key].rating}
      </span>
    </li>
  );
}
