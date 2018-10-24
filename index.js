let plugin = require('./plugin')
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
