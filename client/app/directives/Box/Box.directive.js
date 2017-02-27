import angular from 'angular';

const TEMPLATE = `
<g class="{{$ctrl.type}}">
<rect class="leftHandle handle {{$ctrl.id}}"
      ng-attr-x="{{$ctrl.left}}"
      ng-attr-y="{{$ctrl.top + $ctrl.height / 2 - 5}}"
      rx="1"
      ry="1"
      width="10"
      height="10" >
</rect>
<rect class="rectangle"
      ng-attr-x="{{$ctrl.left + 10}}"
      ng-attr-y="{{$ctrl.top}}"
      x="5"
      y="5"
      ng-attr-width="{{$ctrl.width - 20}}"
      ng-attr-height="{{$ctrl.height}}" >
</rect>
<rect class="rightHandle handle {{$ctrl.id}}"
      ng-attr-x="{{$ctrl.left + $ctrl.width - 10}}"
      ng-attr-y="{{$ctrl.top + $ctrl.height / 2 - 5}}"
      rx="1"
      ry="1"
      width="10"
      height="10" >
</rect>
</g>
`;

// Directive's controller
class BoxController {

  static get $inject() {
    return [];
  }

  constructor() {
    console.debug('Box directive controller constructor', this.isConnected, this.id);
  }

}

export default class Box {

  constructor($document) {
    console.debug('Box directive constructor');
    this.templateNamespace = 'svg';
    this.template = TEMPLATE;
    this.restrict = 'A';
    this.replace = true;
    this.scope = {
      top: '=',
      left: '=',
      width: '<',
      height: '<',
      isConnected: '<', //TODO: this is unused, need to remove
      id: '@',
      type: '@',
      onMove: '&'
    };

    this.controller = BoxController;
    this.controllerAs = '$ctrl';
    this.bindToController = true;
    this.$document = $document;
  }

  link(scope, element, attrs, ctrl) {
    let startX = 0, startY = 0, x = 0, y = 0;

    const mousemove = (event) => {
      console.debug('mousemove ');
      let handleX;
      let handleY;
      y = event.pageY - startY;
      x = event.pageX - startX;
      element.attr('transform', `translate(${x},${y})`);
      if (ctrl.type === 'input') {
        //right handle case
        handleX = ctrl.left + x + ctrl.width - 10;
      } else if (ctrl.type === 'output') {
        //left handle case
        handleX = ctrl.left + x + 5;
      }
      handleY = ctrl.top + y + ctrl.height / 2 - 2;
      console.debug('box onMove id: ', ctrl.id);
      ctrl.onMove({id: ctrl.id, x: handleX, y: handleY});
    };

    const mouseup = () => {
      console.debug('mouseup');
      this.$document.off('mousemove', mousemove);
      this.$document.off('mouseup', mouseup);
    };

    const box = angular.element(element.children()[1]);
    box.on('mousedown', (event) => {
      // Prevent default dragging of selected content
      console.debug('mousedown ', element, event);
      event.preventDefault();
      startX = event.pageX - x;
      startY = event.pageY - y;
      this.$document.on('mousemove', mousemove);
      this.$document.on('mouseup', mouseup);
    });

  }

  static directiveFactory($document) {
    Box.instance = new Box($document);
    return Box.instance;
  }

}

Box.directiveFactory.$inject = ['$document'];