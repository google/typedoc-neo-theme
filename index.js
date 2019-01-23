/**
 * Copyright 2019 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let plugin = require('./third_party/src/default/plugin')
module.exports = (PluginHost) => {
  const app = PluginHost.owner
  /*
   * Expected array:
   *  interface Link {
   *    label: string
   *    url: string
   *  }
   */
  app.options.addDeclaration({ name: 'links' })
  /*
   * Expected object:
   *  interface Outline {
   *    [key: string]: string | Outline
   *  }
   */
  app.options.addDeclaration({ name: 'outline' })
  /*
   * Expected array:
   *  interface Search {
   *    name: string
   *    subtitle: string
   *  }
   */
  app.options.addDeclaration({ name: 'search' })

  app.converter.addComponent('neo-theme', plugin.ExternalModuleMapPlugin)
}
