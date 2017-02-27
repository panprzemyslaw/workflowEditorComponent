import angular from 'angular';
import workflowEditorModule from '../SVGEditor'
import mainComponent from './Main.component';

export default angular.module('main', [workflowEditorModule.name])
  .component('main', mainComponent);