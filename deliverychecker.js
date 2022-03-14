var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var args = process.argv.slice(2);
var rawDeliveries = JSON.parse(args[0]);
var truckPath = JSON.parse(args[1]);
var errors = [];
var steps = [];
var deliveries = rawDeliveries.map(function (rawDelivery) { return ({
    pickup: { address: rawDelivery[0], done: false },
    dropoffAddress: rawDelivery[1]
}); });
var addError = function (errorCode, errorMessage) {
    errors = __spreadArray(__spreadArray([], errors, true), [
        { status: "error", error_code: errorCode, error_message: errorMessage },
    ], false);
};
var addDeliveryAddressNotInPathErrorMessage = function (address) {
    return addError("delivery_address_not_in_path", "The delivery address ".concat(address, " is not in the truck path"));
};
var addDeliveryDropoffBeforePickupErrorMessage = function (pickupAddress, dropoffAddress) {
    return addError("delivery_dropoff_before_pickup", "The delivery that you have to dropoff at the address ".concat(dropoffAddress, " is not plan to be picked up before at the address ").concat(pickupAddress));
};
var printErrorsMessage = function () {
    return errors.forEach(function (error) {
        return console.error(JSON.stringify({
            status: error.status,
            error_code: error.error_code,
            error_message: error.error_message
        }, null, "\t"));
    });
};
var addNewStep = function (address, action) {
    return (steps = __spreadArray(__spreadArray([], steps, true), [{ address: address, action: action }], false));
};
var printPathSteps = function () {
    console.log(JSON.stringify({
        status: "success",
        steps: steps
    }, null, "\t"));
};
var checkIfDeliveryAddressesAreInPath = function () {
    return deliveries.forEach(function (delivery) {
        if (!truckPath.includes(delivery.pickup.address)) {
            addDeliveryAddressNotInPathErrorMessage(delivery.pickup.address);
        }
        if (!truckPath.includes(delivery.dropoffAddress)) {
            addDeliveryAddressNotInPathErrorMessage(delivery.dropoffAddress);
        }
    });
};
var computePathSteps = function () {
    var _loop_1 = function (pathAddress) {
        var matchingDeliveryIndex = deliveries.findIndex(function (delivery) {
            return delivery.pickup.address === pathAddress ||
                delivery.dropoffAddress === pathAddress;
        });
        if (matchingDeliveryIndex === -1) {
            addNewStep(pathAddress, "null");
            return "continue";
        }
        var matchingDelivery = deliveries[matchingDeliveryIndex];
        if (matchingDelivery.dropoffAddress === pathAddress &&
            !matchingDelivery.pickup.done) {
            addDeliveryDropoffBeforePickupErrorMessage(matchingDelivery.pickup.address, matchingDelivery.dropoffAddress);
            return "continue";
        }
        if (matchingDelivery.pickup.address === pathAddress) {
            addNewStep(pathAddress, "pickup");
            var newMatchingDelivery = matchingDelivery;
            newMatchingDelivery.pickup.done = true;
            deliveries[matchingDeliveryIndex] = newMatchingDelivery;
        }
        else {
            addNewStep(pathAddress, "dropoff");
        }
    };
    for (var _i = 0, truckPath_1 = truckPath; _i < truckPath_1.length; _i++) {
        var pathAddress = truckPath_1[_i];
        _loop_1(pathAddress);
    }
};
checkIfDeliveryAddressesAreInPath();
if (errors.length)
    printErrorsMessage();
else {
    computePathSteps();
    if (errors.length)
        printErrorsMessage();
    else
        printPathSteps();
}
