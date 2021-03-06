angular.module('blocktrail.wallet')
    .controller('PromoCodeRedeemCtrl', function($scope, $rootScope, sdkService, $btBackButtonDelegate, $q, $timeout, Wallet) {
        $scope.appControl = {
            working: false,
            showMessage: false
        };
        $scope.promoCodeInput = {
            code: null,             //promo code
            address: null,          //redemption address
            uuid: device.uuid,      //unique device id     //nocommit
            platform: $rootScope.isIOS && "iOS" || "Android",
            version: $rootScope.appVersion
        };
        $scope.message = {
            title: "",
            title_class: "",
            body: "",
            body_class: ""
        };

        $scope.showMessage = function() {
            $scope.appControl.showMessage = true;
            //set alternative back button function (just fires once)
            $btBackButtonDelegate.setBackButton(function() {
                $timeout(function() {
                    $scope.dismissMessage();
                });
            }, true);
            $btBackButtonDelegate.setHardwareBackButton(function() {
                $timeout(function() {
                    $scope.dismissMessage();
                });
            }, true);
        };

        $scope.dismissMessage = function() {
            $scope.appControl.showMessage = false;
            //reset back button functionality
            $btBackButtonDelegate.setBackButton($btBackButtonDelegate._default);
            $btBackButtonDelegate.setHardwareBackButton($btBackButtonDelegate._default);
        };

        $scope.resetMessage = function() {
            $scope.message = {
                title: "",
                title_class: "",
                body: "",
                body_class: ""
            };
        };


        $scope.confirmInput = function() {
            if ($scope.appControl.working) {
                return false;
            }

            //validate and cleanup
            if (!$scope.promoCodeInput.code) {
                $scope.message = {title: 'ERROR_TITLE_2', title_class: 'text-bad', body: 'MSG_MISSING_PROMO_CODE'};
                return false;
            }

            //generate redemption address then send promo code
            $scope.message = {title: 'CHECKING', title_class: 'text-neutral', body: ''};
            $scope.appControl.working = true;
            $scope.showMessage();
            $q.when($scope.promoCodeInput.address || Wallet.getNewAddress())
                .then(function(address) {
                    $scope.promoCodeInput.address = address;
                    return $q.when(sdkService.sdk());
                })
                .then(function(sdk) {
                    return sdk.redeemPromoCode($scope.promoCodeInput);
                })
                .then(function(result) {
                    $timeout(function(){
                        $scope.dismissMessage();

                        $timeout(function(){
                            $scope.message = {title: 'THANKS_1', title_class: 'text-good', body: result.msg};
                            $scope.promoCodeInput.code = '';
                            $scope.appControl.working = false;
                        }, 400);
                    }, 200);
                })
                .catch(function(err) {
                    $timeout(function(){
                        $scope.dismissMessage();

                        $timeout(function(){
                            $scope.message = {title: 'SORRY', title_class: 'text-bad', body: err.message || err};
                            $scope.appControl.working = false;
                        }, 400);
                    }, 200);
                });
        };
    }
);
