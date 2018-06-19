DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS accommodations;
DROP TABLE IF EXISTS flights;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS plans;
DROP TABLE IF EXISTS users_trips;
DROP TABLE IF EXISTS users_flights;
DROP TABLE IF EXISTS accommodations_users;
CREATE TABLE airports (
  id serial PRIMARY KEY,
  AirportName text,
  City text,
  Country text,
  AirportCode text,
  Abv text,
  Latitude double precision,
  Longitude double precision,
  Altitude int,
  Timezone int,
  DST text,
  TimezoneDB text,
  Type text,
  Source text
);


CREATE TABLE users (
    id serial PRIMARY KEY,
    fullname text NOT NULL,
    email text NOT NULL UNIQUE,
    username text NOT NULL UNIQUE,
    password text NOT NULL
);

CREATE TABLE trips (
    id serial PRIMARY KEY,
    user_id int REFERENCES users ON DELETE CASCADE,
    name text NOT NULL,
    destination text,
    description text,
    arrival date,
    departure date
);
CREATE TABLE accommodations (
    id serial PRIMARY KEY,
    trip_id int REFERENCES trips,
    name text,
    refNum text,
    checkIn date,
    checkOut date
);
CREATE TABLE flights (
    id serial PRIMARY KEY,
    trip_id int REFERENCES trips,
    user_id int REFERENCES users ON DELETE CASCADE,
    incomingDepartureTime DATE,
    incomingArrivalTime DATE,
    incomingDepartureAirport text,
    incomingArrivalAirport text,
    incomingFlightNum int,
    outgoingDepartureTime DATE,
    outgoingArrivalTime DATE,
    outgoingDepartureAirport text,
    outgoingArrivalAirport text,
    outgoingFlightNum int
);
CREATE TABLE plans (
    id serial PRIMARY KEY,
    trip_id int REFERENCES trips,
    date DATE,
    description text NOT NULL,
    link text
);
CREATE TABLE budgets (
    id serial PRIMARY KEY,
    trip_id int REFERENCES trips UNIQUE,
    available int
);

CREATE TABLE transactions (
    id serial PRIMARY KEY,
    trip_id int REFERENCES trips,
    description text,
    amount decimal,
    type smallint
);
CREATE TABLE users_trips (
    user_id int REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
    trip_id int REFERENCES trips (id) ON UPDATE CASCADE,
    status numeric NOT NULL DEFAULT 0,
    flight_id int REFERENCES flights (id) ON UPDATE CASCADE,
    CONSTRAINT user_trip_pkey PRIMARY KEY (user_id, trip_id)
);
CREATE TABLE users_flights (
    user_id int REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
    flight_id int REFERENCES flights (id) ON UPDATE CASCADE,
    CONSTRAINT users_flights_pkey PRIMARY KEY (user_id, flight_id)
);
CREATE TABLE accommodations_users (
    user_id int REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
    accommodation_id int REFERENCES accommodations (id) ON UPDATE CASCADE,
    CONSTRAINT accommodations_users_pkey PRIMARY KEY (user_id, accommodation_id)
);
