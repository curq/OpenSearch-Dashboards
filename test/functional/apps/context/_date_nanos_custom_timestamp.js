/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import expect from '@osd/expect';

const TEST_INDEX_PATTERN = 'date_nanos_custom_timestamp';
const TEST_DEFAULT_CONTEXT_SIZE = 1;
const TEST_STEP_SIZE = 3;

export default function ({ getService, getPageObjects }) {
  const opensearchDashboardsServer = getService('opensearchDashboardsServer');
  const docTable = getService('docTable');
  const security = getService('security');
  const PageObjects = getPageObjects(['common', 'context', 'timePicker', 'discover']);
  const opensearchArchiver = getService('opensearchArchiver');

  describe('context view for date_nanos with custom timestamp', () => {
    before(async function () {
      await security.testUser.setRoles([
        'opensearch_dashboards_admin',
        'opensearch_dashboards_date_nanos_custom',
      ]);
      await opensearchArchiver.loadIfNeeded('date_nanos_custom');
      await opensearchDashboardsServer.uiSettings.replace({ defaultIndex: TEST_INDEX_PATTERN });
      await opensearchDashboardsServer.uiSettings.update({
        'context:defaultSize': `${TEST_DEFAULT_CONTEXT_SIZE}`,
        'context:step': `${TEST_STEP_SIZE}`,
        'discover:v2': false,
      });
    });

    it('displays predessors - anchor - successors in right order ', async function () {
      await PageObjects.context.navigateTo(TEST_INDEX_PATTERN, '1');
      const actualRowsText = await docTable.getRowsText();
      const expectedRowsText = [
        'Oct 21, 2019 @ 08:30:04.828733000 -',
        'Oct 21, 2019 @ 00:30:04.828740000 -',
        'Oct 21, 2019 @ 00:30:04.828723000 -',
      ];
      expect(actualRowsText).to.eql(expectedRowsText);
    });

    after(async function () {
      await security.testUser.restoreDefaults();
      await opensearchArchiver.unload('date_nanos_custom');
    });
  });
}
