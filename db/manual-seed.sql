DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS accommodations;
DROP TABLE IF EXISTS flights;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS plans;
DROP TABLE IF EXISTS users_trips;
DROP TABLE IF EXISTS users_flights;
DROP TABLE IF EXISTS accommodations_users;

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
    description text NOT NULL
);
CREATE TABLE budgets (
    id serial PRIMARY KEY,
    totalBudget int,
    currentSpending int
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
    trip_id int REFERENCES trips (id) ON UPDATE CASCADE ON DELETE CASCADE,
    accommodation_id int REFERENCES accommodations (id) ON UPDATE CASCADE,
    CONSTRAINT accommodations_users_pkey PRIMARY KEY (user_id, trip_id, accommodation_id)
);
-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!
INSERT into users ( fullname, email, username, password) VALUES
('victoria', 'v@gmail.com', 'victoria', 'password');

INSERT into trips (user_id, name, destination, description, arrival, departure) VALUES
(1, 'US Trip', 'Los Angeles', 'fun in the sun', TO_DATE('30/09/2018','DD/MM/YYYY'), TO_DATE('30/10/2018','DD/MM/YYYY'));

INSERT into accommodations (trip_id, name, refNum, checkIn, checkOut)VALUES
(1, 'Sofitel LA', 'ABC123', TO_DATE('30/09/2018','DD/MM/YYYY'), TO_DATE('30/10/2018','DD/MM/YYYY'));

INSERT into flights ( trip_id, user_id, IncomingDepartureTime, IncomingArrivalTime, IncomingDepartureAirport, IncomingArrivalAirport, IncomingFlightNum, OutgoingDepartureTime, OutgoingArrivalTime, OutgoingDepartureAirport, OutgoingArrivalAirport, OutgoingFlightNum) VALUES
( 1, 1, TO_DATE('30/09/2018','DD/MM/YYYY'), TO_DATE('30/09/2018','DD/MM/YYYY'), 'FJK', 'GTW', 1234, TO_DATE('30/10/2018','DD/MM/YYYY'), TO_DATE('30/10/2018','DD/MM/YYYY'), 'GTW', 'FJK', 4321);

INSERT into plans (trip_id, date, description) VALUES
(1, TO_DATE('02/10/2018','DD/MM/YYYY'), 'walking down melrose');

INSERT into budgets (totalBudget, currentSpending) VALUES
(5000, 2000);

INSERT into users ( fullname, email, username, password) VALUES
('bianca', 'b@gmail.com', 'bianca', 'password123');

INSERT into trips (user_id, name, destination, description, arrival, departure) VALUES
(2, 'US Trip', 'Los Angeles', 'fun in the sun', TO_DATE('30/09/2018','DD/MM/YYYY'), TO_DATE('30/10/2018','DD/MM/YYYY'));

INSERT into accommodations (trip_id, name, refNum, checkIn, checkOut)VALUES
(1, 'Hilton', '1234ABC', TO_DATE('30/09/2018','DD/MM/YYYY'), TO_DATE('30/10/2018','DD/MM/YYYY'));

INSERT into flights (trip_id, user_id, IncomingDepartureTime, IncomingArrivalTime, IncomingDepartureAirport, IncomingArrivalAirport, IncomingFlightNum, OutgoingDepartureTime, OutgoingArrivalTime, OutgoingDepartureAirport, OutgoingArrivalAirport, OutgoingFlightNum) VALUES
(1, 2, TO_DATE('30/09/2018','DD/MM/YYYY'), TO_DATE('30/09/2018','DD/MM/YYYY'), 'FJK', 'GTW', 1234, TO_DATE('30/10/2018','DD/MM/YYYY'), TO_DATE('30/10/2018','DD/MM/YYYY'), 'GTW', 'FJK', 4321);

INSERT into plans (trip_id, date, description) VALUES
(1, TO_DATE('02/10/2018','DD/MM/YYYY'), 'walking down melrose');

INSERT into budgets (totalBudget, currentSpending) VALUES
(5000, 2000);

INSERT into users_trips (user_id, trip_id, status, flight_id) VALUES
(1, 1, 0, 1)

INSERT into users_flights (user_id, flight_id) VALUES
(1, 1)

INSERT into accommodations_users (user_id, accommodation_id) VALUES
(1, 1)

INSERT into users_trips (user_id, trip_id, status, flight_id) VALUES
(2, 1, 0, 1)

INSERT into users_flights (user_id, flight_id) VALUES
(2, 1)

INSERT into accommodations_users (user_id, accommodation_id) VALUES
(2, 1)
