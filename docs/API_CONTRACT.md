# API Contract & Specifications — PN Tours and Travel

Base URL: `/api/v1`

All responses follow the standard JSON envelope:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "requestId": "req_123456789",
    "timestamp": "2026-09-14T17:50:00.000Z"
  }
}
```

---

## 1. Flight Search & Offers

### `POST /api/v1/flights/search`
Searches for flight itineraries based on origin, destination, dates, cabin, and passengers.

**Request Body:**
```json
{
  "tripType": "ONE_WAY" | "ROUND_TRIP",
  "originCode": "EBB",
  "destinationCode": "DXB",
  "departureDate": "2026-10-15",
  "returnDate": "2026-10-25",
  "cabinClass": "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST",
  "passengers": {
    "adults": 1,
    "children": 0,
    "infants": 0
  },
  "currency": "USD"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "searchId": "sch_8f3a9e01",
    "expiresAt": "2026-09-14T18:20:00.000Z",
    "offersCount": 12,
    "offers": [
      {
        "id": "off_dxb_001",
        "airlineCode": "EK",
        "airlineName": "Emirates",
        "flightNumber": "EK730",
        "originAirport": "EBB",
        "destinationAirport": "DXB",
        "departureTime": "2026-10-15T15:30:00Z",
        "arrivalTime": "2026-10-15T21:45:00Z",
        "durationMinutes": 315,
        "stops": 0,
        "segments": [ ... ],
        "baggageAllowance": "2 x 23kg Checked Bags",
        "refundable": true,
        "price": {
          "currency": "USD",
          "baseFareMinor": 52000,
          "taxesMinor": 8500,
          "feesMinor": 1500,
          "totalMinor": 62000,
          "formattedTotal": "$620.00"
        }
      }
    ]
  }
}
```

### `POST /api/v1/flights/revalidate`
Revalidates offer pricing and seat availability before checkout.

---

## 2. Bookings

### `POST /api/v1/bookings`
Creates a booking draft and holds the reservation.

**Request Body:**
```json
{
  "offerId": "off_dxb_001",
  "contactEmail": "traveler@example.com",
  "contactPhone": "+256785360444",
  "passengers": [
    {
      "type": "ADULT",
      "title": "MR",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1988-04-12",
      "gender": "MALE",
      "passportNumber": "A12345678",
      "passportExpiry": "2030-01-01",
      "nationality": "UG"
    }
  ]
}
```

### `GET /api/v1/bookings/:reference`
Retrieves full booking details, passenger manifests, segments, and ticket issuance status.

---

## 3. Payments & Wallet

### `POST /api/v1/payments/create-intent`
Initializes a payment session for an active booking.

### `POST /api/v1/agent/wallet/debit-booking`
Performs atomic payment for a booking using the agency prepaid wallet.

### `POST /api/v1/agent/wallet/topup`
Requests a wallet deposit top-up (pending finance/admin approval).

---

## 4. Admin & Operations

### `GET /api/v1/admin/dashboard/stats`
Returns system metrics: total bookings, issued tickets, revenue, wallet liabilities, and error rates.

### `GET /api/v1/admin/suppliers/health`
Returns provider health, latency, error status, and mode (`MOCK`, `SANDBOX`, `PRODUCTION`).

### `POST /api/v1/admin/pricing/rules`
Creates or updates a multi-tier markup rule.
