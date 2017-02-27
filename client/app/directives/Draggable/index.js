import angular from 'angular';
import draggableDirective from './Draggable.directive';

export default angular.module('draggableModule', [])
  .directive('draggable', draggableDirective.directiveFactory);
