import angular from 'angular';
import editorComponent from './SVGEditor.component';
import boxModule from '../../directives/Box/';
import draggableModule from '../../directives/Draggable/';

export default angular.module('svgEditor', [
  boxModule.name,
  draggableModule.name
])
  .component('svgEditor', editorComponent);