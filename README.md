
# Student Enrollment System — JsonPowerDB Mini Project
Title of the Project

Student Enrollment Form using JsonPowerDB

# Description

This mini project is a web-based Student Enrollment Form developed using HTML, CSS, JavaScript, jQuery, and JsonPowerDB (JPDB).
The project stores student information in the STUDENT-TABLE relation of the SCHOOL-DB database.

The system uses Roll No as the primary key and supports:

Creating new student records

Updating existing student records

Resetting the form

The application communicates directly with JsonPowerDB using IML and IRL commands through AJAX, without requiring any backend server.

# Benefits of using JsonPowerDB

High performance with minimal latency

Schema-less JSON Document DB

Simple REST-based API for direct frontend integration

Multi-mode database support (Document, Key-Value, Time-Series, Geospatial)

Low code development — fast implementation

Ideal for real-time applications

Supports Index Manipulation Language (IML) and Index Retrieval Language (IRL) for simplified CRUD

Removes the need for backend scripting

# Release History
Version	Description
1.0	Initial release of the Student Enrollment JPDB Mini Project (HTML + JS + JPDB integration).
Additional Sections
# Table of Contents

Title

Description

Benefits of JsonPowerDB

Release History

Scope of Functionalities

Examples of Use

Project Status

Sources

Other Information

# Scope of Functionalities

Accepts student details:

Roll No

Full Name

Class

Birth Date

Address

Enrollment Date

Checks if Roll No exists in JPDB

If NOT found → enables Save

If found → loads record and enables Update

Performs Save (PUT) and Update operations using JPDB

Uses AJAX for all database interactions

Includes a Reset feature to return the form to its initial state

Entire logic runs on the client side (no backend needed)

# Examples of Use

Open the project in a browser (via NetBeans server).

Enter a Roll No:

If new → fields open for new entry → click Save

If existing → data loads automatically → modify → click Update

Click Reset to clear and restart.

View stored data in JPDB dashboard under:

SCHOOL-DB → STUDENT-TABLE

# Project Status

✔ Fully functional
✔ Tested with real JsonPowerDB API
✔ Meets all required problem statement rules

# Future enhancements :

Delete functionality

Search by name or class

Display all records in a table

Improved UI with Bootstrap 5

Sources

JsonPowerDB Documentation: https://login2explore.com

jpdb-commons.js API reference

MDN Web Docs for JavaScript & AJAX

Bootstrap documentation

Other Information

Works entirely in the browser—no backend needed

Designed for academic mini-project / assignment submission

Primary Key used: Roll No

Database: SCHOOL-DB

Relation: STUDENT-TABLE

Token used for API access is configured inside JavaScript
