import { Component, ConverterComponent } from 'typedoc/dist/lib/converter/components'

/**
 * Empty plugin which is used in conjunction with additional typedoc options
 *
 * Based on https://github.com/christopherthielen/typedoc-plugin-external-module-name
 */
@Component({ name: 'neo-theme' })
export class ExternalModuleMapPlugin extends ConverterComponent {
}
