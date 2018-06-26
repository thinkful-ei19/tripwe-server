DROP TABLE IF EXISTS accommodations;
DROP TABLE IF EXISTS flights;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS plans;
DROP TABLE IF EXISTS users_trips;
DROP TABLE IF EXISTS users_flights;
DROP TABLE IF EXISTS accommodations_users;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS users;

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
    trip_id int REFERENCES trips ON DELETE CASCADE,
    name text,
    address text,
    reference text,
    arrival date,
    departure date,
    phone int
);
CREATE TABLE flights (
    id serial PRIMARY KEY,
    trip_id int REFERENCES trips,
    user_id int REFERENCES users ON DELETE CASCADE,
    incomingDepartureTime DATE,
    incomingArrivalTime DATE,
    incomingDepartureAirport text,
    incomingDepartureLatitude text,
    incomingDepartureLongitude text,
    incomingArrivalAirport text,
    incomingArrivalLatitude text,
    incomingArrivalLongitude text,
    incomingFlightNum text,
    outgoingDepartureTime DATE,
    outgoingArrivalTime DATE,
    outgoingDepartureAirport text,
    outgoingArrivalAirport text,
    outgoingFlightNum text
);
CREATE TABLE plans (
    id serial PRIMARY KEY,
    trip_id int REFERENCES trips,
    date DATE,
    description text NOT NULL,
    link text
);

CREATE TABLE transactions (
    id serial PRIMARY KEY,
    trip_id int REFERENCES trips,
    description text,
    amount decimal
);
CREATE TABLE trip_invites (
    trip_id int REFERENCES trips,
    date DATE,
    email text NOT NULL,
    status numeric NOT NULL DEFAULT 0
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
    accommodation_id int REFERENCES accommodations (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT accommodations_users_pkey PRIMARY KEY (user_id, trip_id, accommodation_id)
);
-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!

user0 -1
user1 -2
user4 -4
user5 -7
INSERT into budgets (trip_id, available) VALUES
(81, 5000);
INSERT into users ( fullname, email, username, password) VALUES
('victoria', 'v@gmail.com', 'victoria', 'password');

INSERT into trips (user_id, name, destination, description, arrival, departure) VALUES
(7, 'OZ Trip', 'Perth', 'fun in the sun', TO_DATE('15/07/2018','DD/MM/YYYY'), TO_DATE('25/07/2018','DD/MM/YYYY'));

--past trips
INSERT into trips (user_id, name, destination, description, arrival, departure) VALUES
(7, 'Nature and City', 'USA', 'highking in national parks by day, partying in cities by night', TO_DATE('15/07/2016','DD/MM/YYYY'), TO_DATE('25/07/2016','DD/MM/YYYY'));

--future trips
INSERT into trips (user_id, name, destination, description, arrival, departure) VALUES
(7, 'Fire and Ice', 'Iceland', 'Roatrip around Iceland: geysers, volcanoes and icebergs', TO_DATE('15/07/2019','DD/MM/YYYY'), TO_DATE('25/07/2019','DD/MM/YYYY'));


INSERT into accommodations (trip_id, name, reference, arrival, departure, phone, address)VALUES
(1, 'Sofitel LA', 'ABC123', TO_DATE('30/09/2018','DD/MM/YYYY'), TO_DATE('30/10/2018','DD/MM/YYYY'), 1285345, '27 Cranbrook Road');

INSERT into flights ( trip_id, user_id, IncomingDepartureTime, IncomingArrivalTime, IncomingDepartureAirport, IncomingArrivalAirport, IncomingFlightNum, OutgoingDepartureTime, OutgoingArrivalTime, OutgoingDepartureAirport, OutgoingArrivalAirport, OutgoingFlightNum) VALUES
( 1, 1, TO_DATE('30/09/2018','DD/MM/YYYY'), TO_DATE('30/09/2018','DD/MM/YYYY'), 'FJK', 'GTW', 1234, TO_DATE('30/10/2018','DD/MM/YYYY'), TO_DATE('30/10/2018','DD/MM/YYYY'), 'GTW', 'FJK', 4321);

INSERT into plans (trip_id, date, description, link) VALUES
(1, TO_DATE('02/10/2018','DD/MM/YYYY'), 'walking down melrose', 'https://www.tripadvisor.co.uk/Attraction_Review-g32655-d110202-Reviews-Melrose_Avenue-Los_Angeles_California.html');

INSERT into budgets (trip_id) VALUES
(7);

INSERT into users ( fullname, email, username, password) VALUES
('bianca', 'b@gmail.com', 'bianca', 'password123');

INSERT into trips (user_id, name, destination, description, arrival, departure) VALUES
(34, 'US Trip', 'Los Angeles', 'fun in the sun', TO_DATE('30/09/2018','DD/MM/YYYY'), TO_DATE('30/10/2018','DD/MM/YYYY'));

INSERT into accommodations (trip_id, name, refNum, checkIn, checkOut, phone_num)VALUES
(1, 'AirpBnN', '1234ABC', TO_DATE('30/09/2018','DD/MM/YYYY'), TO_DATE('30/10/2018','DD/MM/YYYY'), 07957298374);

INSERT into flights (trip_id, user_id, IncomingDepartureTime, IncomingArrivalTime, IncomingDepartureAirport, IncomingArrivalAirport, IncomingFlightNum, OutgoingDepartureTime, OutgoingArrivalTime, OutgoingDepartureAirport, OutgoingArrivalAirport, OutgoingFlightNum) VALUES
(1, 34, TO_DATE('30/09/2018','DD/MM/YYYY'), TO_DATE('30/09/2018','DD/MM/YYYY'), 'FJK', 'GTW', 1234, TO_DATE('30/10/2018','DD/MM/YYYY'), TO_DATE('30/10/2018','DD/MM/YYYY'), 'GTW', 'FJK', 4321);

INSERT into plans (trip_id, date, description) VALUES
(1, TO_DATE('02/10/2018','DD/MM/YYYY'), 'walking down melrose');

INSERT into budgets (trip_id, totalBudget, currentSpending) VALUES
(1, 5000, 2000);

INSERT into users_trips (user_id, trip_id) VALUES
(3, 1);

INSERT into users_flights (user_id, flight_id) VALUES
(34, 20);

INSERT into accommodations_users (user_id, accommodation_id) VALUES
(26, 3);

INSERT into users_trips (user_id, trip_id) VALUES
(7, 18);

INSERT into users_flights (user_id, flight_id) VALUES
(34, 1);

INSERT into accommodations_users (user_id, accommodation_id) VALUES
(34, 1);
