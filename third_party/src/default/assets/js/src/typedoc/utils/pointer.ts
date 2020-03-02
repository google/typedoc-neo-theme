module typedoc {
  /**
   * Simple point interface.
   */
  export interface Point {
    x:number
    y:number
  }

  /**
   * Event name of the pointer down event.
   */
  export let pointerDown = 'mousedown'

  /**
   * Event name of the pointer move event.
   */
  export let pointerMove = 'mousemove'

  /**
   * Event name of the pointer up event.
   */
  export let pointerUp = 'mouseup'

  /**
   * Position the pointer was pressed at.
   */
  export let pointerDownPosition:Point = {x:0, y:0}

  /**
   * Should the next click on the document be supressed?
   */
  export let preventNextClick = false

  /**
   * Is the pointer down?
   */
  export let isPointerDown = false

  /**
   * Is the pointer a touch point?
   */
  export let isPointerTouch = false

  /**
   * Did the pointer move since the last down event?
   */
  export let hasPointerMoved = false

  /**
   * Is the user agent a mobile agent?
   */
  export let isMobile:boolean = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  $html.addClass(isMobile ? 'is-mobile' : 'not-mobile')

  if (isMobile && 'ontouchstart' in document.documentElement) {
    isPointerTouch = true
    pointerDown = 'touchstart'
    pointerMove = 'touchmove'
    pointerUp   = 'touchend'
  }

  $document.on(pointerDown, (e:JQueryMouseEventObject) => {
    isPointerDown = true
    hasPointerMoved = false
    const t = (pointerDown === 'touchstart' ?
      e.originalEvent['targetTouches'][0] : e)
    pointerDownPosition.x = t.pageX
    pointerDownPosition.y = t.pageY
  }).on(pointerMove, (e:JQueryMouseEventObject) => {
    if (!isPointerDown) return
    if (!hasPointerMoved) {
      const t = (pointerDown === 'touchstart' ?
        e.originalEvent['targetTouches'][0] : e)
      const x = pointerDownPosition.x - t.pageX
      const y = pointerDownPosition.y - t.pageY
      hasPointerMoved = (Math.sqrt(x*x + y*y) > 10)
    }
  }).on(pointerUp, (e:JQueryMouseEventObject) => {
    isPointerDown = false
  }).on('click', (e:JQueryMouseEventObject) => {
    if (preventNextClick) {
      e.preventDefault()
      e.stopImmediatePropagation()
      preventNextClick = false
    }
  })
}
