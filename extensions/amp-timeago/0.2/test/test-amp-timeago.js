/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import '../amp-timeago';
import {toggleExperiment} from '../../../../src/experiments';
import {waitForChildPromise} from '../../../../src/dom';
import {whenCalled} from '../../../../testing/test-helper.js';

describes.realWin(
  'amp-timeago',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-timeago:0.2'],
    },
  },
  (env) => {
    let win;
    let element;

    const getTimeFromShadow = async () => {
      await whenCalled(env.sandbox.spy(element, 'attachShadow'));
      const shadow = element.shadowRoot;
      await waitForChildPromise(shadow, (shadow) => {
        return shadow.querySelector('time');
      });
      const time = shadow.querySelector('time');
      await waitForChildPromise(time, (time) => {
        return time.textContent;
      });
      return time.textContent;
    };

    beforeEach(() => {
      win = env.win;
      toggleExperiment(win, 'amp-timeago-v2', true);

      element = win.document.createElement('amp-timeago');
      element.setAttribute('layout', 'fixed');
      element.setAttribute('width', '160px');
      element.setAttribute('height', '20px');
    });

    afterEach(() => {
      toggleExperiment(win, 'amp-timeago-v2', false);
    });

    it('should renders display 2 days ago when built', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      element.setAttribute('datetime', date.toISOString());
      element.textContent = date.toString();
      win.document.body.appendChild(element);
      const time = await getTimeFromShadow();
      expect(time).to.equal('2 days ago');
    });

    it('should display original date when older than cutoff', async () => {
      const date = new Date('2017-01-01');
      element.setAttribute('datetime', date.toISOString());
      element.textContent = 'Sunday 1 January 2017';
      element.setAttribute('cutoff', '8640000');
      win.document.body.appendChild(element);
      const time = await getTimeFromShadow();
      expect(time).to.equal('Sunday 1 January 2017');
    });

    it('should update after mutation of datetime attribute', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      element.setAttribute('datetime', date.toISOString());
      element.textContent = date.toString();
      win.document.body.appendChild(element);
      date.setDate(date.getDate() + 1);
      element.setAttribute('datetime', date.toString());
      element.mutatedAttributesCallback({
        'datetime': date.toString(),
      });
      const time = await getTimeFromShadow();
      expect(time).to.equal('1 day ago');
    });
  }
);
