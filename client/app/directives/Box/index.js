import angular from 'angular';
import boxDirective from './Box.directive';

export default angular.module('boxModule', [])
  .directive('box', boxDirective.directiveFactory);