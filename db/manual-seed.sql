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
    id serial PRIMARY KEY,
    trip_id int REFERENCES trips,
    user_id int REFERENCES users ON DELETE CASCADE,
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
    user_id int REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
    trip_id int REFERENCES trips (id) ON UPDATE CASCADE,
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
-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!
INSERT into users ( fullname, email, username, password) VALUES
('victoria', 'v@gmail.com', 'victoria', 'password');

INSERT into trips (user_id, name, destination, description, arrival, departure) VALUES
(1, 'US Trip', 'Los Angeles', 'fun in the sun', TO_DATE('30/09/2018','DD/MM/YYYY'), TO_DATE('30/10/2018','DD/MM/YYYY'));

INSERT into accommodations (trip_id, user_id, name, refNum, checkIn, checkOut)VALUES
(1, 1, 'Sofitel LA', 'ABC123', TO_DATE('30/09/2018','DD/MM/YYYY'), TO_DATE('30/10/2018','DD/MM/YYYY'));

INSERT into flights (flight_id, trip_id, user_id, IncomingDepartureTime, IncomingArrivalTime, IncomingDepartureAirport, IncomingArrivalAirport, IncomingFlightNum, OutgoingDepartureTime, OutgoingArrivalTime, OutgoingDepartureAirport, OutgoingArrivalAirport, OutgoingFlightNum) VALUES
(10000, 1, 1, TO_DATE('30/09/2018','DD/MM/YYYY'), TO_DATE('30/09/2018','DD/MM/YYYY'), 'FJK', 'GTW', 1234, TO_DATE('30/10/2018','DD/MM/YYYY'), TO_DATE('30/10/2018','DD/MM/YYYY'), 'GTW', 'FJK', 4321);

INSERT into plans (plan_id, trip_id, date, description) VALUES
(100000, 1, TO_DATE('02/10/2018','DD/MM/YYYY'), 'walking down melrose');

INSERT into budgets (totalBudget, currentSpending) VALUES 
(5000, 2000);