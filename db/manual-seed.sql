INSERT into users (user_id, fullname, email, username, password) VALUES
(1, 'victoria', 'v@gmail.com', 'victoria', 'password');

INSERT into trips (trip_id, user_id, name, destination, description, arrival, departure) VALUES
(100, 1, 'US Trip', 'Los Angeles', 'fun in the sun', 08/01/2018, 08/15/2018)

INSERT into accommodations (accommodation_id, trip_id, user_id, name, refNum, checkIn, checkOut)VALUES
(1000, 100, 1, 'Sofitel LA', 'ABC123', 08/02/2018, 08/15/2018)

INSERT into flights (flight_id, trip_id, user_id, IncomingDepartureTime, IncomingArrivalTime, IncomingDepartureAirport, IncomingArrivalAirport, IncomingFlightNum, OutgoingDepartureTime, OutgoingArrivalTime, OutgoingDepartureAirport, OutgoingArrivalAirport, OutgoingFlightNum) VALUES
(10000, 100, 1, '2018-09-30 13:10:00', '2018-09-30 14:10:00', 'FJK', 'GTW', 1234, '2018-10-30 12:10:00', '2018-10-31 15:10:00', 'GTW', 'FJK', 4321)

INSERT into plans (plan_id, trip_id, date, description) VALUES
(100000, 100, 08/02/2018, 'walking down melrose')

INSERT into budgets (budget_id, totalBudget, curretSpending) VALUES 
(33331, 5000, 2000)