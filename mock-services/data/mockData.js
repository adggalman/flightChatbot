// mock-services/data/mockData.js

const flightOffers = [
    // 2-3 offers using the Amadeus shape, your own routes/dates/prices
    {
        "type": "flight-offer",
        "id": "1",
        "source": "GDS",
        "instantTicketingRequired": false,
        "nonHomogeneous": false,
        "oneWay": true,
        "isUpsellOffer": false,
        "lastTicketingDate": "2026-02-28",
        "lastTicketingDateTime": "2026-02-28",
        "numberOfBookableSeats": 9,
        "itineraries": [
            {
                "duration": "PT33H00M",
                "segments": [
                    {
                        "departure": {
                            "iataCode": "MNL",
                            "terminal": "3",
                            "at": "2026-02-28T11:15:00"
                        },
                        "arrival": {
                            "iataCode": "KUL",
                            "terminal": "2",
                            "at": "2026-02-28T15:15:00"
                        },
                        "carrierCode": "AK",
                        "number": "583",
                        "aircraft": {
                            "code": "320"
                        },
                        "operating": {
                            "carrierCode": "AK"
                        },
                        "duration": "PT4H00M",
                        "id": "3",
                        "numberOfStops": 0,
                        "blacklistedInEU": false
                    },
                    {
                        "departure": {
                            "iataCode": "KUL",
                            "terminal": "1",
                            "at": "2026-03-01T13:15:00"
                        },
                        "arrival": {
                            "iataCode": "ALA",
                            "at": "2026-03-01T18:15:00"
                        },
                        "carrierCode": "D7",
                        "number": "111",
                        "aircraft": {
                            "code": "320"
                        },
                        "operating": {
                            "carrierCode": "D7"
                        },
                        "duration": "PT7H00M",
                        "id": "4",
                        "numberOfStops": 0,
                        "blacklistedInEU": false
                    }

                ]
            }
        ],
        "price": {
            "currency": "PHP",
            "total": "3566.12",
            "base": "2899.00",
            "fees": [
                {
                    "amount": "0.00",
                    "type": "SUPPLIER"
                },
                {
                    "amount": "0.00",
                    "type": "TICKETING"
                }
            ],
            "grandTotal": "3566.12"
        },
        "pricingOptions": {
            "fareType": [
                "PUBLISHED"
            ],
            "includedCheckedBagsOnly": true
        },
        "validatingAirlineCodes": [
            "AK"
        ],
        "travelerPricings": [
            {
                "travelerId": "1",
                "fareOption": "STANDARD",
                "travelerType": "ADULT",
                "price": {
                    "currency": "PHP",
                    "total": "3474.56",
                    "base": "2212.00"
                },
                "fareDetailsBySegment": [
                    {
                        "segmentId": "3",
                        "cabin": "ECONOMY",
                        "fareBasis": "ESPAU",
                        "class": "E",
                        "includedCheckedBags": {
                            "weight": 40,
                            "weightUnit": "KG"
                        },
                        "includedCabinBags": {
                            "weight": 7,
                            "weightUnit": "KG"
                        }
                    },
                    {
                        "segmentId": "4",
                        "cabin": "ECONOMY",
                        "fareBasis": "ESP",
                        "class": "E",
                        "includedCheckedBags": {
                            "weight": 40,
                            "weightUnit": "KG"
                        },
                        "includedCabinBags": {
                            "weight": 7,
                            "weightUnit": "KG"
                        }
                    }
                ]
            },
            {
                "travelerId": "2",
                "fareOption": "STANDARD",
                "travelerType": "ADULT",
                "price": {
                    "currency": "PHP",
                    "total": "474.56",
                    "base": "212.00"
                },
                "fareDetailsBySegment": [
                    {
                        "segmentId": "3",
                        "cabin": "ECONOMY",
                        "fareBasis": "ESPAU",
                        "class": "E",
                        "includedCheckedBags": {
                            "weight": 40,
                            "weightUnit": "KG"
                        },
                        "includedCabinBags": {
                            "weight": 7,
                            "weightUnit": "KG"
                        }
                    },
                    {
                        "segmentId": "4",
                        "cabin": "ECONOMY",
                        "fareBasis": "ESP",
                        "class": "E",
                        "includedCheckedBags": {
                            "weight": 40,
                            "weightUnit": "KG"
                        },
                        "includedCabinBags": {
                            "weight": 7,
                            "weightUnit": "KG"
                        }
                    }
                ]
            }
        ]
    }
];

const dictionaries = {
    // locations, aircraft, currencies, carriers

    "locations": {
        "MNL": {
            "cityCode": "MNL",
            "countryCode": "PH"
        },
        "KUL": {
            "cityCode": "KUL",
            "countryCode": "MY"
        },
        "ALA": {
            "cityCode": "ALA",
            "countryCode": "KZ"
        }
    },
    "currencies": {
        "PHP": "PHILIPPINE PESO",
        "EUR": "EURO",
        "USD": "US DOLLARS",
        "MYR": "MALAYSIAN RINGGIT",
        "KZT": "KAZAKHSTAN TENGE"
    },
    "carriers": {
        "VJ": "VIETJET AVIATION",
        "OD": "BATIK AIR MALAYSIA",
        "ID": "BATIK AIR INDONESIA",
        "AK": "AIRASIA",
        "Z2": "PHILIPPINES AIRASIA",
        "D7": "AIRASIA X"
    },
    "aircraft": {
        "320": "AIRBUS 320",
        "737": "BOEING 737"
    }
};

// Helpers
function generatePNR() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}


function generateOrderId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;

}
module.exports = { flightOffers, dictionaries, generatePNR, generateOrderId };