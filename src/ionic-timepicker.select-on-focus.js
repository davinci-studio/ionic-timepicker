(function () {
    'use strict';

    angular.module('ionic-timepicker')
            .directive('selectOnFocus', selectOnFocus);

    selectOnFocus.$inject = ['$timeout'];
    function selectOnFocus($timeout) {
        return {
            restrict: 'A',
            scope: {
                nextField: '@?'
            },
            require: 'ngModel',
            link: function (scope, element, attributes, controller) {
                console.log('directive init');
                var focused = false;
                var SWITCH_EVENT = 'FIELD_SWITCHED';
                var maxLength = Number(attributes.maxlength) || 0;

                function elementSelectAll(elem) {
                    elem.setSelectionRange(0, elem.value.length);
                }
                function focusHandler() {
                    console.log('focused');
                    focused = true;
                    $timeout(elementSelectAll, 0, false, this);
                }
                function blurHandler() {
                    console.log('blured');
                    focused = false;
                    while (maxLength && getValue().length < maxLength) {
                        controller.$setViewValue('0' + controller.$viewValue);
                        controller.$render();
                    }
                }
                function getValue() {
                    return controller.$viewValue;
                }

                element.on('focus', focusHandler);
                element.on('blur', blurHandler);

                scope.$on(SWITCH_EVENT, function (event, fieldId) {
                    if (fieldId === attributes.id) {
                        element[0].focus();
                    }
                });

                if (scope.nextField && maxLength) {
                    scope.$watch(getValue, function (newValue) {
                        if (focused && newValue.length >= maxLength) {
                            scope.$parent.$broadcast(SWITCH_EVENT, scope.nextField);
                        }
                    });
                }
            }
        };
    }

})();
