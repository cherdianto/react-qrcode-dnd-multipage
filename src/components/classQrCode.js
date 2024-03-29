import React, { Component } from 'react'
import interact from 'interactjs'

function dragMoveListener(event) {
    var target = event.target
    // keep the dragged position in the data-x/data-y attributes
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
  
    // translate the element
    target.style.webkitTransform =
      target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)'
  
    // update the posiion attributes
    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)
  }
  
  function resizeListener(event) {
    var target = event.target
    var x = (parseFloat(target.getAttribute('data-x')) || 0)
    var y = (parseFloat(target.getAttribute('data-y')) || 0)
  
    // update the element's style
    target.style.width = event.rect.width + 'px'
    target.style.height = event.rect.height + 'px'
  
    // translate when resizing from top or left edges
    x += event.deltaRect.left
    y += event.deltaRect.top
  
    target.style.webkitTransform = target.style.transform =
      'translate(' + x + 'px,' + y + 'px)'
  
    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)
    target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height);
  }
  
  function setupInteractable(item) {
    item.resizable({
      // resize from all edges and corners
      edges: {
        left: true,
        right: true,
        bottom: true,
        top: true,
      },
  
      listeners: {
        move: resizeListener,
      },
      modifiers: [
        // keep the edges inside the parent
        interact.modifiers.restrictEdges({
          outer: 'parent'
        }),
  
        // minimum size
        interact.modifiers.restrictSize({
          min: {
            width: 100,
            height: 50
          }
        })
      ],
  
      inertia: true
    });
  
    item.draggable({
      listeners: {
        move: dragMoveListener,
      },
      inertia: true,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true
        })
      ],
  
    });
  }

export default class ClassQrCode extends Component {
    componentDidMount(){
        this.interactable = interact(this.node);
        setupInteractable(this.interactable)
    }

    componentWillUnmount() {
        // this.interactable.unset();
        this.interactable = null;
    }

  render() {
    return (
        <div className="drag-item p-1 qr-code draggable resizable" style={{width:'90px'}}>
            <img src="/qrcode.png" alt="dummie qrcode" width={'100%'}/>
        </div>
    )
  }
}
