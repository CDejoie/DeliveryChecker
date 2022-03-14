const args = process.argv.slice(2);
const rawDeliveries: [number, number][] = JSON.parse(args[0]);
const truckPath: number[] = JSON.parse(args[1]);

type ErrorCode =
  | "delivery_address_not_in_path"
  | "delivery_dropoff_before_pickup";

interface DeliveryError {
  status: string;
  error_code: ErrorCode;
  error_message: string;
}

let errors: DeliveryError[] = [];

type ActionType = "pickup" | "dropoff" | "null";

interface Step {
  address: number;
  action: ActionType;
}

let steps: Step[] = [];

interface Delivery {
  pickup: {
    address: number;
    done: boolean;
  };
  dropoffAddress: number;
}

let deliveries: Delivery[] = rawDeliveries.map((rawDelivery) => ({
  pickup: { address: rawDelivery[0], done: false },
  dropoffAddress: rawDelivery[1],
}));

const addError = (errorCode: ErrorCode, errorMessage: string) => {
  errors = [
    ...errors,
    { status: "error", error_code: errorCode, error_message: errorMessage },
  ];
};

const addDeliveryAddressNotInPathErrorMessage = (address: number) =>
  addError(
    "delivery_address_not_in_path",
    `The delivery address ${address} is not in the truck path`
  );

const addDeliveryDropoffBeforePickupErrorMessage = (
  pickupAddress: number,
  dropoffAddress: number
) =>
  addError(
    "delivery_dropoff_before_pickup",
    `The delivery that you have to dropoff at the address ${dropoffAddress} is not plan to be picked up before at the address ${pickupAddress}`
  );

const printErrorsMessage = () =>
  errors.forEach((error) =>
    console.error(
      JSON.stringify(
        {
          status: error.status,
          error_code: error.error_code,
          error_message: error.error_message,
        },
        null,
        "\t"
      )
    )
  );

const addNewStep = (address: number, action: ActionType) =>
  (steps = [...steps, { address: address, action: action }]);

const printPathSteps = () => {
  console.log(
    JSON.stringify(
      {
        status: "success",
        steps,
      },
      null,
      "\t"
    )
  );
};

const checkIfDeliveryAddressesAreInPath = () =>
  deliveries.forEach((delivery) => {
    if (!truckPath.includes(delivery.pickup.address)) {
      addDeliveryAddressNotInPathErrorMessage(delivery.pickup.address);
    }
    if (!truckPath.includes(delivery.dropoffAddress)) {
      addDeliveryAddressNotInPathErrorMessage(delivery.dropoffAddress);
    }
  });

const computePathSteps = () => {
  for (let pathAddress of truckPath) {
    const matchingDeliveryIndex = deliveries.findIndex(
      (delivery) =>
        delivery.pickup.address === pathAddress ||
        delivery.dropoffAddress === pathAddress
    );

    if (matchingDeliveryIndex === -1) {
      addNewStep(pathAddress, "null");
      continue;
    }

    const matchingDelivery = deliveries[matchingDeliveryIndex];
    if (
      matchingDelivery.dropoffAddress === pathAddress &&
      !matchingDelivery.pickup.done
    ) {
      addDeliveryDropoffBeforePickupErrorMessage(
        matchingDelivery.pickup.address,
        matchingDelivery.dropoffAddress
      );
      continue;
    }

    if (matchingDelivery.pickup.address === pathAddress) {
      addNewStep(pathAddress, "pickup");
      let newMatchingDelivery = matchingDelivery;
      newMatchingDelivery.pickup.done = true;
      deliveries[matchingDeliveryIndex] = newMatchingDelivery;
    } else {
      addNewStep(pathAddress, "dropoff");
    }
  }
};

checkIfDeliveryAddressesAreInPath();
if (errors.length) printErrorsMessage();
else {
  computePathSteps();
  if (errors.length) printErrorsMessage();
  else printPathSteps();
}
