DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS accommodations;
DROP TABLE IF EXISTS flights;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS plans;

CREATE TABLE users (
    user_id serial PRIMARY KEY,
    fullname text NOT NULL,
    email text NOT NULL UNIQUE,
    username text NOT NULL UNIQUE,
    password text NOT NULL
);

CREATE TABLE trips (
    trip_id serial PRIMARY KEY,
    user_id int REFERENCES users ON DELETE CASCADE,
    name text NOT NULL,
    destination text,
    description text,
    arrival date,
    departure date 
);
CREATE TABLE accommodations (
    accommodation_id serial PRIMARY KEY,
    trip_id int REFERENCES trips,
    user_id int REFERENCES users ON DELETE CASCADE,
    name text,
    refNum text,
    checkIn date,
    checkOut date
);
CREATE TABLE flights ( 
    flight_id serial PRIMARY KEY,
    trip_id int REFERENCES trips,
    user_id int REFERENCES users ON DELETE CASCADE,
    incomingDepartureTime TIMESTAMP, 
    incomingArrivalTime TIMESTAMP, 
    incomingDepartureAirport text, 
    incomingArrivalAirport text, 
    incomingFlightNum int, 
    outgoingDepartureTime TIMESTAMP, 
    outgoingArrivalTime TIMESTAMP, 
    outgoingDepartureAirport text, 
    outgoingArrivalAirport text, 
    outgoingFlightNum int 
);
CREATE TABLE plans ( 
    plan_id serial PRIMARY KEY,
    trip_id int REFERENCES trips,
    date DATE, 
    description text NOT NULL 
);
CREATE TABLE budgets ( 
    budget_id serial PRIMARY KEY, 
    totalBudget int, 
    currentSpending int 
);
CREATE TABLE users_trips (
    user_id int REFERENCES users (user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    trip_id int REFERENCES trips (trip_id) ON UPDATE CASCADE,
    status numeric NOT NULL DEFAULT 0,
    CONSTRAINT user_trip_pkey PRIMARY KEY (user_id, trip_id)
);
CREATE TABLE users_flights (
    user_id int REFERENCES users (user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    flight_id int REFERENCES flights (flight_id) ON UPDATE CASCADE,
    CONSTRAINT users_flights_pkey PRIMARY KEY (user_id, flight_id)
);
CREATE TABLE accommodations_users (
    user_id int REFERENCES users (user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    accommodation_id int REFERENCES accommodations (accommodations_id) ON UPDATE CASCADE,
    CONSTRAINT accommodations_users_pkey PRIMARY KEY (user_id, accommodations_id)
);
