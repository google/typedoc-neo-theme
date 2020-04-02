module typedoc {
  const hasPositionSticky = $html.hasClass('csspositionsticky')

  /**
   * Defines the known ways to make the navigation sticky.
   */
  enum StickyMode {
    /**
     * The navigation is not sticky at all.
     */
    None,

    /**
     * The entire secondary navigation will stick to the top.
     */
    Secondary,

    /**
     * Only the current root navigation item will stick to the top.
     */
    Current,
  }


  /**
   * Controls the sticky behaviour of the secondary menu.
   */
  // tslint:disable-next-line
  export class MenuSticky extends Backbone.View<any> {
    /**
     * jQuery instance of the current navigation item.
     */
    private $current:JQuery

    /**
     * jQuery instance of the parent representing the entire navigation.
     */
    private $navigation:JQuery

    /**
     * jQuery instance of the parent representing entire sticky container.
     */
    private $container:JQuery

    /**
     * The current state of the menu.
     */
    private state = ''

    /**
     * The current mode for determining the sticky position.
     */
    private stickyMode:StickyMode = StickyMode.None

    /**
     * The threshold at which the menu is attached to the top.
     */
    private stickyTop:number

    /**
     * The threshold at which the menu is attached to the bottom.
     */
    private stickyBottom:number

    /**
     * Create a new MenuSticky instance.
     *
     * @param options  Backbone view constructor options.
     */
    // tslint:disable-next-line
    constructor(options:Backbone.ViewOptions<any>) {
      super(options)

      this.$current    = this.$el.find('> ul.current')
      this.$navigation = this.$el // Itself
      this.$container  = this.$el.parents('.row')

      this.listenTo(viewport, 'resize', this.onResize)
      if (!hasPositionSticky) {
        this.listenTo(viewport, 'scroll', this.onScroll)
      }

      this.onResize(viewport.width, viewport.height)
    }

    /**
     * Set the current sticky state.
     *
     * @param state  The new sticky state.
     */
    private setState(state:string) {
      if (this.state === state) return

      if (this.state !== '') this.$navigation.removeClass(this.state)
      this.state = state
      if (this.state !== '') this.$navigation.addClass(this.state)
    }

    /**
     * Triggered after the viewport was resized.
     *
     * @param width   The width of the viewport.
     * @param height  The height of the viewport.
     */
    private onResize(width:number, height:number) {
      this.stickyMode = StickyMode.None
      this.setState('')

      const containerTop    = this.$container.offset().top
      const containerHeight = this.$container.height()
      const bottom          = containerTop + containerHeight
      if (this.$navigation.height() < containerHeight) {
        const elHeight = this.$el.height()
        const elTop    = this.$el.offset().top

        if (this.$current.length) {
          const currentHeight = this.$current.height()
          const currentTop    = this.$current.offset().top

          this.$navigation.css('top', containerTop - currentTop + 20)
          if (currentHeight < height) {
            this.stickyMode   = StickyMode.Current
            this.stickyTop    = currentTop
            this.stickyBottom = bottom - elHeight + (currentTop - elTop) - 20
          }
        }

        if (elHeight < height) {
          this.$navigation.css('top', containerTop - elTop + 20)
          this.stickyMode   = StickyMode.Secondary
          this.stickyTop    = elTop
          this.stickyBottom = bottom - elHeight - 20
        }
      }

      if (!hasPositionSticky) {
        this.$navigation.css('left', this.$navigation.offset().left)
        this.onScroll(viewport.scrollTop)
      } else {
        if (this.stickyMode === StickyMode.Current) {
          this.setState('sticky-current')
        } else if (this.stickyMode === StickyMode.Secondary) {
          this.setState('sticky')
        } else {
          this.setState('')
        }
      }
    }

    /**
     * Triggered after the viewport was scrolled.
     *
     * @param scrollTop  The current vertical scroll position.
     */
    private onScroll(scrollTop:number) {
      if (this.stickyMode === StickyMode.Current) {
        if (scrollTop > this.stickyBottom) {
          this.setState('sticky-bottom')
        } else {
          this.setState(scrollTop + 20 > this.stickyTop ? 'sticky-current' : '')
        }
      } else if (this.stickyMode === StickyMode.Secondary) {
        if (scrollTop > this.stickyBottom) {
          this.setState('sticky-bottom')
        } else {
          this.setState(scrollTop + 20 > this.stickyTop ? 'sticky' : '')
        }
      }
    }
  }

  /**
   * Register this component.
   */
  registerComponent(MenuSticky, '.menu-sticky')
}
