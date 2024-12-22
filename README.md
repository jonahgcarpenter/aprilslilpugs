# April's Lil Pugs

A 100% under construction project I am developing tailored to the Clients needs and desires. 

## Overview
Modern, responsive website built to showcase and manage a dog breeding business.

## Technologies
- Vite React
- Flask CORS
- MySQL
- Reddis
- RTMPS Server

## Features ( or soon to be )
- Real-time database updates
- Waitlist for users to join and view
- Media Post w/ user comments
- User Reviews
- Email Notifications
- Puppy live stream using a local RTMPS server that converts to HLS for browser viewing

### Admin Specific
- User Bug Reporting
- Notifications for me ( dev/sys admin ) when something is broken on my end
- Moderate comments
- Create Post
- Reply to user reviews
- View/Edit Waitlist
- Add/Edit dog related databases

## TODO

Fully Dockerize for easily deployment on UnRaid for proper deployment

This container should include all aspects of ALP and correctly diffreienciate HTTP/HTTPS servers so that we can use HTTPS for the prod server, and HTTP for the dev server