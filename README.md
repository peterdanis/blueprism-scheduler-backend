# Blue Prism scheduler - backend

Node.js based alternative to Blue Prism's built-in scheduler.

## Overview

Project consists of 3 parts:

- web app
- centralized scheduler
- interface to Blueprism, running on each runtime resource

Scheduler sends instruction which process to run and when via HTTP/HTTPS to API endpoint running on each runtime resource (Blue Prism's term for computer executing the automation), which serves as an interface between HTTP/HTTPS calls and "AutomateC.exe" (part of default Blue Prism installation).

## Explanation of schedules, tasks, jobs and steps

- schedule is a container of one or more tasks, expected to run at certain time
- task is an instruction which Blueprism process to run
- job is a particular instance of a schedule (e.g. when a schedule is due to run, an instance of it will be created and inserted into job queue)
- step is a particular instance of task, tied to a particular job execution

## Features

### Must have

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

### Nice to have

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
- [ ] timezone support
- [ ] maintenance mode

### Stretch goal

- [ ] convert tasks from Blueprism scheduler
- [ ] define multiple runtime resources per schedule - run job on whichever runtime resource will become free first
- [ ] link job/steps to session log in Blueprism database

<br/>
<br/>

---

## Disclaimer

All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.
