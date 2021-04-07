# Blue Prism scheduler - backend

Node.js based alternative to Blue Prism's built-in scheduler.

# The project is still "work in progress" 🚧

## Overview

Project consists of 3 parts:

- web app (not released yet, WIP)
- centralized scheduler (this project)
- interface to Blueprism, running on each runtime resource - (https://github.com/peterdanis/blueprism-automatec-api)

Scheduler sends instruction which process to run and when via HTTP/HTTPS to API endpoint running on each runtime resource (Blue Prism's term for computer executing the automation), which serves as an interface between HTTP/HTTPS calls and "AutomateC.exe" (part of default Blue Prism installation).

## Explanation of schedules, tasks, jobs and steps

- schedule is a container of one or more tasks, expected to run at certain time
- task is an instruction which Blueprism process to run
- job is a particular instance of a schedule (e.g. when a schedule is due to run, an instance of it will be created and inserted into job queue)
- step is a particular instance of task, tied to a particular job execution

## Features

- [x] user authentication with username and password
- [x] store data in separate SQL database
- [x] separate queue for each runtime resource
- [x] if multiple jobs are waiting in queue, start them by priority
- [x] recurrent schedules
- [ ] onetime schedules
- [x] adjustable delay after each task
- [x] hard timeout per task (kill task)
- [ ] force run job with adjustable wait time (for time sensitive schedules, with job priority 0)
- [ ] skip job if maximum wait time in queue reached (schedule setting)
- [ ] send email on error, customizable per schedule
- [x] run from executable on Windows (via https://github.com/vercel/pkg)
- [x] register as service on Windows (via https://github.com/winsw/winsw)
- [x] handle short network or SQL server outages
- [x] view-only user accounts
- [ ] user authentication against domain
- [x] reusable tasks (each task can be part of multiple schedules)
- [x] reset before and after each schedule (clean environment before running schedule plus no need to run Logout)
- [x] soft timeout per task (send "stop" request)
- [ ] multiple onetime / recurrent rules per schedule
- [ ] skip job if multiple jobs of some schedule are queued (schedule setting)
- [ ] custom "on error" actions per task/schedule
- [ ] put resource to maintenance mode (wait/softStop/hardStop options, with job priority -1)
- [ ] drilldown job to steps, to see status of each step
- [x] timezone support
- [ ] maintenance mode
- [ ] convert tasks from Blueprism scheduler
- [ ] define multiple runtime resources per schedule - run job on whichever runtime resource will become free first
- [ ] link job/steps to session log in Blueprism database

---

## Installation

1. download latest version from [https://github.com/peterdanis/blueprism-scheduler-backend/releases/latest](https://github.com/peterdanis/blueprism-scheduler-backend/releases/latest)
2. (optional) generate self-signed HTTPS certificate, using `generate_selfsigned_certificate.bat`
3. rename `sample.env` file to `.env`
4. open `.env` file with any text editor and update settings
5. install it as Windows service, using `install.bat`
6. connect via `http://yourHostname:port`, or directly from same machine via `http://localhost:3000` (or `https://localhost:3000` if you use HTTPS and you did not change the default port)
7. if page is not loading, check logs in `logs` folder for potential errors

## Updating

1. stop `Blue Prism scheduler` service (e.g. via: Win+R key combination, type in `services.msc`, hit Enter, find it in the list)
2. go to folder, where you installed this project
3. delete `webapp` folder
4. download latest version from [https://github.com/peterdanis/blueprism-scheduler-backend/releases/latest](https://github.com/peterdanis/blueprism-scheduler-backend/releases/latest) and overwrite all files
5. start `Blue Prism scheduler` service
6. check logs in `logs` folder for potential errors

---

## Disclaimer

All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.
