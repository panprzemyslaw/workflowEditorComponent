import angular from 'angular';
import template from './SVGEditor.template.html';
import _ from 'lodash';

const BOX = {
  width: 150,
  height: 50
};

const EDITOR = {
  position: {
    x: 200,
    y: 100
  }
};

class SVGEditor {

  static get $inject() {
    return ['$element', '$document', '$compile', '$scope'];
  }

  constructor($element, $document, $compile, $scope) {
    this.$element = $element;
    this.$document = $document;
    this.$compile = $compile;
    this.$scope = $scope;
  }

  $onInit() {
    const svg = this.$element.find('svg');
    this.boxes = [];
    this.curve;
    //here we store the names of the boxes that we connect
    this.elementsToConnect = [];

    const makeSVG = (tag, attrs) => {
      var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
      /*eslint-disable */
      for (let k in attrs) {
        el.setAttribute(k, attrs[k]);
        return el;
      }
      /*eslint-enable */
    };

    const mousemove = (event) => {
      console.debug('SVGEditor = mousemove ', event);
      //find first child added
      this.curve = svg.children()[0];
      let startBoxIdx = _.findIndex(this.boxes, (o) => o.id === this.elementsToConnect[0]);
      let startBox = this.boxes[startBoxIdx];
      this.drawLink({startX: startBox.handle.x, startY: startBox.handle.y, endX: event.offsetX, endY: event.offsetY});
    };

    const mouseup = (event) => {
      const className = event.target.className;
      console.debug('SVGEditor = mouseup ', event);
      if (className.baseVal && className.baseVal.indexOf('handle') === -1) {
        this.curve.remove();
      } else {
        //take the id of the box that we connect to
        this.elementsToConnect.push(className.baseVal.split(' ')[2]);
        console.debug('this.elementsToConnect ', this.elementsToConnect);
        if (this.elementsToConnect.length === 2) {
          let idx0 = _.findIndex(this.boxes, (o) => o.id === this.elementsToConnect[0]);
          let idx1 = _.findIndex(this.boxes, (o) => o.id === this.elementsToConnect[1]);
          this.boxes[idx0].isConnected = true;
          this.boxes[idx0].link.start = this.elementsToConnect[0];
          this.boxes[idx0].link.end = this.elementsToConnect[1];
          this.boxes[idx1].isConnected = true;
          this.boxes[idx1].link.start = this.boxes[idx0].link.start;
          this.boxes[idx1].link.end = this.boxes[idx0].link.end;
          this.elementsToConnect = [];
          let link = angular.element(this.curve);
          link.attr('class', `${link.attr('class')} ${this.boxes[idx1].id}`);
          console.debug('this.boxes ', this.boxes);
        }
      }
      this.$document.off('mousemove', mousemove);
      this.$document.off('mouseup', mouseup);
    };

    this.$element.on('mousedown', (event) => {
      // Prevent default dragging of selected content
      event.preventDefault();
      const className = event.target.className;
      if (className.baseVal && className.baseVal.indexOf('handle') > -1) {
        console.debug('SVGEditor = this is mousedown on handle ', className);
        const startX = event.offsetX;
        const startY = event.offsetY;
        const endX = startX;
        const endY = startY;
        this.elementsToConnect.push(className.baseVal.split(' ')[2]);
        console.debug('startX ', startX);
        console.debug('startY ', startY);
        this.curve = makeSVG('path',
          {
            class: 'curve ' + this.elementsToConnect[0],
            d: `
              M${startX} ${startY}
              C${startX + 200} ${startY + 40}
              ${endX - 50} ${endY}
              ${endX} ${endY}`
          }
        );
        svg.prepend(this.curve);
        this.$document.on('mousemove', mousemove);
        this.$document.on('mouseup', mouseup);
      }

    });

  }

  $onChanges(changes) {

  }

  updateLink(id, x, y) {
    console.debug('updateLink ', id, x, y);
    let coordinates;
    const svg = this.$element.find('svg');
    const getCurrentCurve = () => {
      let currentCurve;
      for (let i = 0; i < svg.children().length; i++) {
        if (svg.children()[i].className.baseVal.indexOf(id) > -1) {
          currentCurve = svg.children()[i];
        }
      }
      return currentCurve;
    };
    const getLinkCoordinates = (type, startBoxId, endBoxId) => {
      switch (type) {
        case 'input':
          this.boxes[startBoxId].handle.x = x;
          this.boxes[startBoxId].handle.y = y;
          break;
        case 'output':
          this.boxes[endBoxId].handle.x = x;
          this.boxes[endBoxId].handle.y = y;
          break;
      }
      return {
        startX: this.boxes[startBoxId].handle.x,
        startY: this.boxes[startBoxId].handle.y,
        endX: this.boxes[endBoxId].handle.x,
        endY: this.boxes[endBoxId].handle.y
      };
    };
    this.curve = getCurrentCurve();
    let boxId = _.findIndex(this.boxes, (o) => o.id === id);
    if (this.boxes[boxId].id === this.boxes[boxId].link.start) {
      let endBoxId = _.findIndex(this.boxes, (o) => o.id === this.boxes[boxId].link.end);
      coordinates = getLinkCoordinates('input', boxId, endBoxId);
      console.debug('dragging input element - coordinates ', coordinates);
    } else {
      let startBoxId = _.findIndex(this.boxes, (o) => o.id === this.boxes[boxId].link.start);
      coordinates = getLinkCoordinates('output', startBoxId, boxId);
      console.debug('dragging output element - coordinates ', coordinates);
    }
    this.drawLink(coordinates);
  }

  drawLink(coordinates) {
    console.debug('drawLink ', coordinates);
    const attrs = `
      M${coordinates.startX} ${coordinates.startY}
      C${coordinates.startX + 200} ${coordinates.startY + 40}
      ${coordinates.endX - 50} ${coordinates.endY}
      ${coordinates.endX} ${coordinates.endY}
    `;
    angular.element(this.curve).attr('d', attrs);
  }

  addNewBox(x, y, type) {
    console.debug('addNewBox ', x, y, type);
    let handleX;
    let handleY;
    const svg = this.$element.find('svg');
    let newBoxMarkup = `
    <g box
        id="b${this.boxes.length}"
        type="${type}"
        left="${x - EDITOR.position.x}"
        top="${y - EDITOR.position.y}"
        width="${BOX.width}"
        height="${BOX.height}"
        is-connected="false"
        on-move="$ctrl.updateLink(id, x, y)">
    </g>
    `;
    switch (type) {
      case 'input':
        handleX = x - EDITOR.position.x + BOX.width - 10;
        handleY = y - EDITOR.position.y + ( BOX.height / 2 ) - 3;
        break;
      case 'output':
        handleX = x - EDITOR.position.x;
        handleY = y - EDITOR.position.y + ( BOX.height / 2 ) - 3;
    }
    let newBox = this.$compile(newBoxMarkup)(this.$scope);
    //update DOM
    svg.append(newBox);
    //update Model
    this.boxes.push({
      id: `b${this.boxes.length}`,
      isConnected: false,
      link: {},
      handle: {
        x: handleX,
        y: handleY
      }
    });
    console.debug('this.boxes', this.boxes);
  }

}

export default {
  bindings: {},
  controller: SVGEditor,
  template
};