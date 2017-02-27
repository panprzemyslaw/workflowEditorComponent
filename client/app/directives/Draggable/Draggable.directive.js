import angular from 'angular';

//Initial absolute position of box elements in left menu
const OFFSET = {
  x: 23,
  y: 50
};

export default class Draggable {

  constructor($document) {
    console.debug('Draggable directive constructor');
    this.restrict = 'A';
    this.scope = {
      onDrop: '&'
    };
    this.$document = $document;
  }

  link(scope, element, attr) {
    var startX = 0, startY = 0, x = 0, y = 0;

    const mousemove = (event) => {
      console.debug('draggable - mousemove');
      y = event.pageY - startY;
      x = event.pageX - startX;
      element.css({
        top: y + 'px',
        left: x + 'px'
      });
    };

    const mouseup = (event) => {
      console.debug('draggable - mouseup ', event);
      x = 0;
      y = 0;
      element.css({
        top: OFFSET.y + 'px',
        left: OFFSET.x + 'px'
      });
      element.removeClass('moving');
      if (event.pageX > 200 && event.pageY > 100) { //TODO: move to scope and provide from outside
        let type = event.target.parentNode.className.indexOf('input') > -1 ? 'input' : 'output';
        scope.onDrop({x: event.pageX, y: event.pageY, type});
      }
      this.$document.off('mousemove', mousemove);
      this.$document.off('mouseup', mouseup);
    };

    element.on('mousedown', (event) => {
      console.debug('draggable - mousedown ', event);
      // Prevent default dragging of selected content
      event.preventDefault();
      startX = event.pageX - x - OFFSET.x;
      startY = event.pageY - y - OFFSET.y;
      this.$document.on('mousemove', mousemove);
      this.$document.on('mouseup', mouseup);
      element.addClass('moving');
    });

  }

  static directiveFactory($document) {
    Draggable.instance = new Draggable($document);
    return Draggable.instance;
  }

}

Draggable.directiveFactory.$inject = ['$document'];