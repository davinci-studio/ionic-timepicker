//By Rajeshwar Patlolla
//https://github.com/rajeshwarpatlolla

(function () {
  'use strict';

  angular.module('ionic-timepicker')
    .directive('ionicTimepicker', ionicTimepicker);

  ionicTimepicker.$inject = ['$ionicPopup', '$interval'];
  function ionicTimepicker($ionicPopup, $interval) {
    return {
      restrict: 'AE',
      replace: true,
      scope: {
        inputObj: "=inputObj"
      },
      link: function (scope, element, attrs) {

        var currentEpoch = ((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60);

        //set up base variables and options for customization
        scope.inputEpochTime = scope.inputObj.inputEpochTime ? scope.inputObj.inputEpochTime : currentEpoch;
        scope.step = scope.inputObj.step ? scope.inputObj.step : 15;
        scope.format = scope.inputObj.format ? scope.inputObj.format : 24;
        scope.titleLabel = scope.inputObj.titleLabel ? scope.inputObj.titleLabel : 'Time Picker';
        scope.setLabel = scope.inputObj.setLabel ? scope.inputObj.setLabel : 'Set';
        scope.closeLabel = scope.inputObj.closeLabel ? scope.inputObj.closeLabel : 'Close';
        scope.setButtonType = scope.inputObj.setButtonType ? scope.inputObj.setButtonType : 'button-positive';
        scope.closeButtonType = scope.inputObj.closeButtonType ? scope.inputObj.closeButtonType : 'button-stable';

        var obj = {epochTime: scope.inputEpochTime, step: scope.step, format: scope.format};
        scope.time = {hours: 0, minutes: 0, meridian: ""};
        var objDate = new Date(obj.epochTime * 1000);       // Epoch time in milliseconds.

        var intervalPromise = null;
        var maxHours = scope.format;

        var oldTime = {
          hours: 0,
          minutes: 0
        };

        //Increasing the hours
        scope.increaseHours = function () {
          scope.time.hours = Number(scope.time.hours);
          if (obj.format == 12) {
            if (scope.time.hours != 12) {
              scope.time.hours += 1;
            } else {
              scope.time.hours = 1;
            }
          }
          if (obj.format == 24) {
            scope.time.hours = (scope.time.hours + 1) % 24;
          }
          scope.time.hours = (scope.time.hours < 10) ? ('0' + scope.time.hours) : scope.time.hours;

          scope.parseHours();
        };

        //Decreasing the hours
        scope.decreaseHours = function () {
          scope.time.hours = Number(scope.time.hours);
          if (obj.format == 12) {
            if (scope.time.hours > 1) {
              scope.time.hours -= 1;
            } else {
              scope.time.hours = 12;
            }
          }
          if (obj.format == 24) {
            scope.time.hours = (scope.time.hours + 23) % 24;
          }
          scope.time.hours = (scope.time.hours < 10) ? ('0' + scope.time.hours) : scope.time.hours;

          scope.parseHours();
        };

        //Increasing the minutes
        scope.increaseMinutes = function () {
          scope.time.minutes = Number(scope.time.minutes);
          scope.time.minutes = (scope.time.minutes + obj.step) % 60;
          scope.time.minutes = (scope.time.minutes < 10) ? ('0' + scope.time.minutes) : scope.time.minutes;

          scope.parseMinutes();
        };

        //Decreasing the minutes
        scope.decreaseMinutes = function () {
          scope.time.minutes = Number(scope.time.minutes);
          scope.time.minutes = (scope.time.minutes + (60 - obj.step)) % 60;
          scope.time.minutes = (scope.time.minutes < 10) ? ('0' + scope.time.minutes) : scope.time.minutes;

          scope.parseMinutes();
        };

        //Changing the meridian
        scope.changeMeridian = function () {
          scope.time.meridian = (scope.time.meridian === "AM") ? "PM" : "AM";
        };

        scope.startAutoIncrement = function(incrementFn) {
          if (intervalPromise) {
            return;
          }

          intervalPromise = $interval(incrementFn, 50);
        };

        scope.stopAutoIncrement = function () {
          if (intervalPromise) {
            $interval.cancel(intervalPromise);
            intervalPromise = null;
          }
        };

        scope.parseHours = function() {
          scope.time.hours = validateNumber(oldTime.hours, scope.time.hours, 0, maxHours);
          oldTime.hours = scope.time.hours;
          scope.time.hours = parseTimeNumber(scope.time.hours);
        };

        scope.parseMinutes = function() {
          scope.time.minutes = validateNumber(oldTime.minutes, scope.time.minutes, 0, 60);
          oldTime.minutes = scope.time.minutes;
          scope.time.minutes = parseTimeNumber(scope.time.minutes);
        };

        scope.incHours = function () {
          if (scope.time.hours >= maxHours) {
            scope.time.hours = 0;
          } else {
            scope.time.hours = ++scope.time.hours;
          }

          scope.parseHours();
        };

        function parseTimeNumber(value) {
          value = (parseInt(value) || '').toString();

          while (value.length < 2) {
            value = '0' + value;
          }

          return value;
        }

        function validateNumber(oldValue, newValue, minValue, maxValue) {
          if (newValue === '') {
            return newValue;
          }
          if (isNaN(newValue)) {
            return oldValue;
          }

          newValue = parseInt(newValue);
          if (newValue === maxValue) {
            return minValue;
          }
          if (newValue >= minValue && newValue <= maxValue) {
            return newValue;
          }

          return oldValue;
        }

        //onclick of the button
        element.on("click", function () {
          if (typeof scope.inputObj.inputEpochTime === 'undefined' || scope.inputObj.inputEpochTime === null) {
            objDate = new Date();
          } else {
            objDate = new Date(scope.inputObj.inputEpochTime * 1000);
          }

          if (obj.format == 12) {
            scope.time.meridian = (objDate.getUTCHours() >= 12) ? "PM" : "AM";
            scope.time.hours = (objDate.getUTCHours() > 12) ? ((objDate.getUTCHours() - 12)) : (objDate.getUTCHours());
            scope.time.minutes = (objDate.getUTCMinutes());

            scope.time.hours = (scope.time.hours < 10) ? ("0" + scope.time.hours) : (scope.time.hours);
            scope.time.minutes = (scope.time.minutes < 10) ? ("0" + scope.time.minutes) : (scope.time.minutes);

            if (scope.time.hours === 0 && scope.time.meridian === "AM") {
              scope.time.hours = 12;
            }

            $ionicPopup.show({
              templateUrl: 'ionic-timepicker-12-hour.html',
              title: scope.titleLabel,
              subTitle: '',
              scope: scope,
              buttons: [
                {
                  text: scope.closeLabel,
                  type: scope.closeButtonType,
                  onTap: function (e) {
                    scope.inputObj.callback(undefined);
                  }
                },
                {
                  text: scope.setLabel,
                  type: scope.setButtonType,
                  onTap: function (e) {
                    scope.loadingContent = true;

                    var totalSec = 0;

                    if (scope.time.hours != 12) {
                      totalSec = (scope.time.hours * 60 * 60) + (scope.time.minutes * 60);
                    } else {
                      totalSec = scope.time.minutes * 60;
                    }

                    if (scope.time.meridian === "AM") {
                      totalSec += 0;
                    } else if (scope.time.meridian === "PM") {
                      totalSec += 43200;
                    }
                    scope.etime = totalSec;
                    scope.inputObj.callback(scope.etime);
                  }
                }
              ]
            });

          } else if (obj.format == 24) {

            scope.time.hours = (objDate.getUTCHours());
            scope.time.minutes = (objDate.getUTCMinutes());

            scope.time.hours = (scope.time.hours < 10) ? ("0" + scope.time.hours) : (scope.time.hours);
            scope.time.minutes = (scope.time.minutes < 10) ? ("0" + scope.time.minutes) : (scope.time.minutes);

            $ionicPopup.show({
              templateUrl: 'ionic-timepicker-24-hour.html',
              title: scope.titleLabel,
              subTitle: '',
              scope: scope,
              buttons: [
                {
                  text: scope.closeLabel,
                  type: scope.closeButtonType,
                  onTap: function (e) {
                    scope.inputObj.callback(undefined);
                  }
                },
                {
                  text: scope.setLabel,
                  type: scope.setButtonType,
                  onTap: function (e) {

                    scope.loadingContent = true;

                    var totalSec = 0;

                    if (scope.time.hours != 24) {
                      totalSec = (scope.time.hours * 60 * 60) + (scope.time.minutes * 60);
                    } else {
                      totalSec = scope.time.minutes * 60;
                    }
                    scope.etime = totalSec;
                    scope.inputObj.callback(scope.etime);
                  }
                }
              ]
            });
          }
        });
      }
    };
  }

})();
